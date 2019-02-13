main -> instruction {% id %} | data | comparableType {% id %} | type {% id %}
comparableType -> 
    "int" {% constant_rule %}
  | "nat" {% constant_rule %}
  | "string" {% constant_rule %}
  | "bytes" {% constant_rule %}
  | "mutez" {% constant_rule %}
  | "bool" {% constant_rule %}
  | "key_hash" {% constant_rule %}
  | "timestamp" {% constant_rule %}

type ->
    comparableType {% id %}
  | "option" _ type {% string_rule %}
  | "(" _  "option" _ type _ ")" {% p_string_rule_endp %}
  | "or" _ type _ type {% string_rule_rule %}
  | "(" _ "or" _ type _ type _ ")"
subInstruction -> "{" _ (instruction _ ";" _):+ "}" {% code_rule %}
instruction ->
  subInstruction {% id %}
  | "DROP" {% constant_rule %}
  | "DUP" {% constant_rule %}
  | "SWAP" 
  | "PUSH" _ type _ data {% string_rule_rule %}
  | "SOME" {% string_rule_rule %}
  | "NONE" _ type
  | "UNIT" 
  | "IF_NONE" _ subInstruction _ subInstruction
  | "pair" _ type _ type {% string_rule_rule %}
  | "(" _ "pair" _ type _ type _ ")" {% p_string_rule_rule_endp  %}
data ->
  int
nat -> [0-9]:+ {% id %}
int -> (null | "-") nat
_ -> [\s]:*

@{%

  const constant_rule = d => 
    {
        const s = d[0]
        return "{ prim: " + s + " }"
    }

  const p_constant_rule_endp = d =>  
    {
        const s = d[2]
        return "{ prim: " + s + " }"
    }

  // Example
  // Input: "option string"
  // Grammar: option _ type
  // Output: Michelson version of "option string"         
  const string_rule = d => 
    { 
      const s = d[0]
      const rule = d[2]
      return "{ prim: " + s + ", args: [" + rule + "] }"
    }

  // Example
  // Input: "(option string)"
  // Grammar: ( _ option _ type _ )
  // Output: Michelson version of "(option string)" 
  const p_string_rule_endp = d =>
    {
      const s = d[2]
      const rule = d[4]
      return "{ prim: " + s + ", args: [" + rule + "] }"
    }

  const string_rule_rule = d => 
    {
      const s = d[0]
      const rule_one = d[2]
      const rule_two = d[4]
      return "{ prim: " + s + ", args: [" + rule_one + ", " + rule_two + "] }"
    }  

  const p_string_rule_rule_endp = d =>  
    {
      const s = d[2]
      const rule_one = d[4]
      const rule_two = d[6]
      return "{ prim: " + s + ", args: [" + rule_one + ", " + rule_two + "] }"
    }

  const string_rule_rule_rule = d => 
    {
      const s = d[0]
      const rule_one = d[2]
      const rule_two = d[4]
      const rule_three = d[6]
      return "{ prim: " + s + ", args: [" + rule_one + ", " + rule_two + ", " + rule_three + "] }"
    }  

  const p_string_rule_rule_rule_endp = d =>  
    {
      const s = d[2]
      const rule_one = d[4]
      const rule_two = d[6]
      return "{ prim: " + s + ", args: [" + rule_one + ", " + rule_two + ", " + rule_three + "] }"
    }  

  const code_rule = d =>
    {
        const instructions = d[2]
        const instructionsList = instructions.map(x => x[0])
        return instructionsList
    }

%}