; Function calls

(call_expression
  function: (identifier) @identifier.function.core
  (.match? @identifier.function.core "^(append|cap|close|complex|copy|delete|imag|len|make|new|panic|print|println|real|recover)$"))

(call_expression
  function: (identifier) @identifier.function)

(call_expression
  function: (selector_expression
    field: (field_identifier) @identifier.method))

; Function definitions

(function_declaration
  name: (identifier) @identifier.function)

(method_declaration
  name: (field_identifier) @identifier.method)

; we don't have a selector for labels
(label_name) @identifier.constant

; Identifiers

((type_identifier) @keyword.construct (#match? @keyword.construct "^(uint|int)(8|16|32|64)?$"))
((type_identifier) @keyword.construct
  (#match? @keyword.construct "^(uintptr|byte|rune|string|float32|float64|complex64|complex128|any)$"))
((type_identifier) @keyword.construct (#eq? @keyword.construct "string"))
;((type_identifier) @keyword.construct (#eq? @keyword.construct "int"))
(type_identifier) @identifier.type
(field_identifier) @identifier.property
(identifier) @identifier.variable

; we really would like a selector for packages
(package_identifier) @identifier.type.package

; Operators

[
  "--"
  "-"
  "-="
  ":="
  "!"
  "!="
  "..."
  "*"
  "*"
  "*="
  "/"
  "/="
  "&"
  "&&"
  "&="
  "%"
  "%="
  "^"
  "^="
  "+"
  "++"
  "+="
  "<-"
  "<"
  "<<"
  "<<="
  "<="
  "="
  "=="
  ">"
  ">="
  ">>"
  ">>="
  "|"
  "|="
  "||"
  "~"
] @operator

[
"("
")"
"{"
"}"
"["
"]"
] @bracket

; Keywords

[
  "break"
  "case"
  "continue"
  "default"
  "defer"
  "else"
  "fallthrough"
  "for"
  "go"
  "goto"
  "if"
  "import"
  "map"
  "package"
  "range"
  "return"
  "select"
  "switch"
  "type"
  "var"
] @keyword

[
  "const"
  "chan"
  "func"
  "interface"
  "struct"
] @keyword.construct

; Literals

[
  (interpreted_string_literal)
  (raw_string_literal)
  (rune_literal)
] @string

(escape_sequence) @string.escape

[
  (int_literal)
  (float_literal)
  (imaginary_literal)
] @value.number

[
  (iota)
] @keyword.self

[
  (true)
  (false)
] @value.boolean

(nil) @value.null

(comment) @comment
