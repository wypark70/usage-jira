package com.sds.jira.plugin.usage.model;

public class User {
  String lookupTime;
  String activeYn;
  String userId;
  String userName;
  String email;
  String tenantCode;
  String module;

  public String getLookupTime() {
    return lookupTime;
  }

  public void setLookupTime(String lookupTime) {
    this.lookupTime = lookupTime;
  }

  public String getActiveYn() {
    return activeYn;
  }

  public void setActiveYn(String activeYn) {
    this.activeYn = activeYn;
  }

  public String getUserId() {
    return userId;
  }

  public void setUserId(String userId) {
    this.userId = userId;
  }

  public String getUserName() {
    return userName;
  }

  public void setUserName(String userName) {
    this.userName = userName;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getTenantCode() {
    return tenantCode;
  }

  public void setTenantCode(String tenantCode) {
    this.tenantCode = tenantCode;
  }

  public String getModule() {
    return module;
  }

  public void setModule(String module) {
    this.module = module;
  }
}
