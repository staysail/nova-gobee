//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

// These are command identifiers. If exposed to users they should be
// exposed via the extension.json file.  Note that these all have
// the above prefix.

const keys = {
  preferences: "goby.preferences",
  extensionPreferences: "goby.extensionPreferences",
  restartServer: "goby.restartServer",
  jumpToDefinition: "goby.jumpToDefinition",
  jumpToTypeDefinition: "goby.jumpToTypeDefinition",
  jumpToDeclaration: "goby.jumpToDeclaration",
  jumpToImplementation: "goby.jumpToImplementation",
  formatFile: "goby.formatFile",
  formatSelection: "goby.formatSelection",
  checkForUpdate: "goby.checkForUpdate",
  renameSymbol: "goby.renameSymbol",
  findReferences: "goby.findReferences",
  showReferences: "goby.showReferences",
  findSymbols: "goby.findSymbols",
  showSymbols: "goby.showSymbols",
};

module.exports = keys;
