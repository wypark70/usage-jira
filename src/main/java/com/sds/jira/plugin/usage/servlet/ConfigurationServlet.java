package com.sds.jira.plugin.usage.servlet;

import com.atlassian.jira.permission.GlobalPermissionKey;
import com.atlassian.jira.plugin.webfragment.conditions.cache.ConditionCacheKeys;
import com.atlassian.jira.plugin.webfragment.conditions.cache.RequestCachingConditionHelper;
import com.atlassian.jira.security.GlobalPermissionManager;
import com.atlassian.jira.security.JiraAuthenticationContext;
import com.atlassian.jira.user.ApplicationUser;
import com.atlassian.plugin.spring.scanner.annotation.imports.JiraImport;
import com.atlassian.templaterenderer.TemplateRenderer;

import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class ConfigurationServlet extends HttpServlet {
    private static final String CONFIGURATION_TEMPLATE_PATH = "/templates/configuration.vm";
    private static final String CONFIGURATION_WEB_RESOURCE_PATH = "/download/resources/com.sds.jira.plugin.usage-jira:configuration-web-resources";

    @JiraImport
    private final GlobalPermissionManager permissionManager;

    @JiraImport
    private final JiraAuthenticationContext authenticationContext;

    @JiraImport
    private final TemplateRenderer templateRenderer;

    public ConfigurationServlet(GlobalPermissionManager permissionManager, JiraAuthenticationContext authenticationContext, TemplateRenderer templateRenderer) {
        this.permissionManager = permissionManager;
        this.authenticationContext = authenticationContext;
        this.templateRenderer = templateRenderer;
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        ApplicationUser user = authenticationContext.getLoggedInUser();
        boolean isSystemAdmin = RequestCachingConditionHelper.cacheConditionResultInRequest(ConditionCacheKeys.permission(GlobalPermissionKey.SYSTEM_ADMIN, user), () -> this.permissionManager.hasPermission(GlobalPermissionKey.SYSTEM_ADMIN, user));
        if (!isSystemAdmin) {
            resp.setStatus(HttpServletResponse.SC_FORBIDDEN);
            return;
        }
        resp.setContentType("text/html;charset=utf-8");
        Map<String, Object> data = new HashMap<>();
        data.put("webResourcePath", req.getContextPath() + CONFIGURATION_WEB_RESOURCE_PATH);

        templateRenderer.render(CONFIGURATION_TEMPLATE_PATH, data, resp.getWriter());
    }

}
