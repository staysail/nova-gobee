(function_declaration body: (block (#set! role function)) @subtree)
(method_declaration body: (block (#set! role function)) @subtree)
(func_literal body: (block (#set! role function)) @subtree)
(import_declaration (import_spec_list (#set! role block)) @subtree)

(for_statement body: (block (#set! role block)) @subtree)
(if_statement (block (#set! role block)) @subtree)
(select_statement "{" @start "}" @end.after (#set! role block))
(expression_switch_statement "{" @start "}" @end.after (#set! role block))
(type_switch_statement "{" @start "}" @end.after (#set! role block))
; TODO: also type switch cases and select cases
(expression_switch_statement (expression_case (expression_list) @start) @end.after (#set! role block))
(expression_switch_statement (default_case "default" @start) @end.after (#set! role block))
(const_declaration "(" @start ")" @end.after (#set! role block))
(composite_literal body: (literal_value (#set! role block)) @subtree)
(type_declaration (type_spec (struct_type (#set! role type)) @subtree))
(type_declaration (type_spec (interface_type (#set! role type)) @subtree))
