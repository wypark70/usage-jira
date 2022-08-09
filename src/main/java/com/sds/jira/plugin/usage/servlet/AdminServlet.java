package com.sds.jira.plugin.usage.servlet;

import com.atlassian.jira.permission.GlobalPermissionKey;
import com.atlassian.jira.plugin.webfragment.conditions.cache.ConditionCacheKeys;
import com.atlassian.jira.plugin.webfragment.conditions.cache.RequestCachingConditionHelper;
import com.atlassian.jira.security.GlobalPermissionManager;
import com.atlassian.jira.security.JiraAuthenticationContext;
import com.atlassian.jira.user.ApplicationUser;
import com.atlassian.plugin.spring.scanner.annotation.component.Scanned;
import com.atlassian.plugin.spring.scanner.annotation.imports.ComponentImport;
import com.atlassian.plugin.spring.scanner.annotation.imports.JiraImport;
import com.atlassian.templaterenderer.TemplateRenderer;
import com.atlassian.webresource.api.assembler.PageBuilderService;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@Scanned
public class AdminServlet extends HttpServlet {

  private static final String ADMIN_TEMPLATE = "/templates/admin.vm";

  @ComponentImport
  private final PageBuilderService pageBuilderService;

  @JiraImport
  private final GlobalPermissionManager permissionManager;

  @JiraImport
  private final JiraAuthenticationContext authenticationContext;

  @JiraImport
  private final TemplateRenderer templateRenderer;

  public AdminServlet(
      PageBuilderService pageBuilderService,
      GlobalPermissionManager permissionManager,
      JiraAuthenticationContext authenticationContext,
      TemplateRenderer templateRenderer) {
    this.pageBuilderService = pageBuilderService;
    this.permissionManager = permissionManager;
    this.authenticationContext = authenticationContext;
    this.templateRenderer = templateRenderer;
  }

  @Override
  protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
    ApplicationUser user = authenticationContext.getLoggedInUser();
    boolean isSystemAdmin = RequestCachingConditionHelper
        .cacheConditionResultInRequest(
            ConditionCacheKeys.permission(GlobalPermissionKey.SYSTEM_ADMIN, user),
            () -> this.permissionManager.hasPermission(GlobalPermissionKey.SYSTEM_ADMIN, user)
        );
    if (!isSystemAdmin) {
      resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
      return;
    }
    pageBuilderService
        .assembler()
        .resources()
        .requireWebResource("com.sds.jira.plugin.jira-usage:admin-web-resources")
        .requireContext("atl.admin");
    resp.setContentType("text/html;charset=utf-8");
    templateRenderer.render(ADMIN_TEMPLATE, resp.getWriter());
  }

}
