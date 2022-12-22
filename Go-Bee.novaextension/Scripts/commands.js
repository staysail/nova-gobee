//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

// These are command identifiers. If exposed to users they should be
// exposed via the extension.json file.  Note that these all have
// the above prefix.

const keys = {
  preferences: "gobee.preferences",
  extensionPreferences: "gobee.extensionPreferences",
  restartServer: "gobee.restartServer",
  jumpToDefinition: "gobee.jumpToDefinition",
  jumpToTypeDefinition: "gobee.jumpToTypeDefinition",
  jumpToDeclaration: "gobee.jumpToDeclaration",
  jumpToImplementation: "gobee.jumpToImplementation",
  formatFile: "gobee.formatFile",
  formatSelection: "gobee.formatSelection",
  checkForUpdate: "gobee.checkForUpdate",
  renameSymbol: "gobee.renameSymbol",
  findReferences: "gobee.findReferences",
  showReferences: "gobee.showReferences",
  findSymbols: "gobee.findSymbols",
  showSymbols: "gobee.showSymbols",
  goModInit: "gobee.goModInit",
  goModTidy: "gobee.goModTidy",
};

module.exports = keys;
