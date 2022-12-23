//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

const State = require("./state.js");
const Catalog = require("./catalog.js");
const Commands = require("./commands.js");
const Messages = require("./messages.js");
const GoLang = require("./golang.js");

// Various stuff related to go modules.

async function mod_tidy(editor) {
  let doc = editor.document.path;
  if (!doc) {
    return;
  }
  let dir = nova.path.dirname(doc);
  if (!nova.workspace.contains(nova.path.join(dir, "go.mod"))) {
    Messages.showWarning(Catalog.msgModMissing);
    return;
  }
  let goexec = await GoLang.checkForGo();

  if (!goexec) {
    return;
  }

  let p = new Process(goexec, {
    args: ["mod", "tidy"],
    cwd: dir,
  });
  p.start();
}

async function mod_init(editor) {
  let doc = editor.document.path;
  if (!doc) {
    return;
  }
  let dir = nova.path.dirname(doc);
  if (nova.workspace.contains(nova.path.join(dir, "go.mod"))) {
    Messages.showWarning(Catalog.msgModExists);
    return;
  }
  let goexec = await GoLang.checkForGo();

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
  State.registerCommand(Commands.goModTidy, mod_tidy);
}

module.exports = {
  register: register,
};
