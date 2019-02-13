main -> instruction {% id %} | data {% id %} | comparableType {% id %} | type {% id %} | parameter {% id %} | storage {% id %} | code {% id %}
parameter -> "parameter" _ type ";" {% string_rule %}
storage -> "storage" _ type ";" {% string_rule %}
code -> "code " subInstruction | "code {};" {% d => "code {}" %}
comparableType -> 
    "int" {% constant_rule %} 
  | "nat" {% constant_rule %}
  | "string" {% constant_rule %}
  | "bytes" {% constant_rule %}
  | "mutez" {% constant_rule %}
  | "bool" {% constant_rule %}
  | "key_hash" {% constant_rule %}
  | "timestamp" {% constant_rule %}
  | "tez" {% constant_rule %}
type -> 
    comparableType {% id %} 
  | "key" {% constant_rule %}
  | "unit" {% constant_rule %}
  | "signature" {% constant_rule %}
  | "option" _ type {% string_rule %}
  | "(" _  "option" _ type _ ")" {% p_string_rule_endp %}
  | "list" _ type {% string_rule %}
  | "(" _  "list" _ type _ ")" {% p_string_rule_endp %}
  | "set" _ comparableType {% string_rule %}
  | "(" _  "set" _ comparableType _ ")" {% p_string_rule_endp %}
  | "operation" {% constant_rule %}
  | "address" {% constant_rule %} 
  | "contract" _ type {% string_rule %}
  | "(" _  "contract" _ type _ ")" {% p_string_rule_endp %}
  | "pair" _ type _ type {% string_rule_rule %}
  | "(" _ "pair" _ type _ type _ ")" {% p_string_rule_rule_endp %}
  | "or" _ type _ type {% string_rule_rule %}
  | "(" _ "or" _ type _ type _ ")" {% p_string_rule_rule_endp %}
  | "lambda" _ type _ type {% string_rule_rule %}
  | "(" _ "lambda" _ type _ type _ ")" {% p_string_rule_rule_endp %}
  | "map" _ comparableType _ type {% string_rule_rule %}
  | "(" _ "map" _ comparableType _ type _ ")" {% p_string_rule_rule_endp %}
  | "big_map" _ comparableType _ type {% string_rule_rule %}
  | "(" _ "big_map" _ comparableType _ type _ ")" {% string_rule_rule %}
subInstruction -> "{" _ (instruction _ semicolons _):+ "}" {% code_rule %} 
  | "{}" {% id %}
