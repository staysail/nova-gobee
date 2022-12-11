//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

const Messages = require("./messages.js");

const novaVersion = "nova " + nova.versionString;
const macosVersion = "macos " + nova.systemVersion.join(".");
const extPath = nova.extension.globalStoragePath;
const cacheDir = nova.path.join(extPath, "cache");
const extName = nova.extension.name;
const extVersion = nova.extension.versionString;
const userAgent = `${extName}/${extVersion} (${novaVersion} ${macosVersion})`;

function makeCacheDir() {
  try {
    nova.fs.mkdir(extPath);
    nova.fs.mkdir(cacheDir);
  } catch (e) {
    Messages.showError(e.message);
  }
}

// we store a JSON object in the cache, that is an object of the form
// { [ modified: "<date string>"] | [ etag: "<etag>"] , cache: <json releases object> }

// readCache returns the parent cache object, or null if nothing is
// present in the cache
function readCache(name) {
  try {
    let f = nova.fs.open(nova.path.join(cacheDir, name), "rt", "utf8");
    if (!f) {
      return null;
    }
    let cache = f.read();
    if (!cache) {
      return null;
    }
    f.close();
    return JSON.parse(cache);
  } catch (e) {
    return null;
  }
}

// writes a cache object (modified, object)
function writeCache(name, cache) {
  makeCacheDir();
  path = nova.path.join(cacheDir, name);
  try {
    let f = nova.fs.open(path, "wt");
    f.write(JSON.stringify(cache));
    f.close();
  } catch (e) {
    Messages.showError(e.message);
  }
}

// Fetch (using the cache) an object. This assumes the cached object will be JSON.
// The options object will be modified if needed to add headers for caching and
// user agent.
class Cache {
  static async fetch(name, url, options = null, force = false) {
    let cached = readCache(name);
    if (options == null) options = {};
    if (options.headers == null) options.headers = {};
    if (!options.headers["User-Agent"])
      options.headers["User-Agent"] = userAgent;
    if (cached && cached.cache) {
      if (cached.etag) options.headers["If-None-Match"] = cached.etag;
      if (cached.modified)
        options.headers["If-Modified-Since"] = cached.modified;
    }

    let now = Date.now();

    // if it's been less than an hour since we cached the value, then don't
    // ask again.  This could be smarter if we could get at the etag.
    if (
      !force &&
      cached &&
      cached.cache &&
      cached.expires &&
      now < cached.expires
    ) {
      return Promise.resolve(cached.cache);
    }
    // TODO: refactor this be fully asynchronous using Promises
    // (we need to pass a this object to get the response headers or nest
    // functions)

    let response = await fetch(url, options);
    let modified = response.headers.get("Last-Modified");
    let etag = response.headers.get("ETag");

    if (!etag && !modified) {
      modified = new Date().toUTCString();
    }

    if (response.status == 304 && cached) {
      return Promise.resolve(cached.cache);
    }
    if (response.status != 200) {
      return null;
    }
    let latest = await response.json();
    writeCache(name, {
      modified: modified,
      etag: etag,
      cache: latest,
      expires: now + 3600 * 1000,
    });
    return Promise.resolve(latest);
  }

  // fetchCache is a read against the cache, when you know you don't want to
  // hit the cache again.
  static fetchCache(name) {
    let cached = readCache(name);
    return cached ? cached.cache : null;
  }
}

module.exports = Cache;
