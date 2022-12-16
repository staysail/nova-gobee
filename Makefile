##
## Makefile for Nova Go-By extension.
## This builds the tree-sitter dynamic library for Go.
##

EXT_DIR		= Go-Bee.novaextension
SYNTAX_DIR	= $(EXT_DIR)/Syntaxes
APPBUNDLE	= /Applications/Nova.app
FRAMEWORKS	= "${APPBUNDLE}/Contents/Frameworks/"
CODESIGN	= codesign
CP			= cp

GO_SRC_DIR	= tree-sitter-go/src
GO_OBJS		= go_parser.o
GO_LIBNAME	= libtree-sitter-go.dylib
GO_DYLIB	= $(SYNTAX_DIR)/$(GO_LIBNAME)

GOMOD_SRC_DIR	= tree-sitter-go-mod/src
GOMOD_OBJS		= gomod_parser.o
GOMOD_LIBNAME	= libtree-sitter-gomod.dylib
GOMOD_DYLIB		= $(SYNTAX_DIR)/$(GOMOD_LIBNAME)

OSXFLAGS = -arch arm64 -arch x86_64 -mmacosx-version-min=11.6

CFLAGS = -O3 -Wall -Wextra -Wno-unused -Wno-unused-parameter -fPIC
CXXFLAGS = -O3 -Wall -Wextra -Wno-unused -Wno-unused-parameter -fPIC
LDFLAGS=-F${FRAMEWORKS} -framework SyntaxKit -rpath @loader_path/../Frameworks

LINKSHARED := $(LINKSHARED)-dynamiclib -Wl,
LINKSHARED := $(LINKSHARED)-install_name,/lib/$(LIBNAME),-rpath,@executable_path/../Frameworks

all: $(GO_DYLIB) $(GOMOD_DYLIB)

go_%.o: $(GO_SRC_DIR)/%.c
	$(CC) $(OSXFLAGS) $(CFLAGS) -I $(GO_SRC_DIR) -c -o $@ $<

gomod_%.o: $(GOMOD_SRC_DIR)/%.c
	$(CC) $(OSXFLAGS) $(CFLAGS) -I $(GOMOD_SRC_DIR) -c -o $@ $<

$(GO_DYLIB): $(GO_OBJS)
	$(CC) $(OSXFLAGS) -I $(GO_SRC_DIR) $(LDFLAGS) $(LINKSHARED) $^ $(LDLIBS) -o $@
	$(CODESIGN) -s - $@

$(GOMOD_DYLIB): $(GOMOD_OBJS)
		$(CC) $(OSXFLAGS) -I $(GOMOD_SRC_DIR) $(LDFLAGS) $(LINKSHARED) $^ $(LDLIBS) -o $@
		$(CODESIGN) -s - $@

clean:
	rm -f $(GO_OBJS) $(GOMOD_OBJS)

clobber: clean
	rm -f $(GO_DYLIB) $(GOMOD_DYLIB)

.PHONY: all install clean
