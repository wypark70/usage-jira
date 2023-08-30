package com.sds.jira.plugin.usage.config;

import com.atlassian.plugin.spring.scanner.annotation.export.ExportAsService;
import com.atlassian.plugin.spring.scanner.annotation.imports.ComponentImport;
import com.atlassian.sal.api.pluginsettings.PluginSettings;
import com.atlassian.sal.api.pluginsettings.PluginSettingsFactory;
import com.atlassian.sal.api.transaction.TransactionTemplate;
import org.springframework.stereotype.Service;

@Service
@ExportAsService(ConfigurationService.class)
public class ConfigurationServiceImpl implements ConfigurationService {
    private static final String CLASS_NAME = Configuration.class.getName();
    @ComponentImport
    private final PluginSettingsFactory pluginSettingsFactory;
    @ComponentImport
    private final TransactionTemplate transactionTemplate;

    public ConfigurationServiceImpl(PluginSettingsFactory pluginSettingsFactory, TransactionTemplate transactionTemplate) {
        this.pluginSettingsFactory = pluginSettingsFactory;
        this.transactionTemplate = transactionTemplate;
    }

    @Override
    public Configuration getConfiguration() {
        return transactionTemplate.execute(() -> {
            PluginSettings settings = pluginSettingsFactory.createGlobalSettings();
            Configuration configuration = new Configuration();
            configuration.setHost((String) settings.get(CLASS_NAME + ".host"));
            configuration.setIp((String) settings.get(CLASS_NAME + ".ip"));
            configuration.setPort((String) settings.get(CLASS_NAME + ".port"));
            configuration.setProductCode((String) settings.get(CLASS_NAME + ".productCode"));
            configuration.setModule((String) settings.get(CLASS_NAME + ".module"));
            configuration.setTenantCode((String) settings.get(CLASS_NAME + ".tenantCode"));
            configuration.setUserListApiUrl((String) settings.get(CLASS_NAME + ".userListApiUrl"));
            configuration.setUserListApiKey((String) settings.get(CLASS_NAME + ".userListApiKey"));
            configuration.setUserCountApiUrl((String) settings.get(CLASS_NAME + ".userCountApiUrl"));
            configuration.setUserCountApiKey((String) settings.get(CLASS_NAME + ".userCountApiKey"));
            return configuration;
        });
    }

    @Override
    public void updateConfiguration(Configuration configuration) {
        ConfigurationValidator.checkUsageJiraConfig(configuration);
        transactionTemplate.execute(() -> {
            PluginSettings pluginSettings = pluginSettingsFactory.createGlobalSettings();
            pluginSettings.put(CLASS_NAME + ".host", configuration.getHost());
            pluginSettings.put(CLASS_NAME + ".ip", configuration.getIp());
            pluginSettings.put(CLASS_NAME + ".port", configuration.getPort());
            pluginSettings.put(CLASS_NAME + ".productCode", configuration.getProductCode());
            pluginSettings.put(CLASS_NAME + ".module", configuration.getModule());
            pluginSettings.put(CLASS_NAME + ".tenantCode", configuration.getTenantCode());
            pluginSettings.put(CLASS_NAME + ".userListApiUrl", configuration.getUserListApiUrl());
            pluginSettings.put(CLASS_NAME + ".userListApiKey", configuration.getUserListApiKey());
            pluginSettings.put(CLASS_NAME + ".userCountApiUrl", configuration.getUserCountApiUrl());
            pluginSettings.put(CLASS_NAME + ".userCountApiKey", configuration.getUserCountApiKey());
            return pluginSettings;
        });
    }
}
