// Generated automatically by nearley, version 2.16.0
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }


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

var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "main", "symbols": ["instruction"], "postprocess": id},
    {"name": "main", "symbols": ["data"]},
    {"name": "main", "symbols": ["comparableType"], "postprocess": id},
    {"name": "main", "symbols": ["type"], "postprocess": id},
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
    {"name": "type", "symbols": ["comparableType"], "postprocess": id},
    {"name": "type$string$1", "symbols": [{"literal":"o"}, {"literal":"p"}, {"literal":"t"}, {"literal":"i"}, {"literal":"o"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "type", "symbols": ["type$string$1", "_", "type"], "postprocess": string_rule},
    {"name": "type$string$2", "symbols": [{"literal":"o"}, {"literal":"p"}, {"literal":"t"}, {"literal":"i"}, {"literal":"o"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "type", "symbols": [{"literal":"("}, "_", "type$string$2", "_", "type", "_", {"literal":")"}], "postprocess": p_string_rule_endp},
    {"name": "type$string$3", "symbols": [{"literal":"o"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "type", "symbols": ["type$string$3", "_", "type", "_", "type"], "postprocess": string_rule_rule},
    {"name": "type$string$4", "symbols": [{"literal":"o"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "type", "symbols": [{"literal":"("}, "_", "type$string$4", "_", "type", "_", "type", "_", {"literal":")"}]},
    {"name": "subInstruction$ebnf$1$subexpression$1", "symbols": ["instruction", "_", {"literal":";"}, "_"]},
    {"name": "subInstruction$ebnf$1", "symbols": ["subInstruction$ebnf$1$subexpression$1"]},
    {"name": "subInstruction$ebnf$1$subexpression$2", "symbols": ["instruction", "_", {"literal":";"}, "_"]},
    {"name": "subInstruction$ebnf$1", "symbols": ["subInstruction$ebnf$1", "subInstruction$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "subInstruction", "symbols": [{"literal":"{"}, "_", "subInstruction$ebnf$1", {"literal":"}"}], "postprocess": code_rule},
    {"name": "instruction", "symbols": ["subInstruction"], "postprocess": id},
    {"name": "instruction$string$1", "symbols": [{"literal":"D"}, {"literal":"R"}, {"literal":"O"}, {"literal":"P"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$1"], "postprocess": constant_rule},
    {"name": "instruction$string$2", "symbols": [{"literal":"D"}, {"literal":"U"}, {"literal":"P"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$2"], "postprocess": constant_rule},
    {"name": "instruction$string$3", "symbols": [{"literal":"S"}, {"literal":"W"}, {"literal":"A"}, {"literal":"P"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$3"]},
    {"name": "instruction$string$4", "symbols": [{"literal":"P"}, {"literal":"U"}, {"literal":"S"}, {"literal":"H"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$4", "_", "type", "_", "data"], "postprocess": string_rule_rule},
    {"name": "instruction$string$5", "symbols": [{"literal":"S"}, {"literal":"O"}, {"literal":"M"}, {"literal":"E"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$5"], "postprocess": string_rule_rule},
    {"name": "instruction$string$6", "symbols": [{"literal":"N"}, {"literal":"O"}, {"literal":"N"}, {"literal":"E"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$6", "_", "type"]},
    {"name": "instruction$string$7", "symbols": [{"literal":"U"}, {"literal":"N"}, {"literal":"I"}, {"literal":"T"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$7"]},
    {"name": "instruction$string$8", "symbols": [{"literal":"I"}, {"literal":"F"}, {"literal":"_"}, {"literal":"N"}, {"literal":"O"}, {"literal":"N"}, {"literal":"E"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$8", "_", "subInstruction", "_", "subInstruction"]},
    {"name": "instruction$string$9", "symbols": [{"literal":"p"}, {"literal":"a"}, {"literal":"i"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": ["instruction$string$9", "_", "type", "_", "type"], "postprocess": string_rule_rule},
    {"name": "instruction$string$10", "symbols": [{"literal":"p"}, {"literal":"a"}, {"literal":"i"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "instruction", "symbols": [{"literal":"("}, "_", "instruction$string$10", "_", "type", "_", "type", "_", {"literal":")"}], "postprocess": p_string_rule_rule_endp},
    {"name": "data", "symbols": ["int"]},
    {"name": "nat$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "nat$ebnf$1", "symbols": ["nat$ebnf$1", /[0-9]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "nat", "symbols": ["nat$ebnf$1"], "postprocess": id},
    {"name": "int$subexpression$1", "symbols": []},
    {"name": "int$subexpression$1", "symbols": [{"literal":"-"}]},
    {"name": "int", "symbols": ["int$subexpression$1", "nat"]},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", /[\s]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"]}
]
  , ParserStart: "main"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();
