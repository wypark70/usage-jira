<script lang="ts">
    import {onMount} from 'svelte';
    import axios from "axios";
    import 

    const apiUrl = '/jira/rest/usage-jira/1.0/usage-jira-configuration'
    let configuration = {
        host: '',
        ip: '',
        port: '',
        productCode: '',
        module: '',
        tenantCode: '',
        userListApiUrl: '',
        userListApiKey: '',
        userCountApiUrl: '',
        userCountApiKey: '',
    }
    onMount(async () => {
        await axios.get(apiUrl, {
            auth: {username: 'admin', password: '1111'},
        }).then(({data}) => {
            console.log(data)
            configuration = data
        })
    })

    function updateConfiguration() {
        console.log('updateConfiguration!!', configuration)
        axios.put(apiUrl, configuration, {
            auth: {username: 'admin', password: '1111'},
            headers: {'X-Atlassian-Token': 'no-check'},
        }).then(response => {
            console.log('SUCCESS');
        }).catch(e => {
            console.log('FAIL: ', e);
        });
    }
</script>

<div id="page">
    <div id="content">
        <section>
            <form class="aui left-label" id="usage-jira-configuration-form">
                <div class="aui-page-header">
                    <div class="aui-page-header-inner">
                        <div class="aui-page-header-main">
                            <h1>Usage jira configuration</h1>
                        </div>
                        <div class="aui-page-header-actions">
                            <div class="aui-buttons">
                                <button class="aui-button" id="save-button" on:click={updateConfiguration}
                                        type="button">submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="aui-page-panel">
                    <div class="form-body">
                        <div class="field-group">
                            <label for="host">
                                Host
                                <span class="aui-icon icon-required"></span>
                            </label>
                            <input bind:value={configuration.host} class="text" data-aui-validation-field
                                   data-aui-validation-required="required" id="host"
                                   name="host"
                                   type="text">
                        </div>
                        <div class="field-group">
                            <label for="ip">
                                IP
                                <span class="aui-icon icon-required"></span>
                            </label>
                            <input bind:value={configuration.ip} class="text" data-aui-validation-field
                                   data-aui-validation-required="required" id="ip"
                                   name="ip"
                                   type="text">
                        </div>
                        <div class="field-group">
                            <label for="port">
                                Port
                                <span class="aui-icon icon-required"></span>
                            </label>
                            <input bind:value={configuration.port} class="text" data-aui-validation-field
                                   data-aui-validation-required="required" id="port"
                                   name="port"
                                   type="text">
                        </div>
                        <div class="field-group">
                            <label for="product-code">
                                Product Code
                                <span class="aui-icon icon-required"></span>
                            </label>
                            <input bind:value={configuration.productCode} class="text" data-aui-validation-field
                                   data-aui-validation-required="required"
                                   id="product-code"
                                   name="product-code"
                                   type="text">
                        </div>
                        <div class="field-group">
                            <label for="module">
                                Module
                                <span class="aui-icon icon-required"></span>
                            </label>
                            <input bind:value={configuration.module} class="text" data-aui-validation-field
                                   data-aui-validation-required="required" id="module"
                                   name="module"
                                   type="text">
                        </div>
                        <div class="field-group">
                            <label for="tenant-code">
                                Tenant Code
                                <span class="aui-icon icon-required"></span>
                            </label>
                            <input bind:value={configuration.tenantCode} class="text" data-aui-validation-field
                                   data-aui-validation-required="required"
                                   id="tenant-code"
                                   name="tenant-code"
                                   type="text">
                        </div>
                        <div class="field-group">
                            <label for="user-list-api-url">
                                User list API URL
                                <span class="aui-icon icon-required"></span>
                            </label>
                            <input bind:value={configuration.userListApiUrl} class="text" data-aui-validation-field
                                   data-aui-validation-required="required" id="user-list-api-url"
                                   name="user-list-api-url"
                                   type="text">
                        </div>
                        <div class="field-group">
                            <label for="user-list-api-key">
                                User list API Key
                                <span class="aui-icon icon-required"></span>
                            </label>
                            <input bind:value={configuration.userListApiKey} class="text" data-aui-validation-field
                                   data-aui-validation-required="required" id="user-list-api-key"
                                   name="user-list-api-key"
                                   type="text">
                        </div>
                        <div class="field-group">
                            <label for="user-count-api-url">
                                User count API URL
                                <span class="aui-icon icon-required"></span>
                            </label>
                            <input bind:value={configuration.userCountApiUrl} class="text" data-aui-validation-field
                                   data-aui-validation-required="required" id="user-count-api-url"
                                   name="user-count-api-url"
                                   type="text">
                        </div>
                        <div class="field-group">
                            <label for="user-count-api-key">
                                User count API Key
                                <span class="aui-icon icon-required"></span>
                            </label>
                            <input bind:value={configuration.userCountApiKey} class="text" data-aui-validation-field
                                   data-aui-validation-required="required" id="user-count-api-key"
                                   name="user-count-api-key"
                                   type="text">
                        </div>
                    </div>
                </div>
            </form>
        </section>
    </div>
</div>
