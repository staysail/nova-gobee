//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

// delay returns a promise that resolves after the given number of milliseconds.
function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

module.exports = delay;
