package com.sds.jira.plugin.usage.domain;

import java.util.List;

public class JiraUserListRequest {
  InterfaceSystemInfo info;
  List<JiraUser> list;

  public InterfaceSystemInfo getInfo() {
    return info;
  }

  public void setInfo(InterfaceSystemInfo info) {
    this.info = info;
  }

  public List<JiraUser> getList() {
    return list;
  }

  public void setList(List<JiraUser> list) {
    this.list = list;
  }
}
