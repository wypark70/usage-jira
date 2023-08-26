package com.sds.jira.plugin.usage.domain;

import java.util.List;

public class JiraUserCountRequest {
  InterfaceSystemInfo info;
  List<JiraUserCount> list;

  public InterfaceSystemInfo getInfo() {
    return info;
  }

  public void setInfo(InterfaceSystemInfo info) {
    this.info = info;
  }

  public List<JiraUserCount> getList() {
    return list;
  }

  public void setList(List<JiraUserCount> list) {
    this.list = list;
  }
}
