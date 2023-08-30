package com.sds.jira.plugin.usage.service;

import com.atlassian.configurable.ObjectConfiguration;
import com.atlassian.configurable.ObjectConfigurationException;
import com.atlassian.jira.component.ComponentAccessor;
import com.atlassian.jira.service.AbstractService;
import com.atlassian.jira.user.util.UserUtil;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.sds.jira.plugin.usage.config.Configuration;
import com.sds.jira.plugin.usage.config.ConfigurationService;
import com.sds.jira.plugin.usage.model.InterfaceSystemInfo;
import com.sds.jira.plugin.usage.model.UserCount;
import com.sds.jira.plugin.usage.model.UserCountRequest;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public class UserCountService extends AbstractService {
    private final Gson gson = new GsonBuilder().setPrettyPrinting().create();
    private final ConfigurationService configurationService = ComponentAccessor.getOSGiComponentInstanceOfType(ConfigurationService.class);
    private final UserUtil userUtil = ComponentAccessor.getOSGiComponentInstanceOfType(UserUtil.class);

    @Override
    public void run() {
        Configuration configuration = configurationService.getConfiguration();
        String userCountApiUrl = configuration.getUserCountApiUrl();
        String userCountApiKey = configuration.getUserCountApiKey();
        InterfaceSystemInfo interfaceSystemInfo = new InterfaceSystemInfo();
        interfaceSystemInfo.setHost(configuration.getHost());
        interfaceSystemInfo.setIp(configuration.getIp());
        interfaceSystemInfo.setPort(configuration.getPort());
        interfaceSystemInfo.setProductCode(configuration.getProductCode());

        List<UserCount> userCountList = new ArrayList<>();
        UserCount userCount = new UserCount();
        userCount.setLookupTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        userCount.setTotal(String.valueOf(userUtil.getTotalUserCount()));
        userCount.setUsage(String.valueOf(userUtil.getActiveUserCount()));
        userCountList.add(userCount);

        UserCountRequest userCountRequest = new UserCountRequest();
        userCountRequest.setInfo(interfaceSystemInfo);
        userCountRequest.setList(userCountList);
        log.debug(">>>>>>> userCountApiUrl: " + userCountApiUrl);
        log.debug(">>>>>>> userCountApiKey: " + userCountApiKey);
        log.debug(gson.toJson(userCountRequest));

        try {
            postUserCountReport(userCountApiUrl, userCountApiKey, userCountRequest);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @SuppressWarnings("DuplicatedCode")
    private void postUserCountReport(String userCountApiUrl, String userCountApiKey, UserCountRequest userCountRequest) throws IOException {
        URL url = new URL(userCountApiUrl);
        HttpURLConnection httpURLConnection = (HttpURLConnection) url.openConnection();

        httpURLConnection.setRequestMethod("POST");
        httpURLConnection.setRequestProperty("Authorization", userCountApiKey);
        httpURLConnection.setRequestProperty("Content-Type", "application/json");
        httpURLConnection.setRequestProperty("Accept", "application/json");
        httpURLConnection.setDoInput(true);
        httpURLConnection.setDoOutput(true);

        try (OutputStream outputStream = httpURLConnection.getOutputStream()) {
            byte[] input = gson.toJson(userCountRequest).getBytes(StandardCharsets.UTF_8);
            outputStream.write(input, 0, input.length);
        }

        try (BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(httpURLConnection.getInputStream(), StandardCharsets.UTF_8))) {
            StringBuilder stringBuilder = new StringBuilder();
            String responseLine = null;
            while ((responseLine = bufferedReader.readLine()) != null) {
                stringBuilder.append(responseLine.trim());
            }
            log.debug(stringBuilder.toString());
        }
    }

    @Override
    public ObjectConfiguration getObjectConfiguration() throws ObjectConfigurationException {
        return getObjectConfiguration("USER_LIST_SERVICE", "object-configurations/user-list-service.xml", null);
    }
}
