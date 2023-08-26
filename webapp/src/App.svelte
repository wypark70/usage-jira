<script lang="ts">
    AJS.$('#valid-submit-form').on('aui-valid-submit', function(event) {
        console.log('Data saved');
        event.preventDefault();
    });
</script>

<div id="page">
    <div id="content">
        <section>
            <form id="admin" class="aui left-label">
                <div class="aui-page-header">
                    <div class="aui-page-header-inner">
                        <div class="aui-page-header-main">
                            <h1>Usage jira admin configuration</h1>
                        </div>
                        <div class="aui-page-header-actions">
                            <div class="aui-buttons">
                                <button type="button" class="aui-button" id="save-button">submit</button>
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
                            <input type="text" id="host" name="host" class="text" data-aui-validation-field
                                   data-aui-validation-required="required">
                        </div>
                        <div class="field-group">
                            <label for="ip">
                                IP
                                <span class="aui-icon icon-required"></span>
                            </label>
                            <input type="text" id="ip" name="ip" class="text" data-aui-validation-field
                                   data-aui-validation-required="required">
                        </div>
                        <div class="field-group">
                            <label for="port">
                                Port
                                <span class="aui-icon icon-required"></span>
                            </label>
                            <input type="text" id="port" name="port" class="text" data-aui-validation-field
                                   data-aui-validation-required="required">
                        </div>
                        <div class="field-group">
                            <label for="product-code">
                                Product Code
                                <span class="aui-icon icon-required"></span>
                            </label>
                            <input type="text" id="product-code" name="product-code" class="text"
                                   data-aui-validation-field
                                   data-aui-validation-required="required">
                        </div>
                        <div class="field-group">
                            <label for="module">
                                Module
                                <span class="aui-icon icon-required"></span>
                            </label>
                            <input type="text" id="module" name="module" class="text" data-aui-validation-field
                                   data-aui-validation-required="required">
                        </div>
                        <div class="field-group">
                            <label for="tenant-code">
                                Tenant Code
                                <span class="aui-icon icon-required"></span>
                            </label>
                            <input type="text" id="tenant-code" name="tenant-code" class="text"
                                   data-aui-validation-field
                                   data-aui-validation-required="required">
                        </div>
                        <div class="field-group">
                            <label for="user-list-api-url">
                                User list API URL
                                <span class="aui-icon icon-required"></span>
                            </label>
                            <input type="text" id="user-list-api-url" name="user-list-api-url" class="text"
                                   data-aui-validation-field
                                   data-aui-validation-required="required">
                        </div>
                        <div class="field-group">
                            <label for="user-list-api-key">
                                User list API Key
                                <span class="aui-icon icon-required"></span>
                            </label>
                            <input type="text" id="user-list-api-key" name="user-list-api-key" class="text"
                                   data-aui-validation-field
                                   data-aui-validation-required="required">
                        </div>
                        <div class="field-group">
                            <label for="user-count-api-url">
                                User count API URL
                                <span class="aui-icon icon-required"></span>
                            </label>
                            <input type="text" id="user-count-api-url" name="user-count-api-url" class="text"
                                   data-aui-validation-field
                                   data-aui-validation-required="required">
                        </div>
                        <div class="field-group">
                            <label for="user-count-api-key">
                                User count API Key
                                <span class="aui-icon icon-required"></span>
                            </label>
                            <input type="text" id="user-count-api-key" name="user-count-api-key" class="text"
                                   data-aui-validation-field
                                   data-aui-validation-required="required">
                        </div>
                    </div>
                </div>
            </form>
        </section>
    </div>
</div>
