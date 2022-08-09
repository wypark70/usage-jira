package com.sds.jira.plugin.usage.config;

public class UsageJiraConfigException extends RuntimeException {

  public UsageJiraConfigException(String message) {
    super(message);
  }

  public UsageJiraConfigException(String message, Throwable cause) {
    super(message, cause);
  }
}
