/**
 * Copyright (c) 2016 Weitian LI <liweitianux@live.com>
 * MIT license
 *
 * WebSocket codes for the Web UI of "fg21sim"
 */

"use strict";

/**
 * Global variable
 * FIXME: try to avoid this ...
 */
var g_ws = null;  /* WebSocket */
/* WebSocket reconnection settings */
var g_ws_reconnect = {maxTry: 21, tried: 0, timeout: 3000};


/**
 * Get the full WebSocket URL from the given URI
 */
var getWebSocketURL = function (uri) {
  var proto = {"http:": "ws:", "https:": "wss:"}[location.protocol];
  var host = location.hostname;
  var port = location.port;
  var url = proto + "//" + host + ":" + port + uri;
  return url;
};


/**
 * Update the contents of element "#ws-status" according to the current
 * WebSocket status.
 */
var updateWSStatus = function (action) {
  if (action === "open") {
    // WebSocket opened and connected
    $("#ws-status").removeClass("label-default label-warning label-danger")
      .addClass("label-success");
    $("#ws-status .icon").removeClass("fa-question-circle fa-warning")
      .removeClass("fa-times-circle")
      .addClass("fa-check-circle");
    $("#ws-status .text").text("Connected");
  }
  else if (action === "close") {
    // WebSocket closed
    $("#ws-status").removeClass("label-default label-success label-danger")
      .addClass("label-warning");
    $("#ws-status .icon").removeClass("fa-question-circle fa-check-circle")
      .removeClass("fa-times-circle")
      .addClass("fa-warning");
    $("#ws-status .text").text("Disconnected!");
  }
  else if (action === "error") {
    // WebSocket encountered error
    $("#ws-status").removeClass("label-default label-success label-warning")
      .addClass("label-danger");
    $("#ws-status .icon").removeClass("fa-question-circle fa-check-circle")
      .removeClass("fa-warning")
      .addClass("fa-times-circle");
    $("#ws-status .text").text("Error!!");
  }
  else if (action === "unsupported") {
    // WebSocket NOT supported
    $("#ws-status").removeClass("label-default").addClass("label-danger");
    $("#ws-status .icon").removeClass("fa-question-circle")
      .addClass("fa-times-circle");
    $("#ws-status .text").text("Unsupported!!");
  }
  else {
    console.error("updateWSStatus: Unknown action:", action);
  }
};


/**
 * Toggle the visibility of element "#ws-status".
 */
var toggleWSReconnect = function (action) {
  /**
   * Function default parameters: https://stackoverflow.com/a/894877/4856091
   */
  action = typeof action !== "undefined" ? action : "toggle";

  var target = $("#ws-reconnect");
  if (action === "toggle") {
    target.toggle();
  } else if (action === "show") {
    target.show();
  } else if (action === "hide") {
    target.hide();
  } else {
    console.error("toggleWSReconnect: Unknown action:", action);
  }
};


/**
 * Connect to WebSocket and bind functions to events
 */
var connectWebSocket = function (url) {
  g_ws = new WebSocket(url);
  g_ws.onopen = function () {
    console.log("Opened WebSocket:", g_ws.url);
    updateWSStatus("open");
    toggleWSReconnect("hide");
  };
  g_ws.onclose = function (e) {
    console.log("WebSocket closed: code:", e.code, ", reason:", e.reason);
    updateWSStatus("close");
    // Reconnect
    if (g_ws_reconnect.tried < g_ws_reconnect.maxTry) {
      g_ws_reconnect.tried++;
      console.log("Try reconnect the WebSocket: No." + g_ws_reconnect.tried);
      setTimeout(function () { connectWebSocket(url); },
                 g_ws_reconnect.timeout);
    } else {
      console.error("WebSocket already tried allowed maximum times:",
                    g_ws_reconnect.maxTry);
      toggleWSReconnect("show");
    }
  };
  g_ws.onerror = function (e) {
    console.error("WebSocket encountered error:", e.message);
    updateWSStatus("error");
    toggleWSReconnect("show");
  };
  g_ws.onmessage = function (e) {
    var msg = JSON.parse(e.data);
    console.log("WebSocket received message: type:", msg.type,
                ", success:", msg.success);
    console.log(msg);
    // Delegate appropriate actions to handle the received message
    if (msg.type === "configs") {
      handleWebSocketMsgConfigs(msg);
    }
    else if (msg.type === "console") {
      handleMsgConsole(msg);
    }
    else if (msg.type === "results") {
      console.error("NotImplementedError");
      // handleMsgResults(msg);
    }
    else {
      // Unknown/unsupported message type
      console.error("WebSocket received message of unknown type:", msg.type);
      if (! msg.success) {
        console.error("WebSocket request failed with error:", msg.error);
        // TODO: add error codes support and handle each specific error
      }
    }
  };
};


$(document).ready(function () {
  /**
   * Check `WebSocket` support
   */
  if (window.WebSocket) {
    // WebSocket supported
    console.log("Great, WebSocket is supported!");

    var ws_url = getWebSocketURL("/ws");
    connectWebSocket(ws_url);

    // Manually reconnect the WebSocket after tried allowed maximum times
    $("#ws-reconnect").on("click", function () {
      console.log("WebSocket: reset the tried reconnection counter");
      g_ws_reconnect.tried = 0;
      console.log("Manually reconnect the WebSocket:", ws_url);
      connectWebSocket(ws_url);
    });

    /**********************************************************************
     * Console operations
     */

    // Start the task on the server
    $("#task-start").on("click", function () {
      if ($("#conf-status").data("validity")) {
        updateTaskStatus({running: true, finished: false});
        startServerTask(g_ws);
        getServerTaskStatus(g_ws);
      } else {
        $("#console-invalid-configs").modal();
        console.error("Exist invalid configuration values!");
      }
    });

    /* Logging messages controls */
    $("#log-toggle-debug").on("click", function () {
      var status = toggleLogMessages("debug");
      $(this).fadeTo("fast", status ? 1.0 : 0.5);
    });
    $("#log-toggle-info").on("click", function () {
      var status = toggleLogMessages("info");
      $(this).fadeTo("fast", status ? 1.0 : 0.5);
    });
    $("#log-toggle-warning").on("click", function () {
      var status = toggleLogMessages("warning");
      $(this).fadeTo("fast", status ? 1.0 : 0.5);
    });
    $("#log-toggle-error").on("click", function () {
      var status = toggleLogMessages("error");
      toggleLogMessages("critical");
      $(this).fadeTo("fast", status ? 1.0 : 0.5);
    });
    $("#log-delete").on("click", function () {
      // TODO: add a confirmation dialog
      deleteLogMessages();
    });

  } else {
    // WebSocket NOT supported
    console.error("Oops, WebSocket is NOT supported!");
    updateWSStatus("unsupported");
  }
});
