//
// Copyright 2022 Staysail Systems, Inc.
//
// Distributed under the terms of the MIT license.

class Position {
  static toLsp(document, where, novaFix = false) {
    const lines = document
      .getTextInRange(new Range(0, document.length))
      .split(document.eol);
    let pos = 0;
    for (let line = 0; line < lines.length; line++) {
      if (pos + lines[line].length >= where) {
        let col = where - pos;

        // @PANIC:
        // Nova Fix is an incomplete workaround for a Nova bug.
        // Specifically, Nova cannot serialize 0 or 1 (because it
        // converts them to true or false.  What we do, in an attempt
        // to minimize the impact of this bug, is look to see if the
        // selected position is symbol, and if it is, we advance to
        // column 2, provided that the symbol extends at least that far.
        // When Nova is fixed, we can remove this hack.
        if (novaFix && col < 2) {
          let re = /^[0-9a-zA-Z_]/;
          let x = lines[line];
          while (col < 2 && x.length > 1 && re.test(x.slice(1))) {
            x = x.slice(1);
            col++;
          }
        }
        return { character: Number(col), line: Number(line) };
      }
      pos += lines[line].length + document.eol.length;
    }
    return null;
  }
}

module.exports = Position;
