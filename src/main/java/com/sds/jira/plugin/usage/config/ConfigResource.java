package com.sds.jira.plugin.usage.config;

import com.atlassian.jira.permission.GlobalPermissionKey;
import com.atlassian.jira.plugin.webfragment.conditions.cache.ConditionCacheKeys;
import com.atlassian.jira.plugin.webfragment.conditions.cache.RequestCachingConditionHelper;
import com.atlassian.jira.security.GlobalPermissionManager;
import com.atlassian.jira.security.JiraAuthenticationContext;
import com.atlassian.jira.user.ApplicationUser;
import com.atlassian.plugin.spring.scanner.annotation.component.Scanned;
import com.atlassian.plugin.spring.scanner.annotation.imports.JiraImport;
import com.atlassian.sal.api.pluginsettings.PluginSettings;
import com.atlassian.sal.api.pluginsettings.PluginSettingsFactory;
import com.atlassian.sal.api.transaction.TransactionTemplate;
import com.sds.jira.plugin.usage.util.UsageJiraConfigChecker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Path("/")
@Scanned
public class ConfigResource {
  private static final Logger log = LoggerFactory.getLogger(ConfigResource.class);
  private static final String CLASS_NAME = UsageJiraConfig.class.getName();
  @JiraImport
  private final PluginSettingsFactory pluginSettingsFactory;
  @JiraImport
  private final TransactionTemplate transactionTemplate;
  @JiraImport
  private final GlobalPermissionManager permissionManager;
  @JiraImport
  private final JiraAuthenticationContext authenticationContext;

  public ConfigResource(PluginSettingsFactory pluginSettingsFactory, TransactionTemplate transactionTemplate, GlobalPermissionManager permissionManager, JiraAuthenticationContext authenticationContext) {
    this.pluginSettingsFactory = pluginSettingsFactory;
    this.transactionTemplate = transactionTemplate;
    this.permissionManager = permissionManager;
    this.authenticationContext = authenticationContext;
  }

  @SuppressWarnings("DuplicatedCode")
  @GET
  @Produces(MediaType.APPLICATION_JSON)
  public Response get(@Context HttpServletRequest request) {
    if (isNotSystemAdmin()) return Response.status(HttpServletResponse.SC_FORBIDDEN).build();
    return Response.ok(transactionTemplate.execute(() -> {
      PluginSettings settings = pluginSettingsFactory.createGlobalSettings();
      UsageJiraConfig config = new UsageJiraConfig();
      config.setHost((String) settings.get(CLASS_NAME + ".host"));
      config.setIp((String) settings.get(CLASS_NAME + ".ip"));
      config.setPort((String) settings.get(CLASS_NAME + ".port"));
      config.setProductCode((String) settings.get(CLASS_NAME + ".productCode"));
      config.setTenantCode((String) settings.get(CLASS_NAME + ".tenantCode"));
      config.setUserListApiUrl((String) settings.get(CLASS_NAME + ".userListApiUrl"));
      config.setUserListApiKey((String) settings.get(CLASS_NAME + ".userListApiKey"));
      config.setUserCountApiUrl((String) settings.get(CLASS_NAME + ".userCountApiUrl"));
      config.setUserCountApiKey((String) settings.get(CLASS_NAME + ".userCountApiKey"));
      return config;
    })).build();
  }

  @PUT
  @Consumes(MediaType.APPLICATION_JSON)
  public Response put(final UsageJiraConfig config, @Context HttpServletRequest request) {
    if (isNotSystemAdmin()) return Response.status(HttpServletResponse.SC_FORBIDDEN).build();
    UsageJiraConfigChecker.checkUsageJiraConfig(config);
    transactionTemplate.execute(() -> {
      PluginSettings pluginSettings = pluginSettingsFactory.createGlobalSettings();
      pluginSettings.put(CLASS_NAME + ".host", config.getHost());
      pluginSettings.put(CLASS_NAME + ".ip", config.getIp());
      pluginSettings.put(CLASS_NAME + ".port", config.getPort());
      pluginSettings.put(CLASS_NAME + ".productCode", config.getProductCode());
      pluginSettings.put(CLASS_NAME + ".tenantCode", config.getTenantCode());
      pluginSettings.put(CLASS_NAME + ".userListApiUrl", config.getUserListApiUrl());
      pluginSettings.put(CLASS_NAME + ".userListApiKey", config.getUserListApiKey());
      pluginSettings.put(CLASS_NAME + ".userCountApiUrl", config.getUserCountApiUrl());
      pluginSettings.put(CLASS_NAME + ".userCountApiKey", config.getUserCountApiKey());
      return null;
    });
    return Response.noContent().build();
  }

  private boolean isNotSystemAdmin() {
    ApplicationUser user = authenticationContext.getLoggedInUser();
    return !RequestCachingConditionHelper.cacheConditionResultInRequest(ConditionCacheKeys.permission(GlobalPermissionKey.SYSTEM_ADMIN, user), () -> this.permissionManager.hasPermission(GlobalPermissionKey.SYSTEM_ADMIN, user));
  }

}
