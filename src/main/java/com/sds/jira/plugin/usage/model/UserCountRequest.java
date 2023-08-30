package com.sds.jira.plugin.usage.model;

import java.util.List;

public class UserCountRequest {
  InterfaceSystemInfo info;
  List<UserCount> list;

  public InterfaceSystemInfo getInfo() {
    return info;
  }

  public void setInfo(InterfaceSystemInfo info) {
    this.info = info;
  }

  public List<UserCount> getList() {
    return list;
  }

  public void setList(List<UserCount> list) {
    this.list = list;
  }
}
