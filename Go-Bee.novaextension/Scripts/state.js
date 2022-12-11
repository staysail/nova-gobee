//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

//
// State just provides access to common, "global" extension state.
// For example we use a single Emitter for different modules to access,
// and a single composite disposal object.
//

let emitter = new Emitter();
let disposal = new CompositeDisposable();

function registerCommand(cmd, fn) {
  disposal.add(nova.commands.register(cmd, fn));
}

const State = {
  emitter: emitter,
  disposal: disposal,
  registerCommand: registerCommand,

  // events we can watch  for
  events: {
    onUpdate: "onUpdate", // a new update is ready (restart server)
    onActivate: "onActivate", // we are activating
  },
};

module.exports = State;
