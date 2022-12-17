((function_declaration
	name: (identifier) @name) @subtree (#set! role function))

; TODO - we could probably improve the display name by qualifying this with
; with the receiver type name.  (Furthermore, do we want to also pick up the
; receiver name.)
((method_declaration
	name: (field_identifier) @name) @subtree
	@displayname.target (#set! displayname.query "go-method-display-name.scm")
	(#set! role method)
)
(type_declaration (type_spec (type_identifier) @name (struct_type (#set! role struct)) @subtree))
(type_declaration (type_spec (type_identifier) @name (interface_type (#set! role interface)) @subtree))
(type_declaration (type_spec name: (type_identifier) @name (
	[
		(type_identifier)
		(pointer_type)
		(array_type)
		(qualified_type)
		(slice_type)
		(map_type)
		(channel_type)
		(function_type)
	] (#set! role type)) @subtree))

((interface_type (method_spec (field_identifier) @name) @subtree (#set! role method)))

((field_declaration (field_identifier) @name) @subtree (#set! role property))
; technically this should be an argument
((parameter_declaration name: (identifier) @name) @subtree (#set! role variable))
((short_var_declaration left: (expression_list ((identifier) @name) @subtree (#set! role variable))))
((var_declaration (var_spec ((identifier) @name) @subtree (#set! role variable))))
((const_spec name: (identifier) @name) @subtree (#set! role constant))
((package_clause (package_identifier) @name) @subtree (#set! role package))
((type_alias name: (type_identifier) @name) @subtree (#set! role type))
