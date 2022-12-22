// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

const Cache = require("./cache.js");

// we don't need to find an asset because we use go to download and build

class GitHub {
  // latest returns a promise that resolves to a GitHub release object for language server.
  // It should be an object corresponding to a release.
  // Within the release may be an array of associated assets.
  static latest(name, repo, force) {
    // This code has support for using caching, if Nova ever exposes ETags to
    // us, or if the Last-Modified header is present in GitHub (it isn't for
    // these requests for some reason, although the releases/latest header does
    // in fact have it.

    // This check needs to be done infrequently, because it can be expensive.
    // We actually prefer it be done only manually.

    return Cache.fetch(
      `latest_${name}`,
      `https://api.github.com/repos/${repo}/releases/latest`,
      {
        headers: { Accept: "application/vnd.github+json" },
      },
      force
    );
  }
}

module.exports = GitHub;
