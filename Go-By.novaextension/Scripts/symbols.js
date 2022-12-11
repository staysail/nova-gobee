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

let files = [];
let matches = {};
function symbolsTreeProvider() {
  return {
    getParent(_) {
      return null;
    },
    getChildren(element) {
      if (element == null) {
        return files;
      }
      if (typeof element == "string") {
        return matches[element] ?? [];
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
        // { sore, kind, containerName, name, location }
        let kind = symbolKindToNova[Number(element.kind)];

        const item = new TreeItem(element.name);
        item.descriptiveText = symbolKindToText[Number(element.kind)];
        if (element.containerName) {
          item.descriptiveText += ` in ${element.containerName}`;
        }
        item.command = Commands.showSymbols;
        item.image = `__symbol.${kind}`;
        item.tooltip = `${element.file} line ${
          element.location.range.start.line + 1
        }`;
        return item;
      }
    },
  };
}

let symbolsTv = null;

async function findSymbols(editor) {
  const search = await new Promise((resolve) => {
    let sel = nova.workspace.activeTextEditor?.selectedText;
    sel = sel.trim();
    let m = sel.match(/^([A-Za-z_][A-Za-z0-9_]*)/);
    sel = m?.length > 1 ? m[1] : "";
    nova.workspace.showInputPanel(
      Messages.getMsg(Catalog.msgSymbolsSearch),
      {
        label: Messages.getMsg(Catalog.msgSymbol),
        prompt: Messages.getMsg(Catalog.msgSearch),
        value: sel,
      },
      resolve
    );
  });

  if (search == null || search == "") {
    // in theory we could allow an empty string to find all symbols, but that
    // is kind of excessive.
    return;
  }

  try {
    let result = await Lsp.sendRequest("workspace/symbol", {
      query: search,
    });

    if (result == null || result.length == 0) {
      Messages.showNotice(Catalog.msgNothingFound, "");
      return;
    }

    matches = {};
    files = [];

    for (let res of result) {
      // so we need to find and sort by file.  we are going to look
      // at the location, so that we can match by tree.
      let loc = res.location;
      if (!loc) {
        continue;
      }
      let name = loc.uri;
      if (name.startsWith("file:///")) {
        name = name.slice("file://".length);
        name = nova.workspace.relativizePath(name);
      }
      // we want to preserve the order of the symbols (matched order)
      // so we are going to keep both an array, and a dictionary
      if (!matches[name]) {
        matches[name] = [];
        files.push(name); // preserve ordering
      }
      res.file = name;
      matches[name].push(res);
    }

    let title = Messages.getMsg(Catalog.msgSymbolsFoundTitle);
    title = title
      .replace("_COUNT_", result.length)
      .replace("_FILES_", files.length);
    symbolsTv.reload();
    Messages.showNotice(title, Catalog.msgSymbolsFoundBody);
  } catch (err) {
    files = {};
    Messages.showError(err.message ?? err);
  }
}

async function showSymbols() {
  if (symbolsTv == null) {
    return;
  }
  let wait = [];
  for (let sel of symbolsTv.selection) {
    if (!Array.isArray(sel)) {
      wait.push(
        nova.workspace.openFile(sel.location.uri, {
          // this object starts counting at 1
          line: sel.location.range.start.line + 1,
          column: sel.location.range.start.character + 1,
        })
      );
    }
  }
  return Promise.all(wait);
}

// credit for the following maps to:
// https://github.com/apexskier/nova-typescript/blob/main/src/searchResults.ts
// (part of the TypeScript extension for Nova)
// See also: https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#symbolKind

const symbolKindToText = {
  1: "File",
  2: "Module",
  3: "Namespace",
  4: "Package",
  5: "Class",
  6: "Method",
  7: "Property",
  8: "Field",
  9: "Constructor",
  10: "Enum",
  11: "Interface",
  12: "Function",
  13: "Variable",
  14: "Constant",
  15: "String",
  16: "Number",
  17: "Boolean",
  18: "Array",
  19: "Object",
  20: "Key",
  21: "Null",
  22: "EnumMember",
  23: "Struct",
  24: "Event",
  25: "Operator",
  26: "TypeParameter",
};

const symbolKindToNova = {
  1: "file",
  2: "package", // Module
  3: "package", // Namespace
  4: "package",
  5: "class",
  6: "method",
  7: "property",
  8: "property", // Field
  9: "constructor",
  10: "enum",
  11: "interface",
  12: "function",
  13: "variable",
  14: "constant",
  15: "variable", // String
  16: "variable", // Number
  17: "variable", // Boolean
  18: "variable", // Array
  19: "variable", // Object
  20: "keyword", // Key
  21: "variable", // Null
  22: "enum-member",
  23: "struct",
  24: "variable", // Event
  25: "expression", // Operator
  26: "type", // TypeParameter
};

function register() {
  symbolsTv = new TreeView("goby.sidebar.symbols", {
    dataProvider: symbolsTreeProvider(),
  });

  State.disposal.add();
  State.registerCommand(Commands.findSymbols, (editor) => findSymbols(editor));
  State.registerCommand(Commands.showSymbols, (_) => {
    showSymbols();
  });
}

module.exports = { register: register };
