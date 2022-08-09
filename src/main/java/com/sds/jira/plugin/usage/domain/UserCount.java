package com.sds.jira.plugin.usage.domain;

public class UserCount {
  String lookupTime;
  String total;
  String usage;

  public String getLookupTime() {
    return lookupTime;
  }

  public void setLookupTime(String lookupTime) {
    this.lookupTime = lookupTime;
  }

  public String getTotal() {
    return total;
  }

  public void setTotal(String total) {
    this.total = total;
  }

  public String getUsage() {
    return usage;
  }

  public void setUsage(String usage) {
    this.usage = usage;
  }
}
