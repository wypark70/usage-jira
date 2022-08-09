package com.sds.jira.plugin.usage.domain;

import java.util.List;

public class UserInfoRequest {
  SystemInfo info;
  List<UserInfo> list;

  public SystemInfo getInfo() {
    return info;
  }

  public void setInfo(SystemInfo info) {
    this.info = info;
  }

  public List<UserInfo> getList() {
    return list;
  }

  public void setList(List<UserInfo> list) {
    this.list = list;
  }
}
