[
  "require"
  "replace"
  "go"
  "exclude"
  "retract"
  "module"
] @keyword

"=>" @operator
[
"("
")"
"["
"]"
] @bracket

(comment) @comment
(interpreted_string_literal) @string
(escape_sequence) @string.escape

(raw_string_literal) @string
(module_path) @identifier.variable
(file_path) @identifier.variable
(go_version) @value.number
; there is a bug in the grammar where the identifier
; is chosen even when it's a string.  arguably we would
; like the identifier token to be exposed to us as well.
((version) @value.number (#match? @value.number "^v"))
((version) @string (#match? @string "^\""))
