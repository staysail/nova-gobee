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
  msgNewComponentTitle: "msgNewComponentTitle",
  msgNewComponentBody: "msgNewComponentBody",
  msgMissingComponentTitle: "msgMissingComponentTitle",
  msgMissingComponentBody: "msgMissingComponentBody",
  msgUpToDate: "msgUpToDate",
  msgInstall: "msgInstall",
  msgUpdate: "msgUpdate",
  msgCancel: "msgCancel",
  msgSearch: "msgSearch",
  msgRename: "msgRename",
  msgDownloadFailed: "msgDownloadFailed",
  msgComponentIsNotAutoTitle: "msgComponentIsNotAutoTitle",
  msgComponentIsNotAutoBody: "msgComponentIsNotAutoBody",
  msgReferencesFoundTitle: "msgReferencesFoundTitle",
  msgReferencesFoundBody: "msgReferencesFoundBody",
  msgSymbolsFoundTitle: "msgSymbolsFoundTitle",
  msgSymbolsFoundBody: "msgSymbolsFoundBody",
  msgSymbolsSearch: "msgSymbolsSearch",
  msgSymbol: "msgSymbol",
  msgNeedGoTitle: "msgNeedGoTitle",
  msgNeedGoBody: "msgNeedGoBody",
  msgComponentUpdateFailed: "msgComponentUpdateFailed",
  msgGoModInit: "msgGoModInit",
  msgPackageName: "msgPackageName",
  msgInitMod: "msgInitMod",
  msgModExists: "msgModExists",
  msgModMissing: "msgModMissing",
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
values[catalog.msgNewComponentTitle] = "Update Available";
values[catalog.msgNewComponentBody] =
  "An updated external component (_PROG_ _VERSION_) is available. (You have _OLD_VERSION_.)";
values[catalog.msgMissingComponentTitle] = "Component Missing";
values[catalog.msgMissingComponentBody] =
  "An external compnent is required for full functionality. Install _PROG_ _VERSION_ now?";
values[catalog.msgUpToDate] = "Component _PROG_ is up to date.";
values[catalog.msgInstall] = "Install";
values[catalog.msgUpdate] = "Update";
values[catalog.msgCancel] = "Cancel";
values[catalog.msgSearch] = "Search";
values[catalog.msgRename] = "Rename";
values[catalog.msgComponentIsNotAutoTitle] = "Component not updateable";
values[catalog.msgComponentIsNotAutoBody] =
  "Automatic updates are only supported when using automatic.";
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
values[catalog.msgComponentUpdateFailed] =
  "Failed to update or install _PROG_.";

values[catalog.msgGoModInit] =
  "Enter the fully qualified module name to create, such as 'github.com/example/package'";
values[catalog.msgPackageName] = "Module name";
values[catalog.msgInitMod] = "Initialize";
values[catalog.msgModExists] = "Go module (go.mod) already exists.";
values[catalog.msgModMissing] = "No go.mod file.";

// verify that every entry in the catalog has a matching entry in values
for (let name in catalog) {
  if (!values[name]) {
    throw `Key mismatch for ${name}`;
  }
}

catalog.values = values;

module.exports = catalog;
