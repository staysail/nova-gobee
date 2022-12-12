//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

// These are configuration parameters. If public they should be
// exposed via the extension.json file.  Note that these all have
// the above prefix.

const keys = {
  lspFlavor: "gobee.lsp.flavor",
  lspPath: "gobee.lsp.path",
  goExec: "gobee.go.exec",
  goPath: "gobee.gopath",
  buildFlags: "gobee.buildFlags",

  formatOnSave: "gobee.format.onSave",
  localPrefix: "gobee.format.localPrefix",
  useGofumpt: "gobee.format.gofumpt",
  checkForUpdates: "gobee.checkForUpdates",

  // context keys that don't get written out
  version: "gobee.version", // our version so that other extensions can find us
  currentGoPls: "gobee.gopls.current",
  releaseGoPls: "gobee.gopls.release",
};

module.exports = keys;
