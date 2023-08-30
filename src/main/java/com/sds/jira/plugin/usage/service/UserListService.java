package com.sds.jira.plugin.usage.service;

import com.atlassian.configurable.ObjectConfiguration;
import com.atlassian.configurable.ObjectConfigurationException;
import com.atlassian.configurable.ObjectConfigurationFactory;
import com.atlassian.jira.component.ComponentAccessor;
import com.atlassian.jira.service.AbstractService;
import com.atlassian.jira.user.ApplicationUser;
import com.atlassian.jira.user.util.UserUtil;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.sds.jira.plugin.usage.config.Configuration;
import com.sds.jira.plugin.usage.config.ConfigurationService;
import com.sds.jira.plugin.usage.model.InterfaceSystemInfo;
import com.sds.jira.plugin.usage.model.User;
import com.sds.jira.plugin.usage.model.UserListRequest;

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
import java.util.Collection;
import java.util.List;

public class UserListService extends AbstractService {
  private static final String CLASS_NAME = Configuration.class.getName();
  private final Gson gson = new GsonBuilder().setPrettyPrinting().create();
  private final ConfigurationService configurationService = ComponentAccessor.getOSGiComponentInstanceOfType(ConfigurationService.class);
  private final UserUtil userUtil = ComponentAccessor.getOSGiComponentInstanceOfType(UserUtil.class);

  @SuppressWarnings("DuplicatedCode")
  @Override
  public void run() {
    Configuration configuration = configurationService.getConfiguration();

    String userListApiUrl = configuration.getUserListApiUrl();
    String userListApiKey = configuration.getUserListApiKey();
    InterfaceSystemInfo interfaceSystemInfo = new InterfaceSystemInfo();
    interfaceSystemInfo.setHost(configuration.getHost());
    interfaceSystemInfo.setIp(configuration.getIp());
    interfaceSystemInfo.setPort(configuration.getPort());
    interfaceSystemInfo.setProductCode(configuration.getProductCode());

    List<User> userList = new ArrayList<>();
    Collection<ApplicationUser> allUsers = userUtil.getAllApplicationUsers();
    String lookupTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    String tenantCode = configuration.getTenantCode();
    String module = configuration.getModule();
    allUsers.forEach(applicationUser -> {
      User user = new User();
      user.setLookupTime(lookupTime);
      user.setActiveYn(applicationUser.isActive() ? "Y" : "N");
      user.setUserId(applicationUser.getName());
      user.setUserName(applicationUser.getDisplayName());
      user.setTenantCode(tenantCode);
      user.setModule(module);
      userList.add(user);
    });

    UserListRequest userListRequest = new UserListRequest();
    userListRequest.setInfo(interfaceSystemInfo);
    userListRequest.setList(userList);
    log.debug(">>>>>>> userListApiUrl: " + userListApiUrl);
    log.debug(">>>>>>> userListApiKey: " + userListApiKey);
    log.debug(gson.toJson(userListRequest));

    try {
      postUserInfoReport(userListApiUrl, userListApiKey, userListRequest);
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  @SuppressWarnings("DuplicatedCode")
  private void postUserInfoReport(String userListApiUrl, String userListApiKey, UserListRequest userListRequest) throws IOException {
    URL url = new URL(userListApiUrl);
    HttpURLConnection httpURLConnection = (HttpURLConnection) url.openConnection();

    httpURLConnection.setRequestMethod("POST");
    httpURLConnection.setRequestProperty("Authorization", userListApiKey);
    httpURLConnection.setRequestProperty("Content-Type", "application/json");
    httpURLConnection.setDoInput(true);
    httpURLConnection.setDoOutput(true);

    try (OutputStream outputStream = httpURLConnection.getOutputStream()) {
      byte[] input = gson.toJson(userListRequest).getBytes(StandardCharsets.UTF_8);
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

  @SuppressWarnings("DuplicatedCode")
  @Override
  public ObjectConfiguration getObjectConfiguration() throws ObjectConfigurationException {
    ObjectConfigurationFactory objectConfigurationFactory = ComponentAccessor.getComponent(ObjectConfigurationFactory.class);
    return getObjectConfiguration("USER_COUNT_SERVICE", "object-configurations/user-count-service.xml", null);
  }
}
