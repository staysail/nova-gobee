//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

const State = require("./state.js");
const Catalog = require("./catalog.js");
const Commands = require("./commands.js");
const Messages = require("./messages.js");
const Paths = require("./paths.js");
const Prefs = require("./prefs.js");
const Config = require("./config.js");

// Various stuff related to go modules.

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

async function mod_init(editor) {
  let doc = editor.document.path;
  console.warn("DOC is", doc);
  if (!doc) {
    return;
  }
  let dir = nova.path.dirname(doc);
  if (nova.workspace.contains(nova.path.join(dir, "go.mod"))) {
    Messages.showWarning(Catalog.msgModExists);
    return;
  }
  let goexec = await checkForGo();

  if (!goexec) {
    return;
  }
  const package = await new Promise((resolve) => {
    // default package is just the directory name
    // if we had a good way to get the associated git repo,
    // we could fully qualify it.

    let base = nova.path.join(
      nova.path.basename(nova.workspace.path),
      nova.workspace.relativizePath(dir)
    );
    nova.workspace.showInputPanel(
      Messages.getMsg(Catalog.msgGoModInit),
      {
        label: Messages.getMsg(Catalog.msgPackageName),
        prompt: Messages.getMsg(Catalog.msgInitMod),
        value: base,
      },
      resolve
    );
  });

  if (package == null || package == "") {
    // in theory we could allow an empty string to find all symbols, but that
    // is kind of excessive.
    return;
  }

  let p = new Process(goexec, {
    args: ["mod", "init", package],
    cwd: dir,
  });
  p.start();
}

function register() {
  State.registerCommand(Commands.goModInit, mod_init);
}

module.exports = {
  register: register,
};