instruction ->
  subInstruction {% id %}
  | "DROP" {% constant_rule %}
  | "DUP" {% constant_rule %}
  | "SWAP" {% constant_rule %}
  | "PUSH" _ type _ data {% string_rule_rule %}
  | "SOME" {% constant_rule %}
  | "NONE" _ type {% string_rule %}
  | "UNIT" {% constant_rule %}
  | "IF_NONE" _ subInstruction _ subInstruction {% string_rule_rule %}
  | "PAIR" {% constant_rule %}
  | "CAR" {% constant_rule %}
  | "CDR" {% constant_rule %}
  | "LEFT" _ type {% string_rule %}
  | "RIGHT" _ type {% string_rule %}
  | "IF_LEFT" _ subInstruction _ subInstruction {% string_rule_rule %}
  | "IF_RIGHT" _ subInstruction _ subInstruction {% string_rule_rule %}
  | "NIL" _ type {% string_rule %}
  | "CONS" {% constant_rule %}
  | "IF_CONS" _ subInstruction _ subInstruction {% string_rule_rule %}
  | "SIZE" {% constant_rule %}
  | "EMPTY_SET" _ comparableType {% string_rule %}
  | "EMPTY_MAP" _ comparableType _ type {% string_rule_rule %}
  | "MAP" _ subInstruction {% string_rule %}
  | "ITER" _ subInstruction {% string_rule %}
  | "MEM" {% constant_rule %}
  | "GET" {% constant_rule %}
  | "UPDATE" {% constant_rule %}
  | "IF" _ subInstruction _ subInstruction {% string_rule_rule %}
  | "LOOP" _ subInstruction {% string_rule %}
  | "LOOP_LEFT" _ subInstruction {% string_rule %}
  | "LAMBDA" _ type _ type _ subInstruction {% string_rule_rule_rule %}
  | "EXEC" {% constant_rule %}
  | "DIP" _ subInstruction {% string_rule %}
  | "FAILWITH" _ data {% string_rule %}
  | "CAST" {% constant_rule %}
  | "RENAME" {% constant_rule %}
  | "CONCAT" {% constant_rule %}
  | "SLICE" {% constant_rule %}
  | "PACK" {% constant_rule %}
  | "UNPACK" {% constant_rule %}
  | "ADD" {% constant_rule %}
  | "SUB" {% constant_rule %}
  | "MUL" {% constant_rule %}
  | "EDIV" {% constant_rule %}
  | "ABS" {% constant_rule %}
  | "NEG" {% constant_rule %}
  | "LSL" {% constant_rule %}
  | "LSR" {% constant_rule %}
  | "OR" {% constant_rule %}
  | "AND" {% constant_rule %}
  | "XOR" {% constant_rule %}
  | "NOT" {% constant_rule %}
  | "COMPARE" {% constant_rule %}
  | "EQ" {% constant_rule %}
  | "NEQ" {% constant_rule %}
  | "LT" {% constant_rule %}
  | "GT" {% constant_rule %}
  | "LE" {% constant_rule %}
  | "GE" {% constant_rule %}
  | "SELF" {% constant_rule %}
  | "CONTRACT" _ type {% string_rule %}
  | "TRANSFER_TOKENS" {% constant_rule %}
  | "SET_DELEGATE" {% constant_rule %}
  | "CREATE_ACCOUNT" {% constant_rule %}
  | "CREATE_CONTRACT" {% constant_rule %}
  | "CREATE_CONTRACT" _ subInstruction
  | "IMPLICIT_ACCOUNT" {% constant_rule %}
  | "NOW" {% constant_rule %}
  | "AMOUNT" {% constant_rule %}
  | "BALANCE" {% constant_rule %}
  | "CHECK_SIGNATURE" {% constant_rule %}
  | "BLAKE2B" {% constant_rule %}
  | "SHA256" {% constant_rule %}
  | "SHA512" {% constant_rule %}
  | "HASH_KEY" {% constant_rule %}
  | "STEPS_TO_QUOTA" {% constant_rule %}
  | "SOURCE" {% constant_rule %}
  | "SENDER" {% constant_rule %}
  | "ADDRESS" {% constant_rule %}
  | "DEFAULT_ACCOUNT" {% constant_rule %}
  | "FAILWITH" {% constant_rule %}
data ->
  int {% id %}
  | nat {% id %}
  | string {% id %}
  | dqstring {% id %}
  | "Unit" {% constant_rule %}
  | "True" {% constant_rule %}
  | "False" {% constant_rule %}
  | "Pair" _ data _ data {% string_rule_rule %}
  | "Left" _ data {% string_rule %}
  | "Right" _ data {% string_rule %}
  | "Some" _ data {% string_rule %}
  | "None" {% constant_rule %}
  | subData {% id %}
  | subElt {% id %}
  | "instruction" {% constant_rule %}
subData -> 
    "{" _ (data ";" _):+ "}" {% code_rule %}
  | "(" _ (data ";" _):+ ")" {% code_rule %}
subElt -> 
    "{" _ (elt ";" _):+ "}" {% code_rule %}
  | "(" _ (elt ";" _):+ ")" {% code_rule %}
elt -> "Elt" _ data _ data {% string_rule_rule  %}
nat -> [0-9]:+ {% constant_rule %}
int -> "-" nat  {% constant_rule %}
char -> [a-z]:+ {% constant_rule %}
string -> [0-9|a-z]:+ {% d => d[0].join('') %}
dqstring ->
  "\"" dstrchar:* "\"" {% d => d[1].join('') %}
dstrchar ->
    [^"] {% id %}
  | "\\\"" {% d => '"' %}
_ -> [\s]:*
semicolons -> null | semicolons ";"

@{%

  const constant_rule = d => 
    {
        const s = d[0]
        return "{ prim: " + s + " }"
    }

  const int_rule = d =>
    {
        const s = d[0] + d[1]
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