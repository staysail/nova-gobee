//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

const GitHub = require("./github.js");
const Config = require("./config.js");
const Commands = require("./commands.js");
const Messages = require("./messages.js");
const Catalog = require("./catalog.js");
const State = require("./state.js");
const Prefs = require("./prefs.js");
const Paths = require("./paths.js");

const extPath = nova.extension.globalStoragePath;
let srvPath = nova.path.join(extPath, "gopls");

async function checkForUpdate(force = false) {
  let release = await GitHub.latest(force);

  let next = nova.config.get(Config.releaseGoPls);
  if (release != null && "gopls/" + next != release.tag_name) {
    next = release.tag_name;
    if (next.startsWith("gopls/")) {
      next = next.substr(6);
    }

    nova.config.set(Config.releaseGoPls, next);
  }
  let curr = nova.config.get(Config.currentGoPls);
  if (curr) {
    srvPath = nova.path.join(nova.extension.globalStoragePath, `gopls`);
  }

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

  if (!nova.fs.access(goexec, nova.fs.X_OK)) {
    Messages.showNotice(Catalog.msgNeedGoTitle, Catalog.msgNeedGoBody);
    return false;
  }

  if (curr && !nova.fs.access(srvPath, nova.fs.X_OK)) {
    console.error("We should have had a binary, but it appears to be missing.");
    curr = null;
  }

  if (curr == next && nova.fs.access(srvPath, nova.fs.X_OK)) {
    Messages.showNotice(Catalog.msgUpToDate, curr);
    console.log("Language server is current.");
    return true;
  }

  let title = Messages.getMsg(
    curr ? Catalog.msgNewLspTitle : Catalog.msgMissingLspTitle
  );
  let text = Messages.getMsg(
    curr ? Catalog.msgNewLspBody : Catalog.msgMissingLspBody
  );
  let n = new NotificationRequest("autoUpdate");
  n.title = title;
  n.body = text
    .replace("_VERSION_", next)
    .replace("_OLD_VERSION_", curr ?? "none");
  n.actions = [
    Messages.getMsg(curr ? Catalog.msgUpdate : Catalog.msgInstall),
    Messages.getMsg(Catalog.msgCancel),
  ];
  let response = await nova.notifications.add(n);
  if (response == null) {
    return null;
  }
  if (response.actionIdx != 0) {
    return false;
  }

  let options = {
    args: ["install", "golang.org/x/tools/gopls@" + next],
    env: { GOBIN: nova.extension.globalStoragePath },
  };

  let proc = new Process(goexec, options);
  proc.onDidExit((status) => {
    if (status == 0) {
      // notify watchers (should cause a reboot)
      State.emitter.emit(State.events.onUpdate);
      nova.config.set(Config.currentGoPls, next);
    } else {
      Messages.showError(Catalog.msgLspUpdateFailed);
    }
  });
  try {
    proc.start();
  } catch (err) {
    Messages.showError(Catalog.msgLspUpdateFailed);
  }
}

//nova.commands.register(Commands.checkForUpdate, async function (_) {

async function checkForUpdateCmd() {
  if (Prefs.getConfig(Config.lspFlavor) != "auto") {
    Messages.showNotice(
      Catalog.msgLspIsNotAutoTitle,
      Catalog.msgLspIsNotAutoBody
    );
    return;
  }
  try {
    await checkForUpdate(true);
  } catch (error) {
    Messages.showError(error.message);
  }
}

async function checkForUpdateSilent() {
  // If we should check for new versions at start up, try to download from
  // GitHub releases.  But we don't do this if the server is disabled or we
  // are using a custom server.
  if (Prefs.getConfig(Config.lspFlavor) != "auto") {
    return;
  }
  if (Prefs.getConfig(Config.checkForUpdates)) {
    // if it doesn't work, don't bother warning about it.
    try {
      await checkForUpdate();
    } catch (error) {}
  }
}

function onStart() {
  checkForUpdateSilent();
  // consider restarting this periodically, but we need to make
  // make sure that we only do it once for the entire editor, not
  // per server.
}

function register() {
  State.disposal.add(
    nova.config.onDidChange(Config.lspFlavor, (nv, ov) => {
      if (nv != ov && nv == "auto") {
        checkForUpdateSilent();
      }
    })
  );
  State.registerCommand(Commands.checkForUpdate, checkForUpdateCmd);
  State.emitter.on(State.events.onActivate, onStart);
}

module.exports = { register: register };
