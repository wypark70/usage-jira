package com.sds.jira.plugin.usage.config;

public class UsageJiraConfigurationException extends RuntimeException {

  public UsageJiraConfigurationException(String message) {
    super(message);
  }

  public UsageJiraConfigurationException(String message, Throwable cause) {
    super(message, cause);
  }
}
