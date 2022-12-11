//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

function findProgram(paths, progs) {
  let res = [];
  for (let p of paths) {
    for (let prog of progs) {
      if (nova.fs.access(nova.path.join(p, prog), nova.fs.X_OK)) {
        res.push(nova.path.join(p, prog));
      }
    }
  }
  return res;
}

function expandPath() {
  return nova.environment["PATH"].split(":");
}

const Paths = {
  findProgram: findProgram,
  expandPath: expandPath,
};

module.exports = Paths;
