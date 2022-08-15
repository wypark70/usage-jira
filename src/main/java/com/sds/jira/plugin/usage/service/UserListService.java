package com.sds.jira.plugin.usage.service;

import com.atlassian.configurable.ObjectConfiguration;
import com.atlassian.configurable.ObjectConfigurationException;
import com.atlassian.configurable.ObjectConfigurationFactory;
import com.atlassian.jira.component.ComponentAccessor;
import com.atlassian.jira.service.AbstractService;
import com.atlassian.jira.user.ApplicationUser;
import com.atlassian.jira.user.util.UserUtil;
import com.atlassian.sal.api.pluginsettings.PluginSettings;
import com.atlassian.sal.api.pluginsettings.PluginSettingsFactory;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.sds.jira.plugin.usage.config.UsageJiraConfig;
import com.sds.jira.plugin.usage.domain.SystemInfo;
import com.sds.jira.plugin.usage.domain.UserInfo;
import com.sds.jira.plugin.usage.domain.UserInfoRequest;

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
import java.util.Map;

public class UserListService extends AbstractService {
  private static final String CLASS_NAME = UsageJiraConfig.class.getName();
  private final Gson gson = new GsonBuilder().setPrettyPrinting().create();
  private final PluginSettingsFactory pluginSettingsFactory = ComponentAccessor.getOSGiComponentInstanceOfType(PluginSettingsFactory.class);
  private final UserUtil userUtil = ComponentAccessor.getOSGiComponentInstanceOfType(UserUtil.class);

  @SuppressWarnings("DuplicatedCode")
  @Override
  public void run() {
    PluginSettings settings = pluginSettingsFactory.createGlobalSettings();
    String userListApiUrl = (String) settings.get(CLASS_NAME + ".userListApiUrl");
    String userListApiKey = (String) settings.get(CLASS_NAME + ".userListApiKey");
    SystemInfo systemInfo = new SystemInfo();
    systemInfo.setHost((String) settings.get(CLASS_NAME + ".host"));
    systemInfo.setIp((String) settings.get(CLASS_NAME + ".ip"));
    systemInfo.setPort((String) settings.get(CLASS_NAME + ".port"));
    systemInfo.setProductCode((String) settings.get(CLASS_NAME + ".productCode"));

    List<UserInfo> userInfoList = new ArrayList<>();
    Collection<ApplicationUser> allUsers = userUtil.getAllApplicationUsers();
    String lookupTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
    allUsers.forEach(applicationUser -> {
      UserInfo userInfo = new UserInfo();
      userInfo.setLookupTime(lookupTime);
      userInfo.setActiveYn(applicationUser.isActive() ? "Y" : "N");
      userInfo.setUserId(applicationUser.getName());
      userInfo.setUserName(applicationUser.getDisplayName());
      userInfoList.add(userInfo);
    });

    UserInfoRequest userInfoRequest = new UserInfoRequest();
    userInfoRequest.setInfo(systemInfo);
    userInfoRequest.setList(userInfoList);
    log.debug(">>>>>>> userListApiUrl: " + userListApiUrl);
    log.debug(">>>>>>> userListApiKey: " + userListApiKey);
    log.debug(gson.toJson(userInfoRequest));

    try {
      postUserInfoReport(userListApiUrl, userListApiKey, userInfoRequest);
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  @SuppressWarnings("DuplicatedCode")
  private void postUserInfoReport(String userListApiUrl, String userListApiKey, UserInfoRequest userInfoRequest) throws IOException {
    URL url = new URL(userListApiUrl);
    HttpURLConnection httpURLConnection = (HttpURLConnection) url.openConnection();

    httpURLConnection.setRequestMethod("POST");
    httpURLConnection.setRequestProperty("Authorization", userListApiKey);
    httpURLConnection.setRequestProperty("Content-Type", "application/json");
    httpURLConnection.setDoInput(true);
    httpURLConnection.setDoOutput(true);

    try (OutputStream outputStream = httpURLConnection.getOutputStream()) {
      byte[] input = gson.toJson(userInfoRequest).getBytes(StandardCharsets.UTF_8);
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
    return new ObjectConfiguration() {
      @Override
      public void init(Map map) {

      }

      @Override
      public String getFieldName(String s) throws ObjectConfigurationException {
        return null;
      }

      @Override
      public String getFieldDescription(String s) throws ObjectConfigurationException {
        return null;
      }

      @Override
      public int getFieldType(String s) throws ObjectConfigurationException {
        return 0;
      }

      @Override
      public String getFieldTypeName(String s) throws ObjectConfigurationException {
        return null;
      }

      @Override
      public String getFieldDefault(String s) throws ObjectConfigurationException {
        return null;
      }

      @Override
      public Map getFieldValues(String s) throws ObjectConfigurationException {
        return null;
      }

      @Override
      public Map getFieldValuesHtmlEncoded(String s) throws ObjectConfigurationException {
        return null;
      }

      @Override
      public String[] getFieldKeys() {
        return new String[0];
      }

      @Override
      public String[] getEnabledFieldKeys() {
        return new String[0];
      }

      @Override
      public boolean isEnabled(String s) {
        return false;
      }

      @Override
      public String getDescription(Map map) {
        return null;
      }

      @Override
      public boolean allFieldsHidden() {
        return false;
      }

      @Override
      public boolean isI18NValues(String s) {
        return false;
      }
    };
  }
}
