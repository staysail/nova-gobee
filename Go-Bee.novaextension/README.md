<img src="https://raw.githubusercontent.com/staysail/nova-gobee/main/go-logo.png" align="right" width="100" alt="[Logo]" />

# Go-Bee&trade; - Go Extension for Nova

---

**Go-Bee** (think the "goby" salt-water fish) provides rich support for the Go
programming language in Nova.

Functionality is provided via the _gopls_ language server,
fast syntactic analysis thanks to [Tree-sitter][3],
and debugging support via the _dlv_ (aka Delve) debugger.

This extension requires Nova 10.0 or better, and because of at least one fixed bug, we
highly recommend updating to Nova 10.4 or better.

## ✨ Features ✨

- Syntax Highlighting
- Indentation
- Symbols
- Code Folding
- Format File, including On Save
- Jump to Definition, Implementation, Type Definition
- Find References
- Find Symbol
- Rename Symbol
- Hover Tooltips
- Signature Assistance
- Code Quality Hints
- Code Actions
- Debugging (local, remote, and post-mortem)

## 📸 Screenshots 📸

![](https://raw.githubusercontent.com/staysail/nova-gobee/main/screenshot1.png)
![](https://raw.githubusercontent.com/staysail/nova-gobee/main/screenshot2.png)
![](https://raw.githubusercontent.com/staysail/nova-gobee/main/screenshot3.png)
![](https://raw.githubusercontent.com/staysail/nova-gobee/main/screenshot4.png)
![](https://raw.githubusercontent.com/staysail/nova-gobee/main/screenshot5.png)
![](https://raw.githubusercontent.com/staysail/nova-gobee/main/screenshot6.png)

## 🐞 Debugging 🐞

This extension also supports source code level debugging of both local and
remote programs.

Quick access (default) tasks are created to debug the current package or test
suites in the current package. The former will only work if workspace directory
contains a "main" package.

Much more flexible configuration of debugging targets can be accessed using the
**Tasks** feature in the **Project Settings** dialog.

In this dialog you can create debug tasks which support both local and remote
debugging, as well as post-mortem debugging using core files, adjusting the
arguments and environment used when starting the debug target, as well as other
options related to debugging.

Debugging support is a new feature, and should be considered experimental.
Feedback is appreciated!

## 🛡️ Security Considerations 🛡️

This extension uses the network to check for the latest version of _gopls_ (the language
server) and _dlv_ (the debugger) using the GitHub releases API.
It also will indirectly use the network when it
tries to install these using the `go install` command.
(The binaries will be installed in the extension's private directory.)

The _gopls_ and _dlv_ programs will be installed in a private directory by default, but it is possible
to configure a different location. In any event, we do execute that command for the
language server, and the language server may itself perform additional actions -- see the
source code for _gopls_ or _dlv_ if you want to know more.

It is possible to disable the use of _gopls_ and _dlv_, and instead rely only on the syntax
features from Tree-sitter. That will disable much of the useful functionality, but
enough remains (highlighting, local symbol resolution, folds, and indentation) to still
be worthwhile.

## 🔮 Future Directions 🔮

Tasks to build using go.

Support for larger refactoring - such as package renaming.

Template support. The LSP already provides support for this, but syntax highlighting
will require another grammar, or for Nova to learn about LSP style syntax highlighting.

## 🐜 Bugs 🐜

- Symbol renames can mess up highlighting. Make a subsequent change to refresh the
  tree-sitter grammar's view of things. This appears to be a Nova defect.

- Some things that should be code actions are not.
  Sometimes _gopls_ will give a "hint" about a quick-fix, but as Nova lack's
  support for `codeLens` (as of 10.6 at least), these aren't actually available.

- Symbol queries can wind up returning some rather specious results as a result
  of _gopls_' use of fuzzy matching.
  The best (accurate) matches should be listed first.
  Note that some control over the fuzzy queries is [available][11].

## 🌐 Localizations 🌐

If you'd like to help with localizing this extension, please submit an issue or
contact us directly. We have designed the extension to make this a very easy task
for anyone able to perform the actual translations.

## ❓ Why Another Go Extension? ❓

There are at least three other extensions providing support for Go for Nova.

Our intention in this extension is to provider faster and more accurate syntax
highlighting by using the Tree-Sitter support in Nova 10 and later.

Furthermore, we believe we can leverage the work we have done for other C
family languages in our C-Dragon and D-Velop extensions to quickly bring a richer
set of capabilities to Nova than the other extensions currently offer.

We think this is probably _easier_ than submitting PRs to those other extensions,
especially as our use of Tree-sitter is a fairly big departure from the way
the other ones work.

At this point we believe this extension represents the most complete support for
Go language development in Nova. (We're not finished yet, though!)

## ⚖️ Legal Notices ⚖️

Go-Bee&trade; and the Goby mascot are trademarks of Staysail Systems, Inc.

Copyright &copy; 2022 Staysail Systems, Inc.

This extension is made available under the terms of the [MIT License][8].

Some of the code in this extension was adapted from [Cameron Little][6]'s
excellent [TypeScript extension][7] for Nova.
That extension is also licensed under the MIT license and carries the
following copyright notice:

> Copyright (c) 2020 Cameron Little

This work includes code from [Ben Beshara][1]'s original [C++ ClangD extension][2].
That extension carried the following license declaration in its manifest (which
we have preserved):

> "license": "MIT",

The goby mascot was created as a modification of [Renee French][9]'s [gopher mascot for Go][10]. The original work was licensed under Creative Commons Attribution 4.0. Thanks, Renee!

The Go logo is also used under the Creative Commons Attribution 4.0 license.

[1]: https://benbeshara.id.au/ "Ben Beshara"
[2]: https://github.com/benbeshara/nova-cplusplus
[3]: https://tree-sitter.github.io/tree-sitter/ "Tree-sitter web site"
[5]: https://brew.sh "Homebrew package manager"
[6]: https://github.com/apexskier "Cameron Little's GitHub page"
[7]: https://github.com/apexskier/nova-typescript "TypeScript Extension for Nova"
[8]: https://github.com/staysail/nova-goby/blob/main/LICENSE.md "MIT License"
[9]: http://reneefrench.blogspot.com "Renee French's blog"
[10]: https://go.dev/blog/gopher "The Golang Gopher"
[11]: https://go.googlesource.com/tools/+/refs/heads/master/gopls/doc/features.md "Fuzzy search features"
