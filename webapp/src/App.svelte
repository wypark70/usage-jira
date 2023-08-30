<script lang="ts">
    import {onMount} from 'svelte';
    import axios from "axios";
    import {createForm} from 'svelte-forms-lib';
    import * as yup from 'yup';

    interface Configuration {
        host: string;
        ip: string;
        port: string;
        productCode: string;
        module: string;
        tenantCode: string;
        userListApiUrl: string;
        userListApiKey: string;
        userCountApiUrl: string;
        userCountApiKey: string;
    }

    const initialConfiguration: Configuration = {
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
    };

    const REQUIRED_FIELD = 'Required field';
    const IP_REGX = /^(?:[0-9]{1,3}.){3}[0-9]{1,3}$/;
    const PORT_REGX = /^((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-5]{0,5})|([0-9]{1,4}))$/;
    const {form, errors, state, handleChange, handleSubmit} = createForm({
        initialValues: {...initialConfiguration},
        validationSchema: yup.object().shape({
            host: yup.string().trim().required(REQUIRED_FIELD),
            ip: yup.string().trim().matches(IP_REGX, "Invalid IP Address").required(REQUIRED_FIELD),
            port: yup.string().matches(PORT_REGX, "Invalid Port number").required(REQUIRED_FIELD),
            productCode: yup.string().trim().required(REQUIRED_FIELD),
            module: yup.string().trim().required(REQUIRED_FIELD),
            tenantCode: yup.string().trim().required(REQUIRED_FIELD),
            userListApiUrl: yup.string().trim().url("Invalid URL").required(REQUIRED_FIELD),
            userListApiKey: yup.string().trim().required(REQUIRED_FIELD),
            userCountApiUrl: yup.string().trim().url("Invalid URL").required(REQUIRED_FIELD),
            userCountApiKey: yup.string().trim().required(REQUIRED_FIELD),
        }),
        onSubmit: (values) => {
            updateConfiguration(values);
        }
    });

    const API_URL = '/jira/rest/usage-jira/1.0/configuration';
    const USER_NAME = 'admin';
    const PASSWORD = '1111';
    const API_AUTH = {username: USER_NAME, password: PASSWORD};
    onMount(async () => {
        await axios.get(API_URL, {
            auth: API_AUTH,
        }).then(({data}) => {
            console.log(data)
            $form = data
        })
    })

    let showSaveOKMessage = false;

    function updateConfiguration(values: Configuration) {
        const configuration: Configuration = {
            host: values.host.trim(),
            ip: values.ip.trim(),
            port: values.port.trim(),
            productCode: values.productCode.trim(),
            module: values.module.trim(),
            tenantCode: values.tenantCode.trim(),
            userListApiUrl: values.userListApiUrl.trim(),
            userListApiKey: values.userListApiKey.trim(),
            userCountApiUrl: values.userCountApiUrl.trim(),
            userCountApiKey: values.userCountApiKey.trim(),
        };
        $form = {...configuration};
        axios.put(API_URL, configuration, {
            auth: API_AUTH
        }).then(response => {
            console.log('SUCCESS');
            showSaveOKMessage = true;
            setTimeout(() => showSaveOKMessage = false, 2000);
        }).catch(e => {
            console.log('FAIL: ', e);
        });
    }
</script>

