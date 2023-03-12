## Version 0.7.0

Fix to correctly honor the configured path to the dlv debugger.

Fix for potentially catastrophic bug when formatting a file that is missing
a trailing newline. (Contributed by John Fieber, @jfieber).

## Version 0.6.0

Support for go mod init, and go mod tidy.

Only create default debug builds if go.mod is present.

Fix error dialog when manually checking for updates.

## Version 0.5.1

Improved indentation support.

## Version 0.5.0

Initial support for debugging(!) with Delve.
This includes both local and remote debugging over Delve's DAP support.

## Version 0.1.0

Syntax support for go.mod (highlighting only)

Activate if workspace contains go.mod.

Better configuration support for finding go executable.
(Contributed by John Fieber, @jfieber).

## Version 0.0.2

Add tunables for gofumpt and local package formatting, as well as build flags.

## Version 0.0.1

This is our first "pre"-release. It supports a lot of functionality, although there is
quite a lot more to do. Syntax with Tree-sitter should work quite well for most things,
but the gopls LSP integration still could do with a lot more enhancement. (Nonetheless
this is likely more functional than some of the other extensions available for Nova.)
