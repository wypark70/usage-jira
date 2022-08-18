package com.sds.jira.plugin.usage.util;

import com.sds.jira.plugin.usage.config.UsageJiraConfig;
import com.sds.jira.plugin.usage.config.UsageJiraConfigException;
import org.apache.commons.lang3.StringUtils;

public final class UsageJiraConfigChecker {

  private UsageJiraConfigChecker() {
  }

  public static void checkUsageJiraConfig(UsageJiraConfig config) throws UsageJiraConfigException {
    StringBuilder sb = new StringBuilder();
    if (StringUtils.isBlank(config.getHost())) {
      sb.append("Host is not set up!").append(System.lineSeparator());
    }
    if (StringUtils.isBlank(config.getIp())) {
      sb.append("IP is not set up! ").append(System.lineSeparator());
    }
    if (StringUtils.isBlank(config.getPort())) {
      sb.append("Port is not set up! ").append(System.lineSeparator());
    }
    if (StringUtils.isBlank(config.getProductCode())) {
      sb.append("Product code is not set up! ").append(System.lineSeparator());
    }
    if (StringUtils.isBlank(config.getModule())) {
      sb.append("Module is not set up! ").append(System.lineSeparator());
    }
    if (StringUtils.isBlank(config.getTenantCode())) {
      sb.append("Tenant code is not set up! ").append(System.lineSeparator());
    }
    if (StringUtils.isBlank(config.getUserListApiUrl())) {
      sb.append("User list API URL is not set up! ").append(System.lineSeparator());
    }
    if (StringUtils.isBlank(config.getUserListApiKey())) {
      sb.append("User list API Key is not set up! ").append(System.lineSeparator());
    }
    if (StringUtils.isBlank(config.getUserCountApiUrl())) {
      sb.append("User count API URL is not set up! ").append(System.lineSeparator());
    }
    if (StringUtils.isBlank(config.getUserCountApiKey())) {
      sb.append("User count API Key is not set up! ").append(System.lineSeparator());
    }
    if (sb.length() > 0) {
      throw new UsageJiraConfigException(sb.toString());
    }
  }

}