<div id="page">
    <div id="content">
        <section>
            <form class="aui left-label" id="usage-jira-configuration-form" on:submit|preventDefault={handleSubmit}>
                <div class="aui-page-header">
                    <div class="aui-page-header-inner">
                        <div class="aui-page-header-main">
                            <h1>Usage jira configuration</h1>
                        </div>
                        <div class="aui-page-header-actions">
                            <div class="aui-buttons">
                                <button class="aui-button" id="save-button" type="submit">submit</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="aui-page-panel">
                    {#if showSaveOKMessage}
                        <div class="aui-message closeable aui-message-success">
                            Saved Configuration!!
                            <button type="button" class="aui-close-button" aria-label="Close" on:click={() => showSaveOKMessage = false} />
                        </div>
                    {/if}
                    <div class="form-body">
                        <div class="field-group">
                            <label for="host">
                                Host
                                <span class="aui-icon icon-required"></span>
                            </label>
                            <input bind:value={$form.host} class="text" id="host"
                                   name="host"
                                   on:change={handleChange}
                                   type="text">
                            {#if $errors.host}<small class="error">{$errors.host}</small>{/if}
                        </div>
                        <div class="field-group">
                            <label for="ip">
                                IP
                                <span class="aui-icon icon-required"></span>
                            </label>
                            <input bind:value={$form.ip} class="text" id="ip"
                                   name="ip"
                                   on:change={handleChange}
                                   type="text">
                            {#if $errors.ip}<small class="error">{$errors.ip}</small>{/if}
                        </div>
                        <div class="field-group">
                            <label for="port">
                                Port
                                <span class="aui-icon icon-required"></span>
                            </label>
                            <input bind:value={$form.port} class="text" id="port"
                                   name="port"
                                   on:change={handleChange}
                                   type="text">
                            {#if $errors.port}<small class="error">{$errors.port}</small>{/if}
                        </div>
                        <div class="field-group">
                            <label for="productCode">
                                Product Code
                                <span class="aui-icon icon-required"></span>
                            </label>
                            <input bind:value={$form.productCode} class="text" id="productCode"
                                   name="productCode"
                                   on:change={handleChange}
                                   type="text">
                            {#if $errors.productCode}<small class="error">{$errors.productCode}</small>{/if}
                        </div>
                        <div class="field-group">
                            <label for="module">
                                Module
                                <span class="aui-icon icon-required"></span>
                            </label>
                            <input bind:value={$form.module} class="text" id="module" name="module"
                                   on:change={handleChange}
                                   type="text">
                            {#if $errors.module}<small class="error">{$errors.module}</small>{/if}
                        </div>
                        <div class="field-group">
                            <label for="tenantCode">
                                Tenant Code
                                <span class="aui-icon icon-required"></span>
                            </label>
                            <input bind:value={$form.tenantCode} class="text" id="tenantCode"
                                   name="tenantCode"
                                   on:change={handleChange}
                                   type="text">
                            {#if $errors.tenantCode}<small class="error">{$errors.tenantCode}</small>{/if}
                        </div>
                        <div class="field-group">
                            <label for="userListApiUrl">
                                User list API URL
                                <span class="aui-icon icon-required"></span>
                            </label>
                            <input bind:value={$form.userListApiUrl} class="text" id="userListApiUrl"
                                   name="userListApiUrl"
                                   on:change={handleChange}
                                   type="text">
                            {#if $errors.userListApiUrl}<small class="error">{$errors.userListApiUrl}</small>{/if}
                        </div>
                        <div class="field-group">
                            <label for="userListApiKey">
                                User list API Key
                                <span class="aui-icon icon-required"></span>
                            </label>
                            <input bind:value={$form.userListApiKey} class="text" id="userListApiKey"
                                   name="userListApiKey"
                                   on:change={handleChange}
                                   type="text">
                            {#if $errors.userListApiKey}<small class="error">{$errors.userListApiKey}</small>{/if}
                        </div>
                        <div class="field-group">
                            <label for="userCountApiUrl">
                                User count API URL
                                <span class="aui-icon icon-required"></span>
                            </label>
                            <input bind:value={$form.userCountApiUrl} class="text" id="userCountApiUrl"
                                   name="userCountApiUrl"
                                   on:change={handleChange}
                                   type="text">
                            {#if $errors.userCountApiUrl}<small class="error">{$errors.userCountApiUrl}</small>{/if}
                        </div>
                        <div class="field-group">
                            <label for="userCountApiKey">
                                User count API Key
                                <span class="aui-icon icon-required"></span>
                            </label>
                            <input bind:value={$form.userCountApiKey} class="text" id="userCountApiKey"
                                   name="userCountApiKey"
                                   on:change={handleChange}
                                   type="text">
                            {#if $errors.userCountApiKey}<small class="error">{$errors.userCountApiKey}</small>{/if}
                        </div>
                    </div>
                </div>
            </form>
        </section>
    </div>
</div>
