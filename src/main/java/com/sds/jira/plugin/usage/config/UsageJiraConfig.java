package com.sds.jira.plugin.usage.config;

import com.google.gson.GsonBuilder;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
@XmlAccessorType(XmlAccessType.FIELD)
public class UsageJiraConfig {

  @XmlElement
  private String host;

  @XmlElement
  private String ip;

  @XmlElement
  private String port;

  @XmlElement
  private String productCode;

  @XmlElement
  private String tenantCode;

  @XmlElement
  private String userListApiUrl;

  @XmlElement
  private String userListApiKey;

  @XmlElement
  private String userCountApiUrl;

  @XmlElement
  private String userCountApiKey;

  public String getHost() {
    return host;
  }

  public void setHost(String host) {
    this.host = host;
  }

  public String getIp() {
    return ip;
  }

  public void setIp(String ip) {
    this.ip = ip;
  }

  public String getPort() {
    return port;
  }

  public void setPort(String port) {
    this.port = port;
  }

  public String getProductCode() {
    return productCode;
  }

  public void setProductCode(String productCode) {
    this.productCode = productCode;
  }

  public String getTenantCode() {
    return tenantCode;
  }

  public void setTenantCode(String tenantCode) {
    this.tenantCode = tenantCode;
  }

  public String getUserListApiUrl() {
    return userListApiUrl;
  }

  public void setUserListApiUrl(String userListApiUrl) {
    this.userListApiUrl = userListApiUrl;
  }

  public String getUserListApiKey() {
    return userListApiKey;
  }

  public void setUserListApiKey(String userListApiKey) {
    this.userListApiKey = userListApiKey;
  }

  public String getUserCountApiUrl() {
    return userCountApiUrl;
  }

  public void setUserCountApiUrl(String userCountApiUrl) {
    this.userCountApiUrl = userCountApiUrl;
  }

  public String getUserCountApiKey() {
    return userCountApiKey;
  }

  public void setUserCountApiKey(String userCountApiKey) {
    this.userCountApiKey = userCountApiKey;
  }

  @Override
  public String toString() {
    return new GsonBuilder().setPrettyPrinting().create().toJson(this);
  }
}
