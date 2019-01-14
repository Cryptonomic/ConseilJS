main -> instruction | data | comparableType | type
comparableType -> 
    "int" 
  | "nat" 
  | "string" 
  | "bytes" 
  | "mutez" 
  | "bool" 
  | "key_hash" 
  | "timestamp"
type -> 
    comparableType 
  | "key" 
  | "unit" 
  | "signature" 
  | "option" _ type 
  | "(" _  "option" _ type _ ")"
  | "list" _ type 
  | "(" _  "list" _ type _ ")"
  | "set" _ comparableType
  | "(" _  "set" _ comparableType _ ")"
  | "operation"
  | "address" 
  | "contract" _ type
  | "(" _  "contract" _ type _ ")"
  | "pair" _ type _ type
  | "(" _ "pair" _ type _ type _ ")"
  | "or" _ type _ type
  | "(" _ "or" _ type _ type _ ")"
  | "lambda" _ type _ type
  | "(" _ "lambda" _ type _ type _ ")"
  | "map" _ comparableType _ type
  | "(" _ "map" _ comparableType _ type _ ")"
  | "big_map" _ comparableType _ type
  | "(" _ "big_map" _ comparableType _ type _ ")"
subInstruction -> "{" _ (instruction _ ";" _):+ "}"
instruction ->
  subInstruction
  | "DROP"
  | "DUP"
  | "SWAP"
  | "PUSH" _ type _ data
  | "SOME"
  | "NONE" _ type
  | "UNIT"
  | "IF_NONE" _ subInstruction _ subInstruction
  | "PAIR"
  | "CAR"
  | "CDR"
  | "LEFT" _ type
  | "RIGHT" _ type
  | "IF_LEFT" _ subInstruction _ subInstruction
  | "IF_RIGHT" _ subInstruction _ subInstruction
  | "NIL" _ type
  | "CONS"
  | "IF_CONS" _ subInstruction _ subInstruction
  | "SIZE"
  | "EMPTY_SET" _ comparableType
  | "EMPTY_MAP" _ comparableType _ type
  | "MAP" _ subInstruction
  | "ITER" _ subInstruction
  | "MEM"
  | "GET"
  | "UPDATE"
  | "IF" _ subInstruction _ subInstruction
  | "LOOP" _ subInstruction
  | "LOOP_LEFT" _ subInstruction
  | "LAMBDA" _ type _ type _ subInstruction
  | "EXEC"
  | "DIP" _ subInstruction
  | "FAILWITH" _ data
  | "CAST"
  | "RENAME"
  | "CONCAT"
  | "SLICE"
  | "PACK"
  | "UNPACK"
  | "ADD"
  | "SUB"
  | "MUL"
  | "EDIV"
  | "ABS"
  | "NEG"
  | "LSL"
  | "LSR"
  | "OR"
  | "AND"
  | "XOR"
  | "NOT"
  | "COMPARE"
  | "EQ"
  | "NEQ"
  | "LT"
  | "GT"
  | "LE"
  | "GE"
  | "SELF"
  | "CONTRACT" _ type
  | "TRANSFER_TOKENS"
  | "SET_DELEGATE"
  | "CREATE_ACCOUNT"
  | "CREATE_CONTRACT"
  | "CREATE_CONTRACT" _ subInstruction
  | "IMPLICIT_ACCOUNT"
  | "NOW"
  | "AMOUNT"
  | "BALANCE"
  | "CHECK_SIGNATURE"
  | "BLAKE2B"
  | "SHA256"
  | "SHA512"
  | "HASH_KEY"
  | "STEPS_TO_QUOTA"
  | "SOURCE"
  | "SENDER"
  | "ADDRESS"
data ->
  int
  | nat
  | string
  | "Unit"
  | "True"
  | "False"
  | "Pair" _ data _ data
  | "Left" _ data
  | "Right" _ data
  | "Some" _ data
  | "None"
  | subData
  | subElt
  | "instruction"
subData -> "{" _ (data ";" _):+ "}" | "(" _ (data ";" _):+ ")"
subElt -> "{" _ (elt ";" _):+ "}" | "(" _ (elt ";" _):+ ")"
elt -> "Elt" _ data _ data
nat -> [0-9]:+
int -> (null | "-") nat
char -> [a-z]:+
string -> [0-9|a-z]:+
_ -> [\s]:*