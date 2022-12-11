//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

const Commands = require("./commands.js");
const Messages = require("./messages.js");
const Catalog = require("./catalog.js");
const Position = require("./position.js");
const Ranges = require("./ranges.js");
const Lsp = require("./lsp.js");
const State = require("./state.js");

// internal navigate function
async function jumpTo(editor, thing) {
  try {
    const selected = editor.selectedRange;
    if (!selected) {
      Messages.showError(Catalog.msgNothingSelected);
      return;
    }
    const position = Position.toLsp(editor.document, selected.start);
    const response = await Lsp.sendRequest(`textDocument/${thing}`, {
      textDocument: { uri: editor.document.uri },
      position: position,
    });
    await chooseLocation(response);
  } catch (err) {
    Messages.showError(err.message ?? err);
  }
}

// showLocation will either jump to a Location,
// or to a LocationLink.  It will apply the text selection
// appropriately.  Note that CCLS returns LocationLink
// whereas CLangD returns plain Location.
async function showLocation(loc) {
  // this might be a Location, or it might be a LocationLink
  if (loc.targetUri) {
    return nova.workspace
      .openFile(loc.targetUri, {
        line: loc.targetRange.start.line + 1,
        column: loc.targetRange.start.character + 1,
      })
      .then((editor) => {
        let sel = Ranges.fromLsp(editor.document, loc.targetSelectionRange);
        editor.selectedRange = sel;
      });
  }
  return nova.workspace
    .openFile(loc.uri, {
      // this object starts counting at 1
      line: loc.range.start.line + 1,
      column: loc.range.start.character + 1,
    })
    .then((editor) => {
      let sel = Ranges.fromLsp(editor.document, loc.range);
      editor.selectedRange = sel;
    });
}

// chooseLocation either jumps to a location if the
// argument is a single location, or offers a selection palette.
// It understands both Location and LocationLink.
async function chooseLocation(locs) {
  if (!Array.isArray(locs)) {
    if (locs) {
      return showLocation(locs);
    }
    Messages.showNotice(Catalog.msgNothingFound, "");
    return;
  }
  if (locs.length == 0) {
    Messages.showNotice(Catalog.msgNothingFound, "");
    return;
  }
  if (locs.length == 1) {
    return showLocation(locs[0]);
  }
  let choices = [];
  for (let i in locs) {
    let uri = "";
    let line = 1;
    if (locs[i].targetUri) {
      uri = locs[i].targetUri;
      line = locs[i].targetRange.start.line + 1;
    } else {
      uri = locs[i].uri;
      line = locs[i].range.start.line + 1;
    }
    let file = uri.replace(/^file:\/\//, "");
    file = nova.workspace.relativizePath(file);
    choices.push(`${file}:${line}`);
  }
  nova.workspace.showChoicePalette(
    choices,
    { placeholder: Messages.getMsg(Catalog.msgSelectLocation) },
    (choice, index) => {
      if (choice != null) {
        showLocation(locs[index]);
      }
    }
  );
}

function register() {
  State.registerCommand(Commands.jumpToDefinition, (editor) =>
    jumpTo(editor, "definition")
  );
  State.registerCommand(Commands.jumpToTypeDefinition, (editor) =>
    jumpTo(editor, "typeDefinition")
  );
  // declaration is not supported in gopls (probably not very useful for go anyway)
  // State.registerCommand(Commands.jumpToDeclaration, (editor) =>
  //   jumpTo(editor, "declaration")
  // );
  State.registerCommand(Commands.jumpToImplementation, (editor) =>
    jumpTo(editor, "implementation")
  );
}

module.exports = { register: register, showLocation: showLocation };
