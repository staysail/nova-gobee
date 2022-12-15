//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

// These are string keys for localization.
// It is important that the string values match the
// key values, and that the key values match the keys
// of the values object as well.

const catalog = {
  msgNoGo: "msgNoGo",
  msgNoLspClient: "msgNoLspClient",
  msgLspDisabledTitle: "msgLspDisabledTitle",
  msgLspDisabledBody: "msgLspDisabledBody",
  msgLspDidNotStart: "msgLspDidNotStart",
  msgLspStoppedErr: "msgLspStoppedErr",
  msgLspRestarted: "msgLspRestarted",
  msgNothingSelected: "msgNothingSelected",
  msgNothingFound: "msgNothingFound",
  msgSelectLocation: "msgSelectLocation",
  msgUnableToApply: "msgUnableToApply",
  msgUnableToOpen: "msgUnableToOpen",
  msgUnableToResolveSelection: "msgUnableToResolveSelection",
  msgSelectionNotSymbol: "msgSelectionNotSymbol",
  msgSelectionNotRenameable: "msgSelectionNotRenameable",
  msgRenameSymbol: "msgRenameSymbol",
  msgNewName: "msgNewName", // for renaming symbols
  msgCouldNotRenameSym: "msgCouldNotRenameSym",
  msgNewLspTitle: "msgNewLspTitle",
  msgNewLspBody: "msgNewLspBody",
  msgMissingLspTitle: "msgMissingLspTitle",
  msgMissingLspBody: "msgMissingLspBody",
  msgUpToDate: "msgUpToDate",
  msgInstall: "msgInstall",
  msgUpdate: "msgUpdate",
  msgCancel: "msgCancel",
  msgSearch: "msgSearch",
  msgRename: "msgRename",
  msgDownloadFailed: "msgDownloadFailed",
  msgLspIsNotAutoTitle: "msgLspIsNotAutoTitle",
  msgLspIsNotAutoBody: "msgLspIsNotAutoBody",
  msgReferencesFoundTitle: "msgReferencesFoundTitle",
  msgReferencesFoundBody: "msgReferencesFoundBody",
  msgSymbolsFoundTitle: "msgSymbolsFoundTitle",
  msgSymbolsFoundBody: "msgSymbolsFoundBody",
  msgSymbolsSearch: "msgSymbolsSearch",
  msgSymbol: "msgSymbol",
  msgNeedGoTitle: "msgNeedGoTitle",
  msgNeedGoBody: "msgNeedGoBody",
  msgLspUpdateFailed: "msgLspUpdateFailed",
};

// default English strings
const values = {};
// fill in the values
values[catalog.msgNoGo] = "No Go command.";
values[catalog.msgNoLspClient] = "No LSP client.";
values[catalog.msgLspDisabledTitle] = "Language server is disabled.";
values[catalog.msgLspDisabledBody] =
  "Some functionality will be reduced without a language server.";
values[catalog.msgLspDidNotStart] = "Language server failed to start.";
values[catalog.msgLspStoppedErr] = "Language server stopped with an error.";
values[catalog.msgLspRestarted] = "Language server restarted.";
values[catalog.msgNothingSelected] = "Nothing is selected";
values[catalog.msgNothingFound] = "No matches found.";
values[catalog.msgSelectLocation] = "Select location";
values[catalog.msgUnableToApply] = "Unable to apply changes.";
values[catalog.msgUnableToOpen] = "Unable to open _URI_";
values[catalog.msgUnableToResolveSelection] = "Unable to resolve selection";
values[catalog.msgSelectionNotSymbol] = "Selection is not a symbol";
values[catalog.msgSelectionNotRenameable] = "No renameable symbol at cursor";
values[catalog.msgRenameSymbol] = "Rename symbol _OLD_SYMBOL_";
values[catalog.msgNewName] = "New name";
values[catalog.msgCouldNotRenameSym] = "Could not rename symbol";
values[catalog.msgNewLspTitle] = "Update Available";
values[catalog.msgNewLspBody] =
  "An new language server (gopls _VERSION_) update is available. (You have _OLD_VERSION_.)";
values[catalog.msgMissingLspTitle] = "Server Missing";
values[catalog.msgMissingLspBody] =
  "A language server is required for full functionality. Install gopls _VERSION_ now?";
values[catalog.msgUpToDate] = "Language server is up to date.";
values[catalog.msgInstall] = "Install";
values[catalog.msgUpdate] = "Update";
values[catalog.msgCancel] = "Cancel";
values[catalog.msgSearch] = "Search";
values[catalog.msgRename] = "Rename";
values[catalog.msgLspIsNotAutoTitle] = "Language server not updateable";
values[catalog.msgLspIsNotAutoBody] =
  "Automatic updates are only supported when using LLVM clangd.";
values[catalog.msgDownloadFailed] = "Download of asset failed.";
values[catalog.msgReferencesFoundTitle] =
  "Found _COUNT_ References in _FILES_ Files";
values[catalog.msgReferencesFoundBody] =
  "Check the References pane in the Go-Bee sidebar to see the results.";
values[catalog.msgSymbolsFoundTitle] = "Found _COUNT_ Matches in _FILES_ Files";
values[catalog.msgSymbolsFoundBody] =
  "Check the Symbols pane in the Go-Bee sidebar to see the results.";
values[catalog.msgSymbolsSearch] = "Search for symbol(s)";
values[catalog.msgSymbol] = "Symbol";
values[catalog.msgNeedGoTitle] = "Go not found";
values[catalog.msgNeedGoBody] = "For full functionality, please install Go.";
values[catalog.msgLspUpdateFailed] = "Failed to update or install gopls.";

// verify that every entry in the catalog has a matching entry in values
for (let name in catalog) {
  if (!values[name]) {
    throw `Key mismatch for ${name}`;
  }
}

catalog.values = values;

module.exports = catalog;
