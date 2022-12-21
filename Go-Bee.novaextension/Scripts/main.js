//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.
//

const Prefs = require("./prefs.js");
const Lsp = require("./lsp.js");
const Format = require("./format.js");
const Navigate = require("./navigate.js");
const References = require("./references.js");
const Symbols = require("./symbols.js");
const Rename = require("./rename.js");
const Update = require("./update.js");
const State = require("./state.js");
const Dap = require("./dap.js");

exports.activate = async function () {
  Prefs.register();
  Format.register();
  Navigate.register();
  References.register();
  Symbols.register();
  Rename.register();
  Lsp.register();
  Update.register();
  Dap.register();

  // kick off signal to get everything running
  State.emitter.emit(State.events.onActivate);
};

exports.deactivate = function () {
  // Clean up state before the extension is deactivated
  State.disposal.dispose();
};
