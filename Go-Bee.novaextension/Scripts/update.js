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

const progs = {
  gopls: {
    name: "gopls",
    repo: "golang/tools",
    pkg: "golang.org/x/tools/gopls",
    pfx: "gopls/",
    rel: Config.releaseGoPls,
    cur: Config.currentGoPls,
    restart: true,
  },
  dlv: {
    name: "dlv",
    repo: "go-delve/delve",
    pkg: "github.com/go-delve/delve/cmd/dlv",
    pfx: "",
    rel: Config.releaseDelve,
    cur: Config.currentDelve,
  },
};

async function checkForUpdate(force = false) {
  return Promise.all(
    checkForUpdateProg(progs.dlv, force),
    checkForUpdateProg(progs.gopls, force)
  );
}

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

async function checkForUpdateProg(prog, force = false) {
  let goexec = await checkForGo();
  if (!goexec) {
    return false;
  }
  let release = await GitHub.latest(prog.name, prog.repo, force);

  let next = nova.config.get(prog.rel);
  if (release != null && prog.pfx + next != release.tag_name) {
    next = release.tag_name;
    if (prog.pfx.length > 0 && next.startsWith(prog.pfx)) {
      next = next.substr(prog.pfx.length);
    }

    nova.config.set(prog.rel, next);
  }
  let curr = nova.config.get(prog.cur);
  let exePath = "";
  if (curr) {
    exePath = nova.path.join(extPath, prog.name);
  }

  if (curr && !nova.fs.access(exePath, nova.fs.X_OK)) {
    console.error("We should have had a binary, but it appears to be missing.");
    curr = null;
  }

  if (curr == next && nova.fs.access(exePath, nova.fs.X_OK)) {
    Messages.showNotice(
      Messages.getMsg(Catalog.msgUpToDate).replace("_PROG_", prog.name),
      `${prog.name} ${curr}`
    );
    console.log(`Program ${prog.name} is current.`);
    return true;
  }

  let title = Messages.getMsg(
    curr ? Catalog.msgNewComponentTitle : Catalog.msgMissingComponentTitle
  );
  let text = Messages.getMsg(
    curr ? Catalog.msgNewComponentBody : Catalog.msgMissingComponentBody
  );
  let n = new NotificationRequest("autoUpdate");
  n.title = title;
  n.body = text
    .replace("_PROG_", prog.name)
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
    args: ["install", prog.pkg + "@" + next],
    env: { GOBIN: extPath },
  };

  let proc = new Process(goexec, options);
  proc.onDidExit((status) => {
    if (status == 0) {
      // notify watchers (should cause a reboot)
      if (prog.restart) {
        State.emitter.emit(State.events.onUpdate);
      }
      nova.config.set(prog.cur, next);
    } else {
      Messages.showError(Catalog.msgComponentUpdateFailed);
    }
  });
  try {
    proc.start();
  } catch (err) {
    Messages.showError(Catalog.msgComponentUpdateFailed);
  }
}

//nova.commands.register(Commands.checkForUpdate, async function (_) {

async function checkForUpdateCmd() {
  if (Prefs.getConfig(Config.lspFlavor) != "auto") {
    Messages.showNotice(
      Catalog.msgComponentIsNotAutoTitle,
      Catalog.msgComponentIsNotAutoBody
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
  if (Prefs.getConfig(Config.checkForUpdates)) {
    if (Prefs.getConfig(Config.lspFlavor) == "auto") {
      // if it doesn't work, don't bother warning about it.
      try {
        await checkForUpdateProg(progs.gopls);
      } catch (error) {}
    }
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
