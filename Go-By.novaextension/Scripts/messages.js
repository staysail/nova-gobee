//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

const catalog = require("./catalog.js");

class Messages {
  // get the localized message for a given key
  static getMsg(key) {
    return nova.localize(key, catalog.values[key]);
  }

  /**
   * Display a modal error dialog for the given message.
   * Strips off any leading JSON-RPC code if present.
   */
  static showError(err) {
    if (catalog.values[err]) {
      err = this.getMsg(err);
    }
    // strip off the LSP error code; few users can grok it anyway
    let m = err.match(/-3\d\d\d\d\s+(.*)/);
    if (m && m[1]) {
      nova.workspace.showErrorMessage(m[1]);
    } else {
      nova.workspace.showErrorMessage(err);
    }
  }

  static showWarning(err) {
    if (catalog.values[err]) {
      err = this.getMsg(err);
    }
    // strip off the LSP error code; few users can grok it anyway
    let m = err.match(/-3\d\d\d\d\s+(.*)/);
    if (m && m[1]) {
      nova.workspace.showWarningMessage(m[1]);
    } else {
      nova.workspace.showWarningMessage(err);
    }
  }

  /**
   * Show a non-disruptive notification for the given message.
   */
  static showNotice(title, body) {
    let req = new NotificationRequest(title);
    if (catalog.values[title]) {
      title = this.getMsg(title);
    }
    if (catalog.values[body]) {
      body = this.getMsg(body);
    }
    req.title = title;
    req.body = body;
    nova.notifications.add(req);
  }
}

module.exports = Messages;
