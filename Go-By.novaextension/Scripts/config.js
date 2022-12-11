//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

// These are configuration parameters. If public they should be
// exposed via the extension.json file.  Note that these all have
// the above prefix.

const keys = {
  lspFlavor: "goby.lsp.flavor",
  lspPath: "goby.lsp.path",

  formatOnSave: "goby.fmt.onSave",
  checkForUpdates: "goby.checkForUpdates",

  // context keys that don't get written out
  version: "goby.version", // our version so that other extensions can find us
  currentGoPls: "goby.gopls.current",
  releaseGoPls: "goby.gopls.release",
};

module.exports = keys;
