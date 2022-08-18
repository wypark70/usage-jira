(function ($) {

  var url = AJS.contextPath() + "/rest/usage-jira/admin/1.0/";

  $(document).ready(function () {
    $.ajax({
      url: url,
      dataType: "json"
    }).done(function (config) {
      $("#host").val(config.host);
      $("#ip").val(config.ip);
      $("#port").val(config.port);
      $("#product-code").val(config.productCode);
      $("#module").val(config.module);
      $("#tenant-code").val(config.tenantCode);
      $("#user-list-api-url").val(config.userListApiUrl);
      $("#user-list-api-key").val(config.userListApiKey);
      $("#user-count-api-url").val(config.userCountApiUrl);
      $("#user-count-api-key").val(config.userCountApiKey);
    });

    $("#admin").submit(function (e) {
      e.preventDefault();
      updateConfig();
    });
  });

  function updateConfig() {
    var data = {
      host: $("#host").val().trim(),
      ip: $("#ip").val().trim(),
      port: $("#port").val().trim(),
      productCode: $("#product-code").val().trim(),
      module: $("#module").val().trim(),
      tenantCode: $("#tenant-code").val().trim(),
      userListApiUrl: $("#user-list-api-url").val().trim(),
      userListApiKey: $("#user-list-api-key").val().trim(),
      userCountApiUrl: $("#user-count-api-url").val().trim(),
      userCountApiKey: $("#user-count-api-key").val().trim()
    }
    $.ajax({
      url: url,
      type: "PUT",
      contentType: "application/json",
      data: JSON.stringify(data),
      processData: false
    }).done(function () {
      cleanOldMessages();
      $('#admin').parent().prepend(AJS.messages.info({
        title: 'Usage jira configurations was saved successfully.'
      }));
      cleanMessageWithTime();
    }).fail(function () {
      cleanOldMessages();
      $('#admin').parent().prepend(AJS.messages.error({
        title: 'Cannot save data. Please, double check fields.'
      }));
      cleanMessageWithTime();
    });
  }

  function cleanMessageWithTime() {
    setTimeout(function () {
      $('#admin').parent().find('.aui-message').hide(500);
      setTimeout(function () {
        $('#admin').parent().find('.aui-message').remove();
      }, 500);
    }, 2000);
  }

  function cleanOldMessages() {
    $('#admin').parent().find('.aui-message').remove();
  }

})(AJS.$ || jQuery);