//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

const Commands = require("./commands.js");
const Messages = require("./messages.js");
const Catalog = require("./catalog.js");
const Position = require("./position.js");
const Lsp = require("./lsp.js");
const State = require("./state.js");

// much of this logic was adapted from the Nova Typescript
// extension by Cameron Little, which carried this Copyright:
//
// Copyright (c) 2020 Cameron Little
//
// A fair number of local changes were made as well, to more closely
// match the way Nova presents things for it's own searches.

let files = {};
function referencesTreeProvider() {
  return {
    getParent(_) {
      return null;
    },
    getChildren(element) {
      if (element == null) {
        return Object.keys(files).sort();
      }
      if (typeof element == "string") {
        return files[element] ?? [];
      }
      return [];
    },
    getTreeItem(element) {
      if (typeof element == "string") {
        const item = new TreeItem(element, TreeItemCollapsibleState.Expanded);
        // NB: this causes the icon to be set properly too
        item.path = element;
        return item;
      } else {
        const item = new TreeItem(`${element.range.start.line + 1}:`);
        item.descriptiveText = element.text;
        item.command = Commands.showReferences;
        item.image = "__builtin.path";
        return item;
      }
    },
  };
}

let referencesTv = null;

async function findReferences(editor, includeDeclaration = true) {
  if (!TextEditor.isTextEditor(editor)) {
    editor = nova.workspace.activeTextEditor;
  }
  if (editor == null) {
    Messages.showError(Catalog.msgNothingSelected);
    return;
  }
  try {
    let selected = editor.selectedRange;
    if (!selected) {
      Messages.showError(Catalog.msgNothingSelected);
      return;
    }
    let position = Position.toLsp(editor.document, selected.start, true);

    let result = await Lsp.sendRequest("textDocument/references", {
      textDocument: { uri: editor.document.uri },
      position: position,
      context: { includeDeclaration: includeDeclaration },
    });

    if (result == null || result.length == 0) {
      Messages.showNotice(Catalog.msgNothingFound, "");
      return;
    }

    let opened = {};
    for (let doc of nova.workspace.textDocuments) {
      opened[doc.uri] = true;
    }

    let current = nova.workspace.activeTextEditor?.document?.uri;
    files = {};
    let waits = [];
    for (let res of result) {
      let name = res.uri;
      if (name.startsWith("file:///")) {
        name = name.slice("file://".length);
        name = nova.workspace.relativizePath(name);
      }
      if (!files[name]) {
        files[name] = [];
      }
      files[name].push(res);
      // only open files if we have not already done so
      if (!opened[res.uri]) {
        opened[res.uri] = true;
        waits.push(nova.workspace.openFile(res.uri));
      }
    }
    await Promise.all(waits);

    if (current) {
      await nova.workspace.openFile(current);
    }

    // for efficiency's sake, we only resolve line details at the end
    let count = 0;
    let nfiles = 0;
    for (let name in files) {
      nfiles++;
      // sort by line number so that low number results appear first
      files[name] = files[name].sort(function (a, b) {
        if (a.range.start.line != b.range.start.line) {
          return a.range.start.line - b.range.start.line;
        }
        return a.range.start.character - b.range.start.character;
      });

      if (files[name].length == 0) {
        continue;
      }
      let lines = [];
      for (let doc of nova.workspace.textDocuments) {
        if (doc.uri == files[name][0].uri) {
          lines = doc.getTextInRange(new Range(0, doc.length)).split(doc.eol);
          break;
        }
      }
      if (lines.length == 0) {
        continue;
      }
      for (let i in files[name]) {
        count++;
        let ln = files[name][i].range.start.line;
        files[name][i].text = lines.length > ln ? lines[ln].trim() : "...";
      }
    }

    referencesTv.reload();
    let title = Messages.getMsg(Catalog.msgReferencesFoundTitle);
    title = title.replace("_COUNT_", count).replace("_FILES_", nfiles);
    Messages.showNotice(title, Catalog.msgReferencesFoundBody);
  } catch (err) {
    files = {};
    Messages.showError(err.message ?? err);
  }
}

async function showReferences() {
  if (referencesTv == null) {
    return;
  }
  let wait = [];
  for (let sel of referencesTv.selection) {
    if (!Array.isArray(sel)) {
      wait.push(
        nova.workspace.openFile(sel.uri, {
          // this object starts counting at 1
          line: sel.range.start.line + 1,
          column: sel.range.start.character + 1,
        })
      );
    }
  }
  return Promise.all(wait);
}

function register() {
  referencesTv = new TreeView("gobee.sidebar.references", {
    dataProvider: referencesTreeProvider(),
  });

  State.disposal.add();
  State.registerCommand(Commands.findReferences, (editor) =>
    findReferences(editor)
  );
  State.registerCommand(Commands.showReferences, (_) => {
    showReferences();
  });
}

module.exports = { register: register };
