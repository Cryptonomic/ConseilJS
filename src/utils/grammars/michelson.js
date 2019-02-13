// Generated automatically by nearley, version 2.16.0
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }


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

var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "main", "symbols": ["instruction"], "postprocess": id},
    {"name": "main", "symbols": ["data"], "postprocess": id},
    {"name": "main", "symbols": ["comparableType"], "postprocess": id},
    {"name": "main", "symbols": ["type"], "postprocess": id},
    {"name": "main", "symbols": ["parameter"], "postprocess": id},
    {"name": "main", "symbols": ["storage"], "postprocess": id},
    {"name": "main", "symbols": ["code"], "postprocess": id},
    {"name": "parameter$string$1", "symbols": [{"literal":"p"}, {"literal":"a"}, {"literal":"r"}, {"literal":"a"}, {"literal":"m"}, {"literal":"e"}, {"literal":"t"}, {"literal":"e"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "parameter", "symbols": ["parameter$string$1", "_", "type", {"literal":";"}], "postprocess": string_rule},
    {"name": "storage$string$1", "symbols": [{"literal":"s"}, {"literal":"t"}, {"literal":"o"}, {"literal":"r"}, {"literal":"a"}, {"literal":"g"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "storage", "symbols": ["storage$string$1", "_", "type", {"literal":";"}], "postprocess": string_rule},
    {"name": "code$string$1", "symbols": [{"literal":"c"}, {"literal":"o"}, {"literal":"d"}, {"literal":"e"}, {"literal":" "}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "code", "symbols": ["code$string$1", "subInstruction"]},
    {"name": "code$string$2", "symbols": [{"literal":"c"}, {"literal":"o"}, {"literal":"d"}, {"literal":"e"}, {"literal":" "}, {"literal":"{"}, {"literal":"}"}, {"literal":";"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "code", "symbols": ["code$string$2"], "postprocess": d => "code {}"},
    {"name": "comparableType$string$1", "symbols": [{"literal":"i"}, {"literal":"n"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "comparableType", "symbols": ["comparableType$string$1"], "postprocess": constant_rule},
    {"name": "comparableType$string$2", "symbols": [{"literal":"n"}, {"literal":"a"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "comparableType", "symbols": ["comparableType$string$2"], "postprocess": constant_rule},
    {"name": "comparableType$string$3", "symbols": [{"literal":"s"}, {"literal":"t"}, {"literal":"r"}, {"literal":"i"}, {"literal":"n"}, {"literal":"g"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "comparableType", "symbols": ["comparableType$string$3"], "postprocess": constant_rule},
    {"name": "comparableType$string$4", "symbols": [{"literal":"b"}, {"literal":"y"}, {"literal":"t"}, {"literal":"e"}, {"literal":"s"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "comparableType", "symbols": ["comparableType$string$4"], "postprocess": constant_rule},
    {"name": "comparableType$string$5", "symbols": [{"literal":"m"}, {"literal":"u"}, {"literal":"t"}, {"literal":"e"}, {"literal":"z"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "comparableType", "symbols": ["comparableType$string$5"], "postprocess": constant_rule},
    {"name": "comparableType$string$6", "symbols": [{"literal":"b"}, {"literal":"o"}, {"literal":"o"}, {"literal":"l"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "comparableType", "symbols": ["comparableType$string$6"], "postprocess": constant_rule},
    {"name": "comparableType$string$7", "symbols": [{"literal":"k"}, {"literal":"e"}, {"literal":"y"}, {"literal":"_"}, {"literal":"h"}, {"literal":"a"}, {"literal":"s"}, {"literal":"h"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "comparableType", "symbols": ["comparableType$string$7"], "postprocess": constant_rule},
    {"name": "comparableType$string$8", "symbols": [{"literal":"t"}, {"literal":"i"}, {"literal":"m"}, {"literal":"e"}, {"literal":"s"}, {"literal":"t"}, {"literal":"a"}, {"literal":"m"}, {"literal":"p"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "comparableType", "symbols": ["comparableType$string$8"], "postprocess": constant_rule},
    {"name": "comparableType$string$9", "symbols": [{"literal":"t"}, {"literal":"e"}, {"literal":"z"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "comparableType", "symbols": ["comparableType$string$9"], "postprocess": constant_rule},
    {"name": "type", "symbols": ["comparableType"], "postprocess": id},
    {"name": "type$string$1", "symbols": [{"literal":"k"}, {"literal":"e"}, {"literal":"y"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "type", "symbols": ["type$string$1"], "postprocess": constant_rule},
    {"name": "type$string$2", "symbols": [{"literal":"u"}, {"literal":"n"}, {"literal":"i"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "type", "symbols": ["type$string$2"], "postprocess": constant_rule},
    {"name": "type$string$3", "symbols": [{"literal":"s"}, {"literal":"i"}, {"literal":"g"}, {"literal":"n"}, {"literal":"a"}, {"literal":"t"}, {"literal":"u"}, {"literal":"r"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "type", "symbols": ["type$string$3"], "postprocess": constant_rule},
    {"name": "type$string$4", "symbols": [{"literal":"o"}, {"literal":"p"}, {"literal":"t"}, {"literal":"i"}, {"literal":"o"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "type", "symbols": ["type$string$4", "_", "type"], "postprocess": string_rule},
    {"name": "type$string$5", "symbols": [{"literal":"o"}, {"literal":"p"}, {"literal":"t"}, {"literal":"i"}, {"literal":"o"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "type", "symbols": [{"literal":"("}, "_", "type$string$5", "_", "type", "_", {"literal":")"}], "postprocess": p_string_rule_endp},
    {"name": "type$string$6", "symbols": [{"literal":"l"}, {"literal":"i"}, {"literal":"s"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "type", "symbols": ["type$string$6", "_", "type"], "postprocess": string_rule},
    {"name": "type$string$7", "symbols": [{"literal":"l"}, {"literal":"i"}, {"literal":"s"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "type", "symbols": [{"literal":"("}, "_", "type$string$7", "_", "type", "_", {"literal":")"}], "postprocess": p_string_rule_endp},
    {"name": "type$string$8", "symbols": [{"literal":"s"}, {"literal":"e"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "type", "symbols": ["type$string$8", "_", "comparableType"], "postprocess": string_rule},
    {"name": "type$string$9", "symbols": [{"literal":"s"}, {"literal":"e"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "type", "symbols": [{"literal":"("}, "_", "type$string$9", "_", "comparableType", "_", {"literal":")"}], "postprocess": p_string_rule_endp},
    {"name": "type$string$10", "symbols": [{"literal":"o"}, {"literal":"p"}, {"literal":"e"}, {"literal":"r"}, {"literal":"a"}, {"literal":"t"}, {"literal":"i"}, {"literal":"o"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "type", "symbols": ["type$string$10"], "postprocess": constant_rule},
    {"name": "type$string$11", "symbols": [{"literal":"a"}, {"literal":"d"}, {"literal":"d"}, {"literal":"r"}, {"literal":"e"}, {"literal":"s"}, {"literal":"s"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "type", "symbols": ["type$string$11"], "postprocess": constant_rule},
    {"name": "type$string$12", "symbols": [{"literal":"c"}, {"literal":"o"}, {"literal":"n"}, {"literal":"t"}, {"literal":"r"}, {"literal":"a"}, {"literal":"c"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "type", "symbols": ["type$string$12", "_", "type"], "postprocess": string_rule},
    {"name": "type$string$13", "symbols": [{"literal":"c"}, {"literal":"o"}, {"literal":"n"}, {"literal":"t"}, {"literal":"r"}, {"literal":"a"}, {"literal":"c"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "type", "symbols": [{"literal":"("}, "_", "type$string$13", "_", "type", "_", {"literal":")"}], "postprocess": p_string_rule_endp},
    {"name": "type$string$14", "symbols": [{"literal":"p"}, {"literal":"a"}, {"literal":"i"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "type", "symbols": ["type$string$14", "_", "type", "_", "type"], "postprocess": string_rule_rule},
    {"name": "type$string$15", "symbols": [{"literal":"p"}, {"literal":"a"}, {"literal":"i"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "type", "symbols": [{"literal":"("}, "_", "type$string$15", "_", "type", "_", "type", "_", {"literal":")"}], "postprocess": p_string_rule_rule_endp},
    {"name": "type$string$16", "symbols": [{"literal":"o"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "type", "symbols": ["type$string$16", "_", "type", "_", "type"], "postprocess": string_rule_rule},
    {"name": "type$string$17", "symbols": [{"literal":"o"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "type", "symbols": [{"literal":"("}, "_", "type$string$17", "_", "type", "_", "type", "_", {"literal":")"}], "postprocess": p_string_rule_rule_endp},
    {"name": "type$string$18", "symbols": [{"literal":"l"}, {"literal":"a"}, {"literal":"m"}, {"literal":"b"}, {"literal":"d"}, {"literal":"a"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "type", "symbols": ["type$string$18", "_", "type", "_", "type"], "postprocess": string_rule_rule},
    {"name": "type$string$19", "symbols": [{"literal":"l"}, {"literal":"a"}, {"literal":"m"}, {"literal":"b"}, {"literal":"d"}, {"literal":"a"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "type", "symbols": [{"literal":"("}, "_", "type$string$19", "_", "type", "_", "type", "_", {"literal":")"}], "postprocess": p_string_rule_rule_endp},
    {"name": "type$string$20", "symbols": [{"literal":"m"}, {"literal":"a"}, {"literal":"p"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "type", "symbols": ["type$string$20", "_", "comparableType", "_", "type"], "postprocess": string_rule_rule},
    {"name": "type$string$21", "symbols": [{"literal":"m"}, {"literal":"a"}, {"literal":"p"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "type", "symbols": [{"literal":"("}, "_", "type$string$21", "_", "comparableType", "_", "type", "_", {"literal":")"}], "postprocess": p_string_rule_rule_endp},
    {"name": "type$string$22", "symbols": [{"literal":"b"}, {"literal":"i"}, {"literal":"g"}, {"literal":"_"}, {"literal":"m"}, {"literal":"a"}, {"literal":"p"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "type", "symbols": ["type$string$22", "_", "comparableType", "_", "type"], "postprocess": string_rule_rule},
    {"name": "type$string$23", "symbols": [{"literal":"b"}, {"literal":"i"}, {"literal":"g"}, {"literal":"_"}, {"literal":"m"}, {"literal":"a"}, {"literal":"p"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "type", "symbols": [{"literal":"("}, "_", "type$string$23", "_", "comparableType", "_", "type", "_", {"literal":")"}], "postprocess": string_rule_rule},
    {"name": "subInstruction$ebnf$1$subexpression$1", "symbols": ["instruction", "_", "semicolons", "_"]},
    {"name": "subInstruction$ebnf$1", "symbols": ["subInstruction$ebnf$1$subexpression$1"]},
    {"name": "subInstruction$ebnf$1$subexpression$2", "symbols": ["instruction", "_", "semicolons", "_"]},
    {"name": "subInstruction$ebnf$1", "symbols": ["subInstruction$ebnf$1", "subInstruction$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "subInstruction", "symbols": [{"literal":"{"}, "_", "subInstruction$ebnf$1", {"literal":"}"}], "postprocess": code_rule},
    {"name": "subInstruction$string$1", "symbols": [{"literal":"{"}, {"literal":"}"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "subInstruction", "symbols": ["subInstruction$string$1"], "postprocess": id},
    {"name": "instruction", "symbols": ["subInstruction"], "postprocess": id},
    {"name": "instruction$string$1", "symbols": [{"literal":"D"}, {"literal":"R"}, {"literal":"O"}, {"literal":"P"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$1"], "postprocess": constant_rule},
    {"name": "instruction$string$2", "symbols": [{"literal":"D"}, {"literal":"U"}, {"literal":"P"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$2"], "postprocess": constant_rule},
    {"name": "instruction$string$3", "symbols": [{"literal":"S"}, {"literal":"W"}, {"literal":"A"}, {"literal":"P"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$3"], "postprocess": constant_rule},
    {"name": "instruction$string$4", "symbols": [{"literal":"P"}, {"literal":"U"}, {"literal":"S"}, {"literal":"H"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$4", "_", "type", "_", "data"], "postprocess": string_rule_rule},
    {"name": "instruction$string$5", "symbols": [{"literal":"S"}, {"literal":"O"}, {"literal":"M"}, {"literal":"E"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$5"], "postprocess": constant_rule},
    {"name": "instruction$string$6", "symbols": [{"literal":"N"}, {"literal":"O"}, {"literal":"N"}, {"literal":"E"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$6", "_", "type"], "postprocess": string_rule},
    {"name": "instruction$string$7", "symbols": [{"literal":"U"}, {"literal":"N"}, {"literal":"I"}, {"literal":"T"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$7"], "postprocess": constant_rule},
    {"name": "instruction$string$8", "symbols": [{"literal":"I"}, {"literal":"F"}, {"literal":"_"}, {"literal":"N"}, {"literal":"O"}, {"literal":"N"}, {"literal":"E"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$8", "_", "subInstruction", "_", "subInstruction"], "postprocess": string_rule_rule},
    {"name": "instruction$string$9", "symbols": [{"literal":"P"}, {"literal":"A"}, {"literal":"I"}, {"literal":"R"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$9"], "postprocess": constant_rule},
    {"name": "instruction$string$10", "symbols": [{"literal":"C"}, {"literal":"A"}, {"literal":"R"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$10"], "postprocess": constant_rule},
    {"name": "instruction$string$11", "symbols": [{"literal":"C"}, {"literal":"D"}, {"literal":"R"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$11"], "postprocess": constant_rule},
    {"name": "instruction$string$12", "symbols": [{"literal":"L"}, {"literal":"E"}, {"literal":"F"}, {"literal":"T"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$12", "_", "type"], "postprocess": string_rule},
    {"name": "instruction$string$13", "symbols": [{"literal":"R"}, {"literal":"I"}, {"literal":"G"}, {"literal":"H"}, {"literal":"T"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$13", "_", "type"], "postprocess": string_rule},
    {"name": "instruction$string$14", "symbols": [{"literal":"I"}, {"literal":"F"}, {"literal":"_"}, {"literal":"L"}, {"literal":"E"}, {"literal":"F"}, {"literal":"T"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$14", "_", "subInstruction", "_", "subInstruction"], "postprocess": string_rule_rule},
    {"name": "instruction$string$15", "symbols": [{"literal":"I"}, {"literal":"F"}, {"literal":"_"}, {"literal":"R"}, {"literal":"I"}, {"literal":"G"}, {"literal":"H"}, {"literal":"T"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$15", "_", "subInstruction", "_", "subInstruction"], "postprocess": string_rule_rule},
    {"name": "instruction$string$16", "symbols": [{"literal":"N"}, {"literal":"I"}, {"literal":"L"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$16", "_", "type"], "postprocess": string_rule},
    {"name": "instruction$string$17", "symbols": [{"literal":"C"}, {"literal":"O"}, {"literal":"N"}, {"literal":"S"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$17"], "postprocess": constant_rule},
    {"name": "instruction$string$18", "symbols": [{"literal":"I"}, {"literal":"F"}, {"literal":"_"}, {"literal":"C"}, {"literal":"O"}, {"literal":"N"}, {"literal":"S"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$18", "_", "subInstruction", "_", "subInstruction"], "postprocess": string_rule_rule},
    {"name": "instruction$string$19", "symbols": [{"literal":"S"}, {"literal":"I"}, {"literal":"Z"}, {"literal":"E"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$19"], "postprocess": constant_rule},
    {"name": "instruction$string$20", "symbols": [{"literal":"E"}, {"literal":"M"}, {"literal":"P"}, {"literal":"T"}, {"literal":"Y"}, {"literal":"_"}, {"literal":"S"}, {"literal":"E"}, {"literal":"T"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$20", "_", "comparableType"], "postprocess": string_rule},
    {"name": "instruction$string$21", "symbols": [{"literal":"E"}, {"literal":"M"}, {"literal":"P"}, {"literal":"T"}, {"literal":"Y"}, {"literal":"_"}, {"literal":"M"}, {"literal":"A"}, {"literal":"P"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$21", "_", "comparableType", "_", "type"], "postprocess": string_rule_rule},
    {"name": "instruction$string$22", "symbols": [{"literal":"M"}, {"literal":"A"}, {"literal":"P"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$22", "_", "subInstruction"], "postprocess": string_rule},
    {"name": "instruction$string$23", "symbols": [{"literal":"I"}, {"literal":"T"}, {"literal":"E"}, {"literal":"R"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$23", "_", "subInstruction"], "postprocess": string_rule},
    {"name": "instruction$string$24", "symbols": [{"literal":"M"}, {"literal":"E"}, {"literal":"M"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$24"], "postprocess": constant_rule},
    {"name": "instruction$string$25", "symbols": [{"literal":"G"}, {"literal":"E"}, {"literal":"T"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$25"], "postprocess": constant_rule},
    {"name": "instruction$string$26", "symbols": [{"literal":"U"}, {"literal":"P"}, {"literal":"D"}, {"literal":"A"}, {"literal":"T"}, {"literal":"E"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$26"], "postprocess": constant_rule},
    {"name": "instruction$string$27", "symbols": [{"literal":"I"}, {"literal":"F"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$27", "_", "subInstruction", "_", "subInstruction"], "postprocess": string_rule_rule},
    {"name": "instruction$string$28", "symbols": [{"literal":"L"}, {"literal":"O"}, {"literal":"O"}, {"literal":"P"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$28", "_", "subInstruction"], "postprocess": string_rule},
    {"name": "instruction$string$29", "symbols": [{"literal":"L"}, {"literal":"O"}, {"literal":"O"}, {"literal":"P"}, {"literal":"_"}, {"literal":"L"}, {"literal":"E"}, {"literal":"F"}, {"literal":"T"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$29", "_", "subInstruction"], "postprocess": string_rule},
    {"name": "instruction$string$30", "symbols": [{"literal":"L"}, {"literal":"A"}, {"literal":"M"}, {"literal":"B"}, {"literal":"D"}, {"literal":"A"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$30", "_", "type", "_", "type", "_", "subInstruction"], "postprocess": string_rule_rule_rule},
    {"name": "instruction$string$31", "symbols": [{"literal":"E"}, {"literal":"X"}, {"literal":"E"}, {"literal":"C"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$31"], "postprocess": constant_rule},
    {"name": "instruction$string$32", "symbols": [{"literal":"D"}, {"literal":"I"}, {"literal":"P"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$32", "_", "subInstruction"], "postprocess": string_rule},
    {"name": "instruction$string$33", "symbols": [{"literal":"F"}, {"literal":"A"}, {"literal":"I"}, {"literal":"L"}, {"literal":"W"}, {"literal":"I"}, {"literal":"T"}, {"literal":"H"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$33", "_", "data"], "postprocess": string_rule},
    {"name": "instruction$string$34", "symbols": [{"literal":"C"}, {"literal":"A"}, {"literal":"S"}, {"literal":"T"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$34"], "postprocess": constant_rule},
    {"name": "instruction$string$35", "symbols": [{"literal":"R"}, {"literal":"E"}, {"literal":"N"}, {"literal":"A"}, {"literal":"M"}, {"literal":"E"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$35"], "postprocess": constant_rule},
    {"name": "instruction$string$36", "symbols": [{"literal":"C"}, {"literal":"O"}, {"literal":"N"}, {"literal":"C"}, {"literal":"A"}, {"literal":"T"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$36"], "postprocess": constant_rule},
    {"name": "instruction$string$37", "symbols": [{"literal":"S"}, {"literal":"L"}, {"literal":"I"}, {"literal":"C"}, {"literal":"E"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$37"], "postprocess": constant_rule},
    {"name": "instruction$string$38", "symbols": [{"literal":"P"}, {"literal":"A"}, {"literal":"C"}, {"literal":"K"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$38"], "postprocess": constant_rule},
    {"name": "instruction$string$39", "symbols": [{"literal":"U"}, {"literal":"N"}, {"literal":"P"}, {"literal":"A"}, {"literal":"C"}, {"literal":"K"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$39"], "postprocess": constant_rule},
    {"name": "instruction$string$40", "symbols": [{"literal":"A"}, {"literal":"D"}, {"literal":"D"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$40"], "postprocess": constant_rule},
    {"name": "instruction$string$41", "symbols": [{"literal":"S"}, {"literal":"U"}, {"literal":"B"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$41"], "postprocess": constant_rule},
    {"name": "instruction$string$42", "symbols": [{"literal":"M"}, {"literal":"U"}, {"literal":"L"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$42"], "postprocess": constant_rule},
    {"name": "instruction$string$43", "symbols": [{"literal":"E"}, {"literal":"D"}, {"literal":"I"}, {"literal":"V"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$43"], "postprocess": constant_rule},
    {"name": "instruction$string$44", "symbols": [{"literal":"A"}, {"literal":"B"}, {"literal":"S"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$44"], "postprocess": constant_rule},
    {"name": "instruction$string$45", "symbols": [{"literal":"N"}, {"literal":"E"}, {"literal":"G"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$45"], "postprocess": constant_rule},
    {"name": "instruction$string$46", "symbols": [{"literal":"L"}, {"literal":"S"}, {"literal":"L"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$46"], "postprocess": constant_rule},
    {"name": "instruction$string$47", "symbols": [{"literal":"L"}, {"literal":"S"}, {"literal":"R"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$47"], "postprocess": constant_rule},
    {"name": "instruction$string$48", "symbols": [{"literal":"O"}, {"literal":"R"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$48"], "postprocess": constant_rule},
    {"name": "instruction$string$49", "symbols": [{"literal":"A"}, {"literal":"N"}, {"literal":"D"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$49"], "postprocess": constant_rule},
    {"name": "instruction$string$50", "symbols": [{"literal":"X"}, {"literal":"O"}, {"literal":"R"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$50"], "postprocess": constant_rule},
    {"name": "instruction$string$51", "symbols": [{"literal":"N"}, {"literal":"O"}, {"literal":"T"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$51"], "postprocess": constant_rule},
    {"name": "instruction$string$52", "symbols": [{"literal":"C"}, {"literal":"O"}, {"literal":"M"}, {"literal":"P"}, {"literal":"A"}, {"literal":"R"}, {"literal":"E"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$52"], "postprocess": constant_rule},
    {"name": "instruction$string$53", "symbols": [{"literal":"E"}, {"literal":"Q"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$53"], "postprocess": constant_rule},
    {"name": "instruction$string$54", "symbols": [{"literal":"N"}, {"literal":"E"}, {"literal":"Q"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$54"], "postprocess": constant_rule},
    {"name": "instruction$string$55", "symbols": [{"literal":"L"}, {"literal":"T"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$55"], "postprocess": constant_rule},
    {"name": "instruction$string$56", "symbols": [{"literal":"G"}, {"literal":"T"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$56"], "postprocess": constant_rule},
    {"name": "instruction$string$57", "symbols": [{"literal":"L"}, {"literal":"E"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$57"], "postprocess": constant_rule},
    {"name": "instruction$string$58", "symbols": [{"literal":"G"}, {"literal":"E"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$58"], "postprocess": constant_rule},
    {"name": "instruction$string$59", "symbols": [{"literal":"S"}, {"literal":"E"}, {"literal":"L"}, {"literal":"F"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$59"], "postprocess": constant_rule},
    {"name": "instruction$string$60", "symbols": [{"literal":"C"}, {"literal":"O"}, {"literal":"N"}, {"literal":"T"}, {"literal":"R"}, {"literal":"A"}, {"literal":"C"}, {"literal":"T"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$60", "_", "type"], "postprocess": string_rule},
    {"name": "instruction$string$61", "symbols": [{"literal":"T"}, {"literal":"R"}, {"literal":"A"}, {"literal":"N"}, {"literal":"S"}, {"literal":"F"}, {"literal":"E"}, {"literal":"R"}, {"literal":"_"}, {"literal":"T"}, {"literal":"O"}, {"literal":"K"}, {"literal":"E"}, {"literal":"N"}, {"literal":"S"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$61"], "postprocess": constant_rule},
    {"name": "instruction$string$62", "symbols": [{"literal":"S"}, {"literal":"E"}, {"literal":"T"}, {"literal":"_"}, {"literal":"D"}, {"literal":"E"}, {"literal":"L"}, {"literal":"E"}, {"literal":"G"}, {"literal":"A"}, {"literal":"T"}, {"literal":"E"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$62"], "postprocess": constant_rule},
    {"name": "instruction$string$63", "symbols": [{"literal":"C"}, {"literal":"R"}, {"literal":"E"}, {"literal":"A"}, {"literal":"T"}, {"literal":"E"}, {"literal":"_"}, {"literal":"A"}, {"literal":"C"}, {"literal":"C"}, {"literal":"O"}, {"literal":"U"}, {"literal":"N"}, {"literal":"T"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$63"], "postprocess": constant_rule},
    {"name": "instruction$string$64", "symbols": [{"literal":"C"}, {"literal":"R"}, {"literal":"E"}, {"literal":"A"}, {"literal":"T"}, {"literal":"E"}, {"literal":"_"}, {"literal":"C"}, {"literal":"O"}, {"literal":"N"}, {"literal":"T"}, {"literal":"R"}, {"literal":"A"}, {"literal":"C"}, {"literal":"T"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$64"], "postprocess": constant_rule},
    {"name": "instruction$string$65", "symbols": [{"literal":"C"}, {"literal":"R"}, {"literal":"E"}, {"literal":"A"}, {"literal":"T"}, {"literal":"E"}, {"literal":"_"}, {"literal":"C"}, {"literal":"O"}, {"literal":"N"}, {"literal":"T"}, {"literal":"R"}, {"literal":"A"}, {"literal":"C"}, {"literal":"T"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$65", "_", "subInstruction"]},
    {"name": "instruction$string$66", "symbols": [{"literal":"I"}, {"literal":"M"}, {"literal":"P"}, {"literal":"L"}, {"literal":"I"}, {"literal":"C"}, {"literal":"I"}, {"literal":"T"}, {"literal":"_"}, {"literal":"A"}, {"literal":"C"}, {"literal":"C"}, {"literal":"O"}, {"literal":"U"}, {"literal":"N"}, {"literal":"T"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$66"], "postprocess": constant_rule},
    {"name": "instruction$string$67", "symbols": [{"literal":"N"}, {"literal":"O"}, {"literal":"W"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$67"], "postprocess": constant_rule},
    {"name": "instruction$string$68", "symbols": [{"literal":"A"}, {"literal":"M"}, {"literal":"O"}, {"literal":"U"}, {"literal":"N"}, {"literal":"T"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$68"], "postprocess": constant_rule},
    {"name": "instruction$string$69", "symbols": [{"literal":"B"}, {"literal":"A"}, {"literal":"L"}, {"literal":"A"}, {"literal":"N"}, {"literal":"C"}, {"literal":"E"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$69"], "postprocess": constant_rule},
    {"name": "instruction$string$70", "symbols": [{"literal":"C"}, {"literal":"H"}, {"literal":"E"}, {"literal":"C"}, {"literal":"K"}, {"literal":"_"}, {"literal":"S"}, {"literal":"I"}, {"literal":"G"}, {"literal":"N"}, {"literal":"A"}, {"literal":"T"}, {"literal":"U"}, {"literal":"R"}, {"literal":"E"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$70"], "postprocess": constant_rule},
    {"name": "instruction$string$71", "symbols": [{"literal":"B"}, {"literal":"L"}, {"literal":"A"}, {"literal":"K"}, {"literal":"E"}, {"literal":"2"}, {"literal":"B"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$71"], "postprocess": constant_rule},
    {"name": "instruction$string$72", "symbols": [{"literal":"S"}, {"literal":"H"}, {"literal":"A"}, {"literal":"2"}, {"literal":"5"}, {"literal":"6"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$72"], "postprocess": constant_rule},
    {"name": "instruction$string$73", "symbols": [{"literal":"S"}, {"literal":"H"}, {"literal":"A"}, {"literal":"5"}, {"literal":"1"}, {"literal":"2"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$73"], "postprocess": constant_rule},
    {"name": "instruction$string$74", "symbols": [{"literal":"H"}, {"literal":"A"}, {"literal":"S"}, {"literal":"H"}, {"literal":"_"}, {"literal":"K"}, {"literal":"E"}, {"literal":"Y"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$74"], "postprocess": constant_rule},
    {"name": "instruction$string$75", "symbols": [{"literal":"S"}, {"literal":"T"}, {"literal":"E"}, {"literal":"P"}, {"literal":"S"}, {"literal":"_"}, {"literal":"T"}, {"literal":"O"}, {"literal":"_"}, {"literal":"Q"}, {"literal":"U"}, {"literal":"O"}, {"literal":"T"}, {"literal":"A"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$75"], "postprocess": constant_rule},
    {"name": "instruction$string$76", "symbols": [{"literal":"S"}, {"literal":"O"}, {"literal":"U"}, {"literal":"R"}, {"literal":"C"}, {"literal":"E"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$76"], "postprocess": constant_rule},
    {"name": "instruction$string$77", "symbols": [{"literal":"S"}, {"literal":"E"}, {"literal":"N"}, {"literal":"D"}, {"literal":"E"}, {"literal":"R"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$77"], "postprocess": constant_rule},
    {"name": "instruction$string$78", "symbols": [{"literal":"A"}, {"literal":"D"}, {"literal":"D"}, {"literal":"R"}, {"literal":"E"}, {"literal":"S"}, {"literal":"S"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$78"], "postprocess": constant_rule},
    {"name": "instruction$string$79", "symbols": [{"literal":"D"}, {"literal":"E"}, {"literal":"F"}, {"literal":"A"}, {"literal":"U"}, {"literal":"L"}, {"literal":"T"}, {"literal":"_"}, {"literal":"A"}, {"literal":"C"}, {"literal":"C"}, {"literal":"O"}, {"literal":"U"}, {"literal":"N"}, {"literal":"T"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$79"], "postprocess": constant_rule},
    {"name": "instruction$string$80", "symbols": [{"literal":"F"}, {"literal":"A"}, {"literal":"I"}, {"literal":"L"}, {"literal":"W"}, {"literal":"I"}, {"literal":"T"}, {"literal":"H"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$80"], "postprocess": constant_rule},
    {"name": "data", "symbols": ["int"], "postprocess": id},
    {"name": "data", "symbols": ["nat"], "postprocess": id},
    {"name": "data", "symbols": ["string"], "postprocess": id},
    {"name": "data", "symbols": ["dqstring"], "postprocess": id},
    {"name": "data$string$1", "symbols": [{"literal":"U"}, {"literal":"n"}, {"literal":"i"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "data", "symbols": ["data$string$1"], "postprocess": constant_rule},
    {"name": "data$string$2", "symbols": [{"literal":"T"}, {"literal":"r"}, {"literal":"u"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "data", "symbols": ["data$string$2"], "postprocess": constant_rule},
    {"name": "data$string$3", "symbols": [{"literal":"F"}, {"literal":"a"}, {"literal":"l"}, {"literal":"s"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "data", "symbols": ["data$string$3"], "postprocess": constant_rule},
    {"name": "data$string$4", "symbols": [{"literal":"P"}, {"literal":"a"}, {"literal":"i"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "data", "symbols": ["data$string$4", "_", "data", "_", "data"], "postprocess": string_rule_rule},
    {"name": "data$string$5", "symbols": [{"literal":"L"}, {"literal":"e"}, {"literal":"f"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "data", "symbols": ["data$string$5", "_", "data"], "postprocess": string_rule},
    {"name": "data$string$6", "symbols": [{"literal":"R"}, {"literal":"i"}, {"literal":"g"}, {"literal":"h"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "data", "symbols": ["data$string$6", "_", "data"], "postprocess": string_rule},
    {"name": "data$string$7", "symbols": [{"literal":"S"}, {"literal":"o"}, {"literal":"m"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "data", "symbols": ["data$string$7", "_", "data"], "postprocess": string_rule},
    {"name": "data$string$8", "symbols": [{"literal":"N"}, {"literal":"o"}, {"literal":"n"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "data", "symbols": ["data$string$8"], "postprocess": constant_rule},
    {"name": "data", "symbols": ["subData"], "postprocess": id},
    {"name": "data", "symbols": ["subElt"], "postprocess": id},
    {"name": "data$string$9", "symbols": [{"literal":"i"}, {"literal":"n"}, {"literal":"s"}, {"literal":"t"}, {"literal":"r"}, {"literal":"u"}, {"literal":"c"}, {"literal":"t"}, {"literal":"i"}, {"literal":"o"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "data", "symbols": ["data$string$9"], "postprocess": constant_rule},
    {"name": "subData$ebnf$1$subexpression$1", "symbols": ["data", {"literal":";"}, "_"]},
    {"name": "subData$ebnf$1", "symbols": ["subData$ebnf$1$subexpression$1"]},
    {"name": "subData$ebnf$1$subexpression$2", "symbols": ["data", {"literal":";"}, "_"]},
    {"name": "subData$ebnf$1", "symbols": ["subData$ebnf$1", "subData$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "subData", "symbols": [{"literal":"{"}, "_", "subData$ebnf$1", {"literal":"}"}], "postprocess": code_rule},
    {"name": "subData$ebnf$2$subexpression$1", "symbols": ["data", {"literal":";"}, "_"]},
    {"name": "subData$ebnf$2", "symbols": ["subData$ebnf$2$subexpression$1"]},
    {"name": "subData$ebnf$2$subexpression$2", "symbols": ["data", {"literal":";"}, "_"]},
    {"name": "subData$ebnf$2", "symbols": ["subData$ebnf$2", "subData$ebnf$2$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "subData", "symbols": [{"literal":"("}, "_", "subData$ebnf$2", {"literal":")"}], "postprocess": code_rule},
    {"name": "subElt$ebnf$1$subexpression$1", "symbols": ["elt", {"literal":";"}, "_"]},
    {"name": "subElt$ebnf$1", "symbols": ["subElt$ebnf$1$subexpression$1"]},
    {"name": "subElt$ebnf$1$subexpression$2", "symbols": ["elt", {"literal":";"}, "_"]},
    {"name": "subElt$ebnf$1", "symbols": ["subElt$ebnf$1", "subElt$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "subElt", "symbols": [{"literal":"{"}, "_", "subElt$ebnf$1", {"literal":"}"}], "postprocess": code_rule},
    {"name": "subElt$ebnf$2$subexpression$1", "symbols": ["elt", {"literal":";"}, "_"]},
    {"name": "subElt$ebnf$2", "symbols": ["subElt$ebnf$2$subexpression$1"]},
    {"name": "subElt$ebnf$2$subexpression$2", "symbols": ["elt", {"literal":";"}, "_"]},
    {"name": "subElt$ebnf$2", "symbols": ["subElt$ebnf$2", "subElt$ebnf$2$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "subElt", "symbols": [{"literal":"("}, "_", "subElt$ebnf$2", {"literal":")"}], "postprocess": code_rule},
    {"name": "elt$string$1", "symbols": [{"literal":"E"}, {"literal":"l"}, {"literal":"t"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "elt", "symbols": ["elt$string$1", "_", "data", "_", "data"], "postprocess": string_rule_rule},
    {"name": "nat$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "nat$ebnf$1", "symbols": ["nat$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "nat", "symbols": ["nat$ebnf$1"], "postprocess": constant_rule},
    {"name": "int", "symbols": [{"literal":"-"}, "nat"], "postprocess": constant_rule},
    {"name": "char$ebnf$1", "symbols": [/[a-z]/]},
    {"name": "char$ebnf$1", "symbols": ["char$ebnf$1", /[a-z]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "char", "symbols": ["char$ebnf$1"], "postprocess": constant_rule},
    {"name": "string$ebnf$1", "symbols": [/[0-9|a-z]/]},
    {"name": "string$ebnf$1", "symbols": ["string$ebnf$1", /[0-9|a-z]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "string", "symbols": ["string$ebnf$1"], "postprocess": d => d[0].join('')},
    {"name": "dqstring$ebnf$1", "symbols": []},
    {"name": "dqstring$ebnf$1", "symbols": ["dqstring$ebnf$1", "dstrchar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "dqstring", "symbols": [{"literal":"\""}, "dqstring$ebnf$1", {"literal":"\""}], "postprocess": d => d[1].join('')},
    {"name": "dstrchar", "symbols": [/[^"]/], "postprocess": id},
    {"name": "dstrchar$string$1", "symbols": [{"literal":"\\"}, {"literal":"\""}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "dstrchar", "symbols": ["dstrchar$string$1"], "postprocess": d => '"'},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", /[\s]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"]},
    {"name": "semicolons", "symbols": []},
    {"name": "semicolons", "symbols": ["semicolons", {"literal":";"}]}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
