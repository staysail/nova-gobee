//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

const Commands = require("./commands.js");
const Messages = require("./Messages.js");
const Config = require("./config.js");
const Edits = require("./edits.js");
const State = require("./state.js");
const Prefs = require("./prefs.js");
const Lsp = require("./lsp.js");

async function formatFileCmd(editor) {
  try {
    await formatFile(editor);
  } catch (err) {
    Messages.showError(err.message);
  }
}

async function formatFile(editor) {
  var cmdArgs = {
    textDocument: {
      uri: editor.document.uri,
    },
    options: {
      tabSize: editor.tabLength,
      insertSpaces: editor.softTabs,
    },
    // TBD: options
  };
  const changes = await Lsp.sendRequest("textDocument/formatting", cmdArgs);

  if (!changes) {
    return;
  }
  await Edits.applyEdits(editor, changes);
}

function formatOnSave(editor) {
  if (editor.document.syntax != "go" && editor.document.syntax != "go") {
    return;
  }
  if (Prefs.getConfig(Config.lspFlavor == "none")) {
    return;
  }
  const formatOnSave = Prefs.getConfig(Config.formatOnSave);
  if (formatOnSave) {
    return formatFile(editor);
  }
}

// TODO: range formatting, if gopls implements it.  Likely this is hard to do
// because gofmt and goimports probably don't support it.
function register() {
  State.registerCommand(Commands.formatFile, formatFileCmd);

  State.disposal.add(
    nova.workspace.onDidAddTextEditor((editor) => {
      if (editor.document.syntax == "go") {
        State.disposal.add(editor.onWillSave((editor) => formatOnSave(editor)));
      }
    })
  );
}

module.exports = { register: register };
