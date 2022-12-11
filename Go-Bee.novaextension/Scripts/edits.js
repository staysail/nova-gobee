//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

const Catalog = require("./catalog.js");
const Messages = require("./messages.js");
const Ranges = require("./ranges.js");

// changes in reverse order, so that earlier changes
// do not disrupt later ones.  some methods and
// servers give them to us in sensible order,
// others do it in reverse.
function sortChangesReverse(changes) {
  let result = changes.sort(function (a, b) {
    if (a.range.start.line != b.range.start.line) {
      return b.range.start.line - a.range.start.line;
    }
    return b.range.start.character - a.range.start.character;
  });

  return result;
}

function applyEdits(editor, edits) {
  return editor.edit((textEditorEdit) => {
    for (const change of sortChangesReverse(edits)) {
      const range = Ranges.fromLsp(editor.document, change.range);
      textEditorEdit.replace(range, change.newText);
    }
  });
}

// applyWorkspaceEdits is used to apply a group of edits that might
// span several files to the framework.
async function applyWorkspaceEdits(edit) {
  // at present we only support the simple changes field.
  // to support richer document changes we will need to express
  // more capabilities during negotiation.
  if (!edit.changes) {
    // this should come in the form of a documentChanges
    if (!edit.documentChanges) {
      Messages.showWarning(Catalog.msgUnableToApply);
      return;
    }
    // Note that we can only support edits not creates or renames
    // and not annotations.  But this is good enough for CCLS.
    // We also don't have any notion of document versioning.
    for (const dc in edit.documentChanges) {
      // Possibly support rename, create, and delete operations
      const uri = edit.documentChanges[dc].textDocument.uri;
      let edits = edit.documentChanges[dc].edits;
      if (!edits.length) {
        continue;
      }
      const editor = await nova.workspace.openFile(uri);
      if (!editor) {
        Messages.showWarning(
          Messages.getMsg(Catalog.msgUnableToOpen).replace("_URI_", uri)
        );
        continue;
      }
      applyEdits(editor, edits);
    }
    return;
  }

  // legacy simple changes
  for (const uri in edit.changes) {
    const changes = edit.changes[uri];
    if (!changes.length) {
      continue; // this should not happen
    }
    const editor = await nova.workspace.openFile(uri);
    if (!editor) {
      Messages.showWarning(
        Messages.getMsg(Catalog.msgUnableToOpen).replace("_URI_", uri)
      );
      continue;
    }
    applyEdits(editor, changes);
  }
}

module.exports = {
  applyEdits: applyEdits,
  applyWorkspaceEdits: applyWorkspaceEdits,
};
