package com.sds.jira.plugin.usage.config;

import com.atlassian.jira.permission.GlobalPermissionKey;
import com.atlassian.jira.plugin.webfragment.conditions.cache.ConditionCacheKeys;
import com.atlassian.jira.plugin.webfragment.conditions.cache.RequestCachingConditionHelper;
import com.atlassian.jira.security.GlobalPermissionManager;
import com.atlassian.jira.security.JiraAuthenticationContext;
import com.atlassian.jira.user.ApplicationUser;
import com.atlassian.plugin.spring.scanner.annotation.imports.JiraImport;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.ws.rs.*;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;


@Controller
@Path("/configuration")
public class ConfigurationController {
    private static final Logger log = LoggerFactory.getLogger(ConfigurationController.class);
    @JiraImport
    private final GlobalPermissionManager permissionManager;
    @JiraImport
    private final JiraAuthenticationContext authenticationContext;
    private final ConfigurationService configurationService;

    public ConfigurationController(GlobalPermissionManager permissionManager, JiraAuthenticationContext authenticationContext, ConfigurationService configurationService) {
        this.configurationService = configurationService;
        this.permissionManager = permissionManager;
        this.authenticationContext = authenticationContext;
    }

    @SuppressWarnings("DuplicatedCode")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public Response get(@Context HttpServletRequest request) {
        if (isNotSystemAdmin()) return Response.status(HttpServletResponse.SC_FORBIDDEN).build();
        return Response.ok(configurationService.getConfiguration()).build();
    }

    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    public Response put(final Configuration config, @Context HttpServletRequest request) {
        if (isNotSystemAdmin()) return Response.status(HttpServletResponse.SC_FORBIDDEN).build();
        configurationService.updateConfiguration(config);
        return Response.noContent().build();
    }

    private boolean isNotSystemAdmin() {
        ApplicationUser user = authenticationContext.getLoggedInUser();
        return !RequestCachingConditionHelper.cacheConditionResultInRequest(ConditionCacheKeys.permission(GlobalPermissionKey.SYSTEM_ADMIN, user), () -> this.permissionManager.hasPermission(GlobalPermissionKey.SYSTEM_ADMIN, user));
    }

}
