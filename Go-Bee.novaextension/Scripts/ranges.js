//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

class Ranges {
  static fromLsp(document, range) {
    let pos = 0;
    let start = 0;
    let end = document.length;
    const lines = document
      .getTextInRange(new Range(0, document.length))
      .split(document.eol);
    // If the document doesn't end with an newline, an LSP range
    // to append something to the end might have a range like:
    //   {"range":{"start":{"line":100,"character":0},"end":{"line":100,"character":0}}
    // while the lines array from nova has only lines 0-99.
    if (range.start.line == lines.length) {
      return new Range(document.length, document.length);
    }
    for (let line = 0; line < lines.length; line++) {
      if (range.start.line == line) {
        start = pos + range.start.character;
      }
      if (range.end.line == line) {
        end = pos + range.end.character;
        break; // we finished, so no need to keep scanning the doc
      }
      pos += lines[line].length + document.eol.length;
    }
    return new Range(start, end);
  }

  static toLsp(document, range) {
    const lines = document
      .getTextInRange(new Range(0, document.length))
      .split(document.eol);
    let pos = 0;
    let start = undefined;
    let end = undefined;
    for (let line = 0; line < lines.length; line++) {
      if (!start && pos + lines[line].length >= range.start) {
        start = { line: line, character: range.start - pos };
      }
      if (!end && pos + lines[line].length >= range.end) {
        end = { line: line, character: range.end - pos };
        return { start: start, end: end };
      }
      pos += lines[line].length + document.eol.length;
    }
    return null;
  }
}

module.exports = Ranges;
