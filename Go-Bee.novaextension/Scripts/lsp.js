//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

const Commands = require("./commands.js");
const Config = require("./config.js");
const Messages = require("./messages.js");
const Catalog = require("./catalog.js");
const State = require("./state.js");
const Prefs = require("./prefs.js");
const Paths = require("./paths.js");
const delay = require("./delay.js");

var lspClient = null;

// LSP flavors
const flavorCustom = "custom";
const flavorAuto = "auto"; // automatic download from GitHub
const flavorNone = "none";

function stopClient() {
  if (lspClient) {
    lspClient.stop();
    lspClient = null;
  }
}

function findGopls() {
  let gopath = nova.environment["GOPATH"];
  let dirs = [];
  if (gopath) {
    dirs.push(gopath + "/bin");
  }
  dirs = dirs.concat(Paths.expandPath());
  dirs = dirs.concat([
    "/usr/local/bin",
    "/opt/homebrew/bin",
    "/usr/local/go/bin",
    "/usr/bin",
  ]);
  let paths = Paths.findProgram(dirs, ["gopls"]);
  if (paths.length > 0) {
    return paths[0];
  }
  return null;
}

async function startClient() {
  let flavor = Prefs.getConfig(Config.lspFlavor);
  if (flavor == flavorNone) {
    Messages.showNotice(
      Catalog.msgLspDisabledTitle,
      Catalog.msgLspDisabledBody
    );
    return null;
  }
  if (!flavor) {
    flavor = flavorAuto;
  }

  // determine compile commands

  let path = Prefs.getConfig(Config.lspPath);
  let args = [];
  let server = null;

  switch (flavor) {
    case flavorAuto:
      args = [];
      //let ver = Prefs.getConfig(Config.currentGoPls);
      path = nova.path.join(nova.extension.globalStoragePath, `gopls`);
      server = "gopls";
      path = findGopls();
      break;
    case flavorCustom:
      args = [];
      path = path ?? findGopls();
      server = "ccls";
      break;
    default:
      console.error("Unknown LSP flavor. Please submit a bug report.");
      return;
  }

  console.warn("LSP PATH", path);
  if (!path || !nova.fs.access(path, nova.fs.X_OK)) {
    if (flavor != flavorAuto) {
      // auto flavor does an update check
      Messages.showNotice(Catalog.msgNoLspClient, "");
    }
    return;
  }

  // Create the client
  var serverOptions = {
    path: path,
    args: args,
  };
  var clientOptions = {
    // The set of document syntaxes for which the server is valid
    syntaxes: ["go"],
  };

  lspClient = new LanguageClient(
    server + Date.now(), // use a unique server id for each call
    "Go Language Server",
    serverOptions,
    clientOptions
  );

  lspClient.onDidStop((error) => {
    console.warn("Language server stopped.");
    if (error) {
      console.error(
        "Language encountered error:",
        error.message || error || "unknown exit"
      );
      Messages.showNotice(Catalog.msgLspStoppedErr, error.message ?? error);
    }
  });

  try {
    // Start the client
    lspClient.start();
  } catch (err) {
    Messages.showNotice(Catalog.msgLspDidNotStart, err.message);
    return false;
  }

  var limit = 1000;
  while (!lspClient.running && limit > 0) {
    delay(10);
    limit -= 10;
  }

  if (lspClient.running) {
    return true;
  }

  Messages.showNotice(Catalog.msgLspDidNotStart, "");
  return false;
}

async function restartClient() {
  console.warn("Stopping language server for restart.");
  stopClient();
  if (Prefs.getConfig(Config.lspFlavor) == flavorNone) {
    return;
  }
  delay(2000); // wait a while before trying to restart
  console.warn("Start language server in restart.");
  let rv = await startClient();
  if (rv) {
    console.warn("Language server resetart complete");
    Messages.showNotice(Catalog.msgLspRestarted, "");
  }
  return rv;
}

async function sendRequest(method, params) {
  if (lspClient == null) {
    Messages.showError(Catalog.msgNoLspClient);
    return null;
  } else {
    return await lspClient.sendRequest(method, params);
  }
}

function sendNotification(method, params) {
  if (lspClient) {
    return lspClient.sendNotification(method, params);
  }
}

function watchConfigVarCb(name, cb) {
  State.disposal.add(
    nova.config.onDidChange(name, (nv, ov) => {
      // this doesn't send an update a workspace override exists
      if (nova.workspace.config.get(name) == null) {
        if (nv != ov) {
          cb(nv, ov);
        }
      }
    })
  );
  State.disposal.add(
    nova.workspace.config.onDidChange(name, (nv, ov) => {
      // this always sends an update
      if (nv != ov) {
        cb(nv, ov);
      }
    })
  );
}

function onFlavorChanged(newV, oldV) {
  if (newV == oldV) {
    return;
  }
  switch (newV) {
    case flavorAuto:
      nova.config.remove(Config.lspPath);
      break;
    case flavorCustom:
      let gopls = findGopls();
      if (gopls != null) {
        nova.config.set(Config.lspPath, gopls);
      }
      break;
    case flavorNone:
      nova.config.remove(cfgLspPath);
      break;
  }
  restartClient();
}

function watchConfigRestart() {
  watchConfigVarCb(Config.lspFlavor, onFlavorChanged);
  watchConfigVarCb(Config.lspPath, restartClient);
  watchConfigVarCb(Config.compileCommandsDir, restartClient);
}

function register() {
  watchConfigRestart();
  State.registerCommand(Commands.restartServer, restartClient);
  State.emitter.on(State.events.onUpdate, restartClient);
  State.emitter.on(State.events.onActivate, startClient);
}

let Lsp = {
  deactivate: stopClient,
  sendRequest: sendRequest,
  sendNotification: sendNotification,
  register: register,
};
module.exports = Lsp;
