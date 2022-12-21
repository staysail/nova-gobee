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

function findTool(toolname) {
  if (nova.path.isAbsolute(toolname)) {
    return nova.fs.access(toolname, nova.fs.X_OK) ? toolname : null;
  }
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
  let paths = Paths.findProgram(dirs, [toolname]);
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

  let goExec = findTool(Prefs.getConfig(Config.goExec) ?? "go");
  let path = findTool(Prefs.getConfig(Config.lspPath) ?? "gopls");
  let args = [];
  let server = null;

  switch (flavor) {
    case flavorAuto:
      args = [];
      //let ver = Prefs.getConfig(Config.currentGoPls);
      path = nova.path.join(nova.extension.globalStoragePath, "gopls");
      server = "gopls";
      break;
    case flavorCustom:
      args = [];
      server = "gopls";
      break;
    default:
      console.error("Unknown LSP flavor. Please submit a bug report.");
      return;
  }

  if (!goExec) {
    Messages.showNotice(Catalog.msgNoGo, "");
    return;
  }
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

  // gopls relies upon the PATH to find the go executable. Determine
  // if we need to modify the path to ensure the go specified in preferences
  // is found first.
  let goInPaths = Paths.findProgram(Paths.expandPath(), ["go"]);
  if (goInPaths.length < 1 || goInPaths[0] !== goExec) {
    serverOptions.env = {
      PATH: [nova.path.dirname(goExec), nova.environment["PATH"]].join(":"),
    };
  }

  let initOpts = {};
  if (Prefs.getConfig(Config.buildFlags)) {
    initOpts["gopls.build.buildFlags"] = Prefs.getConfig(Config.buildFlags);
  }
  if (Prefs.getConfig(Config.localPrefix)) {
    initOpts["gopls.format.local"] = Prefs.getConfig(Config.localPrefix);
  }
  initOpts["gopls.format.gofumpt"] = !!Prefs.getConfig(Config.useGofumpt);

  var clientOptions = {
    // The set of document syntaxes for which the server is valid
    syntaxes: ["go"],
    initializationOptions: initOpts,
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
    Messages.showNotice(Catalog.msgLspDidNotStart, err.message ?? err);
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
  let ov = Prefs.getConfig(name);
  const watchFunc = function () {
    const nv = Prefs.getConfig(name);
    if (nv !== ov) {
      let old = ov;
      ov = nv;
      cb(nv, old);
    }
  };
  State.disposal.add(nova.config.onDidChange(name, watchFunc));
  State.disposal.add(nova.workspace.config.onDidChange(name, watchFunc));
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
      let gopls = findTool(Prefs.getConfig(Config.lspPath) ?? "gopls");
      if (gopls != null) {
        nova.config.set(Config.lspPath, gopls);
      }
      break;
    case flavorNone:
      nova.config.remove(Config.lspPath);
      break;
  }
  restartClient();
}

function watchConfigRestart() {
  watchConfigVarCb(Config.lspFlavor, onFlavorChanged);
  watchConfigVarCb(Config.lspPath, restartClient);
  watchConfigVarCb(Config.goExec, restartClient);
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
