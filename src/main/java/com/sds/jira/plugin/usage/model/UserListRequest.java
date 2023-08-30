package com.sds.jira.plugin.usage.model;

import java.util.List;

public class UserListRequest {
  InterfaceSystemInfo info;
  List<User> list;

  public InterfaceSystemInfo getInfo() {
    return info;
  }

  public void setInfo(InterfaceSystemInfo info) {
    this.info = info;
  }

  public List<User> getList() {
    return list;
  }

  public void setList(List<User> list) {
    this.list = list;
  }
}
