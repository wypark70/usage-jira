package com.sds.jira.plugin.usage.config;

public interface ConfigurationService {
    Configuration getConfiguration();

    void updateConfiguration(Configuration configuration);
}
