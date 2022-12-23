//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

const Catalog = require("./catalog.js");
const Messages = require("./messages.js");
const Paths = require("./paths.js");
const Prefs = require("./prefs.js");
const Config = require("./config.js");

// Common golang stuff.

async function checkForGo() {
  let goexec = Prefs.getConfig(Config.goExec);

  if (goexec == null) {
    let dirs = Paths.expandPath();
    dirs = dirs.concat([
      "/usr/local/go/bin",
      "/opt/homebrew/bin",
      "/usr/local/bin",
    ]);
    let res = Paths.findProgram(dirs, ["go"]);
    if (res && res.length > 0) {
      goexec = res[0];
    }
  }

  if (!goexec || !nova.fs.access(goexec, nova.fs.X_OK)) {
    Messages.showNotice(Catalog.msgNeedGoTitle, Catalog.msgNeedGoBody);
    return null;
  }
  return goexec;
}

module.exports = {
  checkForGo: checkForGo,
};
