// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

// This code tries to find a free TCP port.  Since we don't have
// a good way to do this in our runtime directly, we utilize python,
// which should be installed ~everywhere we need to run.

// There is an inherent race here, as the port is opened (via 0),
// then closed, and another application may squat on the same part
// right after we return.  But applications which use this same
// strategy (which is fairly idiomatic), should not resolve to the same
// port unless there are no other free ones available.

const delay = require("./delay.js");

let port = undefined;
async function free_port() {
  // pretty sure there is a better to do this, but... meh.
  this.port = undefined;
  let p = new Process("/usr/bin/python3", {
    args: [
      "-c",
      'import socket; s=socket.socket(); s.bind(("", 0)); print(s.getsockname()[1]); s.close()',
    ],
  });
  p.onStdout((line) => {
    this.port = line.trim();
  }, this);
  try {
    p.start();
  } catch (err) {
    console.error("Failed to get free port", err, err.message);
    return undefined;
  }

  let maxTime = 1000;
  while (maxTime > 0) {
    if (this.port) {
      return this.port;
    }
    await delay(10);
    maxTime -= 10;
  }
  return undefined;
}

module.exports = free_port;
