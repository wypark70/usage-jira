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

import java.io.IOException;
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

        UserCountRequest userCountRequest = getUserCountRequest(configuration);

        try {
            HttpReportUtil.post(userCountApiUrl, userCountApiKey, userCountRequest);
        } catch (IOException e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    private UserCountRequest getUserCountRequest(Configuration configuration) {
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
        log.debug(gson.toJson(userCountRequest));
        return userCountRequest;
    }

    @Override
    public ObjectConfiguration getObjectConfiguration() throws ObjectConfigurationException {
        return getObjectConfiguration("USER_LIST_SERVICE", "object-configurations/user-list-service.xml", null);
    }
}
