package com.sds.jira.plugin.usage.domain;

import java.util.List;

public class UserCountRequest {
  SystemInfo info;
  List<UserCount> list;

  public SystemInfo getInfo() {
    return info;
  }

  public void setInfo(SystemInfo info) {
    this.info = info;
  }

  public List<UserCount> getList() {
    return list;
  }

  public void setList(List<UserCount> list) {
    this.list = list;
  }
}
