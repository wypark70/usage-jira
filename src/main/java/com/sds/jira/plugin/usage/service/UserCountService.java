package com.sds.jira.plugin.usage.service;

import com.atlassian.configurable.ObjectConfiguration;
import com.atlassian.configurable.ObjectConfigurationException;
import com.atlassian.jira.component.ComponentAccessor;
import com.atlassian.jira.service.AbstractService;
import com.atlassian.jira.user.util.UserUtil;
import com.atlassian.sal.api.pluginsettings.PluginSettings;
import com.atlassian.sal.api.pluginsettings.PluginSettingsFactory;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.sds.jira.plugin.usage.config.UsageJiraConfig;
import com.sds.jira.plugin.usage.domain.SystemInfo;
import com.sds.jira.plugin.usage.domain.UserCount;
import com.sds.jira.plugin.usage.domain.UserCountRequest;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class UserCountService extends AbstractService {
  private static final String CLASS_NAME = UsageJiraConfig.class.getName();
  private final Gson gson = new GsonBuilder().setPrettyPrinting().create();
  private final PluginSettingsFactory pluginSettingsFactory = ComponentAccessor.getOSGiComponentInstanceOfType(PluginSettingsFactory.class);
  private final UserUtil userUtil = ComponentAccessor.getOSGiComponentInstanceOfType(UserUtil.class);

  @SuppressWarnings("DuplicatedCode")
  @Override
  public void run() {
    PluginSettings settings = pluginSettingsFactory.createGlobalSettings();
    String userCountApiUrl = (String) settings.get(CLASS_NAME + ".userCountApiUrl");
    String userCountApiKey = (String) settings.get(CLASS_NAME + ".userCountApiKey");
    SystemInfo systemInfo = new SystemInfo();
    systemInfo.setHost((String) settings.get(CLASS_NAME + ".host"));
    systemInfo.setIp((String) settings.get(CLASS_NAME + ".ip"));
    systemInfo.setPort((String) settings.get(CLASS_NAME + ".port"));
    systemInfo.setProductCode((String) settings.get(CLASS_NAME + ".productCode"));

    List<UserCount> userCountList = new ArrayList<>();
    UserCount userCount = new UserCount();
    userCount.setLookupTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
    userCount.setTotal(String.valueOf(userUtil.getTotalUserCount()));
    userCount.setUsage(String.valueOf(userUtil.getActiveUserCount()));
    userCountList.add(userCount);

    UserCountRequest userCountRequest = new UserCountRequest();
    userCountRequest.setInfo(systemInfo);
    userCountRequest.setList(userCountList);
    System.out.println(">>>>>>> userCountApiUrl: " + userCountApiUrl);
    System.out.println(">>>>>>> userCountApiKey: " + userCountApiKey);
    System.out.println(gson.toJson(userCountRequest));
    postUserCountReport(userCountApiUrl, userCountApiKey, userCountRequest);
  }

  @SuppressWarnings("DuplicatedCode")
  private void postUserCountReport(String userCountApiUrl, String userCountApiKey, UserCountRequest userCountRequest) {
    try {
      URL url = new URL(userCountApiUrl);
      HttpURLConnection httpURLConnection = (HttpURLConnection) url.openConnection();

      httpURLConnection.setRequestMethod("POST");
      httpURLConnection.setRequestProperty("Authorization", userCountApiKey);
      httpURLConnection.setRequestProperty("Content-Type", "application/json");
      httpURLConnection.setDoInput(true);
      httpURLConnection.setDoOutput(true);

      BufferedWriter bufferedWriter = new BufferedWriter(new OutputStreamWriter(httpURLConnection.getOutputStream()));
      bufferedWriter.write(gson.toJson(userCountRequest));
      bufferedWriter.flush();
      bufferedWriter.close();

      BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(httpURLConnection.getInputStream()));
      StringBuilder stringBuilder = new StringBuilder();
      String line = null;

      while ((line = bufferedReader.readLine()) != null) {
        stringBuilder.append(line);
      }

      System.out.println(stringBuilder);

    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  @SuppressWarnings("DuplicatedCode")
  @Override
  public ObjectConfiguration getObjectConfiguration() throws ObjectConfigurationException {
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
