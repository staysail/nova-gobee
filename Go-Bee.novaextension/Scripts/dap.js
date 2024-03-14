//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

// This file supports delve based debugging over DAP.

const free_port = require("./freeport.js");
const State = require("./state.js");
const Config = require("./config.js");
const Prefs = require("./prefs.js");
const Paths = require("./paths.js");

let dlvPath = "";

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

async function resolveTaskAction(context) {
  let actionType = context.action;
  if (actionType == Task.Run) {
    let config = context.config;
    let data = context.data;
    let debugArgs = {};

    let action = new TaskDebugAdapterAction("dlv");
    action.debugArgs = {};

    if (context.data && context.data.type == "attach") {
      action.adapterStart = "attach";
      action.socketPort = config?.get("gobee.dap.port");
      action.socketHost = config?.get("gobee.dap.host");
      action.debugRequest = "attach"; // we launch the program
      action.transport = "socket";
      debugArgs.mode = "remote";
    } else {
      let port = await free_port();
      if (!port) {
        return null;
      }
      action.adapterStart = "launch"; // nova will start the adapter
      action.command = dlvPath;
      action.args = ["dap", "--listen", "127.0.0.1:" + port];
      action.debugRequest = "launch"; // we launch the program
      action.socketPort = port;
      action.transport = "socket";
      debugArgs.program =
        config?.get("gobee.dap.program") ?? nova.workspace.path;
      debugArgs.args = config?.get("gobee.dap.args") ?? data.args ?? [];
      debugArgs.mode = config?.get("gobee.dap.mode") ?? data.mode ?? "debug";
      debugArgs.cwd = config?.get("gobee.dap.cwd") ?? data.cwd ?? "";
      debugArgs.coreFilePath = config?.get("gobee.dap.coreFile") ?? "";
      debugArgs.buildFlags =
        config?.get("gobee.dap.buildFlags") ?? data.buildFlags ?? "";
      if (config?.get("gobee.dap.env")) {
        debugArgs.env = {};
        for (item of config.get("gobee.dap.env")) {
          let m = item.split("=", 2);
          debugArgs.env[m[0]] = m[1];
        }
      }
    }

    if (config) {
      debugArgs.ShowGlobalVariables = !!config.get("gobee.dap.showGlobals");
      debugArgs.ShowRegisters = !!config.get("gobee.dap.showRegisters");
      debugArgs.HideSystemGoroutines = !!config.get(
        "gobee.dap.hideSystemGoroutines"
      );
      if (config.get("gobee.dap.pathMappings")) {
        debugArgs.substitutePath = [];
        let pm = config.get("gobee.dap.pathMappings");
        for (item of pm) {
          let m = item.split(":", 1);
          debugArgs.substitutePath.push({
            from: m[0],
            to: item.slice(m[0].length),
          });
        }
      }
    }

    action.debugArgs = debugArgs;

    return action;
  } else {
    return null;
  }
}

function provideTasks() {
  switch (Prefs.getConfig(Config.dapFlavor)) {
    case "none":
      return [];
    case "auto":
      dlvPath = nova.path.join(nova.extension.globalStoragePath, "dlv");
      break;
    default:
      dlvPath = findTool(Prefs.getConfig(Config.dapPath) ?? "dlv");
      break;
  }

  // we only offer to do go level projects if a go.mod file is present
  if (nova.workspace.contains(nova.path.join(nova.workspace.path, "go.mod"))) {
    let pt = new Task("Debug Go Package");
    pt.setAction(
      Task.Run,
      new TaskResolvableAction({ data: { mode: "debug" } })
    );
    pt.image = "go";

    let nt = new Task("Debug Go Test");
    nt.setAction(
      Task.Run,
      new TaskResolvableAction({ data: { mode: "test" } })
    );
    nt.image = "go";

    return [pt, nt];
  }
  return [];
}

function register() {
  // TODO: Watch the dapFlavor and dapPath configs

  State.disposal.add(
    nova.assistants.registerTaskAssistant(
      {
        resolveTaskAction: resolveTaskAction,
        provideTasks: provideTasks,
      },
      { identifier: "dlv", name: "Go (Delve)" }
    )
  );
}

module.exports = { register: register };
