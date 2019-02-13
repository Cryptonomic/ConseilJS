const nearley = require("nearley");
const grammar = require("./michelson.js");
//const grammar = require("./test.js");
const util = require('util');

const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));

const script_one = "{ CAR; NIL operation; PAIR;}"
const storage_one = "world"
//Note: DIP{ DIP{DUP}, SWAP} IS VALID MICHELSON, BUT DIP{DIP{DUP;}, SWAP;} WILL PARSE EASIER
const script_two = "{ CDR; DUP; NIL operation; DIP{ DIP{DUP;}; SWAP;}; SWAP; DIP{DIP{DIP{DROP;};};}; AMOUNT; NONE mutez; SENDER; SOME; PAIR; LEFT (or mutez (or (pair (option address) (option mutez)) address)); RIGHT (option address); TRANSFER_TOKENS; CONS; PAIR; }"
const storage_two = "(contract (or (option address) (or (pair (option address) (option mutez)) (or mutez (or (pair (option address) (option mutez)) address)))))"
const script_three = "{ DUP ; DIP { CDR; } ; CAR ; DIP { DUP; } ; SWAP ; DUP ; CAR ; SWAP ; DROP ; DIP { DROP ;} ; PUSH nat 1 ;  DIP { DIP { DUP ;} ; SWAP; } ; SWAP ;  DIP { DIP { DIP { DROP ;} ;} ;} ;  CDR ;  ADD ;  SWAP ;  PAIR ;  NIL operation ;  PAIR ;}"
const storage_three = "(pair string nat)"
//parser.feed(script_one)
//parser.feed(storage_one)
//parser.feed(script_two)
//parser.feed(storage_two)
//parser.feed(script_three)
//parser.feed(storage_three)
//const singleton = "int"
const string_rule = "{DROP; DUP;}"
const parameter_test = "parameter unit;"
const storage_test = "storage mutez;"
//Unit should not need a semicolon, default_account might be deprecated
const code_test = "code { CAR; DEFAULT_ACCOUNT; DIP{UNIT;}; PUSH mutez \"1.00\"; UNIT; TRANSFER_TOKENS; PAIR; }"
//tez and CMPLT are not included
const code_test_two = "code {CDR; DUP; AMOUNT; IF {FAIL} {UNIT; PAIR}}"
const code_test_three = "code { DIP{NIL int}; CAR; DUP; DIP{CAR; PAIR}; CDR; LAMBDA (pair int (pair (lambda int int) (list int))) (pair (lambda int int) (list int)) { DUP; CDAR; DIP{ DUP; DIP{CDAR}; DUP; CAR; DIP{CDDR; SWAP}; EXEC; CONS}; PAIR}; REDUCE; CDR; DIP{NIL int}; LAMBDA (pair int (list int)) (list int) {DUP; CAR; DIP{CDR}; CONS}; REDUCE; UNIT; SWAP; PAIR}"
const code_test_four = "code { DIP{NIL int;}; CAR; DUP; DIP{CAR; PAIR;}; CDR; LAMBDA (pair int (list int)) (list int) {DUP; CAR; DIP{CDR;}; CONS;}; }"

const code_test_five = `code { DUP ;
    DIP { CDR } ;
    CAR ;
    DUP ;
    IF_LEFT
      { { DIP { DIP { DUP } ; SWAP } ; SWAP } ;
        { DIP { DUP } ; SWAP } ;
        DUP ;
        IF_NONE { SENDER } {} ;
        DIP { DROP } ;
        PAIR ;
        DUP ;
        CDR ;
        DUP ;
        { CDR ; CDR ; CDR ; CDR ; CAR } ;
        AMOUNT ;
        COMPARE ;
        GE ;
        DUP ;
        NOT ;
        IF { UNIT ; FAILWITH } { UNIT } ;
        DIP { DROP } ;
        DROP ;
        DUP ;
        { CDR ; CDR ; CAR } ;
        { DIP { DUP } ; SWAP } ;
        { CDR ; CAR } ;
        DUP ;
        { DIP { DIP { DUP } ; SWAP } ; SWAP } ;
        COMPARE ;
        GT ;
        DUP ;
        NOT ;
        IF { UNIT ; FAILWITH } { UNIT } ;
        DIP { DROP } ;
        DROP ;
        DUP ;
        { DIP { DIP { DUP } ; SWAP } ; SWAP } ;
        SUB ;
        AMOUNT ;
        COMPARE ;
        LE ;
        DUP ;
        NOT ;
        IF { UNIT ; FAILWITH } { UNIT } ;
        DIP { DROP } ;
        DROP ;
        { DIP { DIP { DUP } ; SWAP } ; SWAP } ;
        AMOUNT ;
        PAIR ;
        { DIP { DIP { DIP { DIP { DUP } ; SWAP } ; SWAP } ; SWAP } ;
          SWAP } ;
        CAR ;
        PAIR ;
        DUP ;
        CAR ;
        { DIP { DUP } ; SWAP } ;
        { CDR ; CAR } ;
        { DIP { DIP { DUP } ; SWAP } ; SWAP } ;
        { CDR ; CDR } ;
        DUP ;
        CAR ;
        { DIP { DIP { DIP { DUP } ; SWAP } ; SWAP } ; SWAP } ;
        PAIR ;
        DUP ;
        CDR ;
        { DIP { DUP } ; SWAP } ;
        CAR ;
        GET ;
        IF_NONE { PUSH mutez 0 ; PUSH mutez 0 ; PAIR } {} ;
        DIP { DROP } ;
        { DIP { DUP } ; SWAP } ;
        DUP ;
        CAR ;
        SWAP ;
        CDR ;
        CDR ;
        { DIP { DIP { DIP { DIP { DUP } ; SWAP } ; SWAP } ; SWAP } ;
          SWAP } ;
        { DIP { DIP { DIP { DIP { DUP } ; SWAP } ; SWAP } ; SWAP } ;
          SWAP } ;
        { CDR ; CAR } ;
        ADD ;
        PAIR ;
        SWAP ;
        PAIR ;
        DUP ;
        CDR ;
        { DIP { DUP } ; SWAP } ;
        CAR ;
        { DIP { DIP { DIP { DUP } ; SWAP } ; SWAP } ; SWAP } ;
        CDR ;
        { DIP { DIP { DIP { DIP { DIP { DIP { DUP } ; SWAP } ; SWAP } ; SWAP } ;
                      SWAP } ;
                SWAP } ;
          SWAP } ;
        { DIP { DIP { DIP { DIP { DIP { DUP } ; SWAP } ; SWAP } ; SWAP } ;
                SWAP } ;
          SWAP } ;
        CAR ;
        ADD ;
        PAIR ;
        { DIP { DIP { DIP { DIP { DIP { DIP { DIP { DUP } ; SWAP } ; SWAP } ; SWAP } ;
                            SWAP } ;
                      SWAP } ;
                SWAP } ;
          SWAP } ;
        DIP { SOME } ;
        { DIP { DIP { DIP { DIP { DROP ;
                                  DROP ;
                                  DROP ;
                                  DROP ;
                                  DROP ;
                                  DROP ;
                                  DROP ;
                                  DROP ;
                                  DROP ;
                                  DROP ;
                                  DROP } } } } } ;
        UPDATE ;
        PAIR ;
        DUP ;
        NIL operation ;
        { DIP { DIP { DUP } ; SWAP } ; SWAP } ;
        { DIP { DIP { DIP { DROP } } } } ;
        { CDR ; CDR ; CDR ; CDR ; CDR ; CAR } ;
        IMPLICIT_ACCOUNT ;
        AMOUNT ;
        UNIT ;
        TRANSFER_TOKENS ;
        CONS ;
        PAIR }
      { IF_LEFT
          { { DIP { DIP { DUP } ; SWAP } ; SWAP } ;
            { DIP { DUP } ; SWAP } ;
            CAR ;
            IF_NONE
              { UNIT }
              { DUP ;
                SENDER ;
                COMPARE ;
                EQ ;
                IF { UNIT }
                   { { DIP { DUP } ; SWAP } ;
                     DUP ;
                     { CDR ; CDR ; CDR ; CAR } ;
                     IF_NONE { UNIT ; FAILWITH } {} ;
                     DIP { DROP } ;
                     SENDER ;
                     COMPARE ;
                     EQ ;
                     IF { UNIT }
                        { { DIP { DUP } ; SWAP } ;
                          { CDR ; CDR ; CDR ; CDR ; CDR ; CDR ; CAR } ;
                          SENDER ;
                          COMPARE ;
                          EQ ;
                          IF { UNIT } { UNIT ; FAILWITH } } } ;
                DIP { DROP } } ;
            DROP ;
            DUP ;
            { DIP { DIP { DUP } ; SWAP } ; SWAP } ;
            PAIR ;
            DUP ;
            CAR ;
            { DIP { DUP } ; SWAP } ;
            CDR ;
            PUSH mutez 0 ;
            AMOUNT ;
            COMPARE ;
            EQ ;
            DUP ;
            NOT ;
            IF { UNIT ; FAILWITH } { UNIT } ;
            DIP { DROP } ;
            DROP ;
            { DIP { DUP } ; SWAP } ;
            CAR ;
            DUP ;
            IF_NONE { SENDER } {} ;
            DIP { DROP } ;
            { DIP { DUP } ; SWAP } ;
            CAR ;
            { DIP { DUP } ; SWAP } ;
            PAIR ;
            DUP ;
            CDR ;
            { DIP { DUP } ; SWAP } ;
            CAR ;
            GET ;
            IF_NONE { PUSH mutez 0 ; PUSH mutez 0 ; PAIR } {} ;
            DIP { DROP } ;
            DUP ;
            CDR ;
            { DIP { DUP } ; SWAP } ;
            CAR ;
            SUB ;
            { DIP { DIP { DIP { DIP { DUP } ; SWAP } ; SWAP } ; SWAP } ;
              SWAP } ;
            CDR ;
            IF_NONE { DUP } {} ;
            { DIP { DUP } ; SWAP } ;
            { DIP { DUP } ; SWAP } ;
            COMPARE ;
            LE ;
            DUP ;
            NOT ;
            IF { UNIT ; FAILWITH } { UNIT } ;
            DIP { DROP } ;
            DROP ;
            { DIP { DUP } ; SWAP } ;
            { DIP { DUP } ; SWAP } ;
            COMPARE ;
            EQ ;
            PUSH mutez 0 ;
            { DIP { DIP { DUP } ; SWAP } ; SWAP } ;
            COMPARE ;
            GT ;
            AND ;
            { DIP { DIP { DIP { DIP { DIP { DUP } ; SWAP } ; SWAP } ; SWAP } ;
                    SWAP } ;
              SWAP } ;
            { CDR ; CDR ; CDR ; CDR ; CAR } ;
            { DIP { DIP { DUP } ; SWAP } ; SWAP } ;
            COMPARE ;
            GE ;
            OR ;
            DUP ;
            NOT ;
            IF { UNIT ; FAILWITH } { UNIT } ;
            DIP { DROP } ;
            DROP ;
            { DIP { DIP { DIP { DIP { DUP } ; SWAP } ; SWAP } ; SWAP } ;
              SWAP } ;
            { DIP { DUP } ; SWAP } ;
            PAIR ;
            { DIP { DIP { DIP { DIP { DUP } ; SWAP } ; SWAP } ; SWAP } ;
              SWAP } ;
            PAIR ;
            DUP ;
            CAR ;
            { DIP { DUP } ; SWAP } ;
            { CDR ; CDR } ;
            DUP ;
            CAR ;
            { DIP { DIP { DUP } ; SWAP } ; SWAP } ;
            PAIR ;
            DUP ;
            CDR ;
            { DIP { DUP } ; SWAP } ;
            CAR ;
            GET ;
            IF_NONE { PUSH mutez 0 ; PUSH mutez 0 ; PAIR } {} ;
            DIP { DROP } ;
            { DIP { DUP } ; SWAP } ;
            CDR ;
            { DIP { DIP { DUP } ; SWAP } ; SWAP } ;
            CAR ;
            { DIP { DIP { DIP { DIP { DIP { DUP } ; SWAP } ; SWAP } ; SWAP } ;
                    SWAP } ;
              SWAP } ;
            { CDR ; CAR } ;
            { DIP { DIP { DIP { DUP } ; SWAP } ; SWAP } ; SWAP } ;
            CDR ;
            ADD ;
            { DIP { DIP { DIP { DUP } ; SWAP } ; SWAP } ; SWAP } ;
            CAR ;
            PAIR ;
            { DIP { DIP { DIP { DIP { DIP { DUP } ; SWAP } ; SWAP } ; SWAP } ;
                    SWAP } ;
              SWAP } ;
            DIP { SOME } ;
            { DIP { DIP { DIP { DIP { DROP ; DROP ; DROP ; DROP ; DROP ;
                                      DROP ; DROP ; DROP ; DROP ; DROP ;
                                      DROP ; DROP ; DROP } } } } } ;
            UPDATE ;
            PAIR ;
            NIL operation ;
            PAIR }
          { IF_LEFT
            { { DIP { DIP { DUP } ; SWAP } ; SWAP } ; DUP ; DUP ;
              { CDR ; CDR ; CDR ; CDR ; CDR ; CDR ; CAR } ; SENDER ;
              COMPARE ; EQ ; DUP ; NOT ; IF { UNIT ; FAILWITH } { UNIT } ;
              DIP { DROP ; DROP } ; DROP ; PUSH mutez 0 ; AMOUNT ;
              COMPARE ; EQ ; DUP ; NOT ; IF { UNIT ; FAILWITH } { UNIT } ;
              DIP { DROP } ; DROP ; DUP ; CAR ; SWAP ; CDR ; DUP ; CAR ;
              SWAP ; CDR ; CDR ;
              { DIP { DIP { DIP { DUP } ; SWAP } ; SWAP } ; SWAP } ;
              { DIP { DIP { DIP { DIP { DROP } } } } } ; PAIR ; SWAP ;
              PAIR ; SWAP ; PAIR ; NIL operation ; PAIR }
            { IF_LEFT
              { { DIP { DIP { DUP } ; SWAP } ; SWAP } ; DUP ; DUP ;
                { CDR ; CDR ; CDR ; CDR ; CDR ; CDR ; CAR } ; SENDER ;
                COMPARE ; EQ ; DUP ; NOT ;
                IF { UNIT ; FAILWITH } { UNIT } ; DIP { DROP ; DROP } ;
                DROP ; PUSH mutez 0 ; AMOUNT ; COMPARE ; EQ ; DUP ; NOT ;
                IF { UNIT ; FAILWITH } { UNIT } ; DIP { DROP } ; DROP ;
                { DIP { DUP } ; SWAP } ; CAR ; DUP ;
                IF_NONE { SENDER } {} ; DIP { DROP } ;
                { DIP { DUP } ; SWAP } ; CAR ; { DIP { DUP } ; SWAP } ;
                PAIR ; DUP ; CDR ; { DIP { DUP } ; SWAP } ; CAR ; GET ;
                IF_NONE { PUSH mutez 0 ; PUSH mutez 0 ; PAIR } {} ;
                DIP { DROP } ;
                { DIP { DIP { DIP { DUP } ; SWAP } ; SWAP } ; SWAP } ;
                CDR ; IF_NONE { DUP ; CDR } {} ; DUP ;
                { DIP { DIP { DUP } ; SWAP } ; SWAP } ; CAR ; SUB ;
                { DIP { DIP { DIP { DIP { DUP } ; SWAP } ; SWAP } ; SWAP } ;
                  SWAP } ;
                DUP ; CAR ; SWAP ; CDR ; CDR ;
                { DIP { DIP { DIP { DUP } ; SWAP } ; SWAP } ; SWAP } ;
                { DIP { DIP { DIP { DIP { DIP { DIP { DIP { DUP } ; SWAP } ;
                                                SWAP } ;
                                          SWAP } ;
                                    SWAP } ;
                              SWAP } ;
                        SWAP } ;
                  SWAP } ;
                { CDR ; CAR } ; SUB ; PAIR ; SWAP ; PAIR ; DUP ; CDR ;
                { DIP { DUP } ; SWAP } ; CAR ; PUSH mutez 0 ;
                { DIP { DIP { DIP { DIP { DUP } ; SWAP } ; SWAP } ; SWAP } ;
                  SWAP } ;
                COMPARE ; EQ ;
                IF { NONE (pair mutez mutez) }
                   { { DIP { DIP { DIP { DIP { DUP } ; SWAP } ; SWAP } ;
                             SWAP } ;
                       SWAP } ;
                     { DIP { DIP { DIP { DIP { DIP { DIP { DUP } ; SWAP } ;
                                               SWAP } ;
                                         SWAP } ;
                                   SWAP } ;
                             SWAP } ;
                       SWAP } ;
                     CDR ; SUB ;
                     { DIP { DIP { DIP { DIP { DUP } ; SWAP } ; SWAP } ;
                             SWAP } ;
                       SWAP } ;
                     PAIR ; SOME } ;
                { DIP { DIP { DIP { DROP ; DROP ; DROP ; DROP } } } } ;
                { DIP { DIP { DIP { DIP { DROP ; DROP } } } } } ;
                { DIP { DIP { DIP { DUP } ; SWAP } ; SWAP } ; SWAP } ;
                { DIP { DIP { DIP { DIP { DROP } } } } } ; UPDATE ; PAIR ;
                NIL operation ; PAIR }
              { { DIP { DIP { DUP } ; SWAP } ; SWAP } ; DUP ; DUP ;
                { CDR ; CDR ; CDR ; CDR ; CDR ; CDR ; CAR } ; SENDER ;
                COMPARE ; EQ ; DUP ; NOT ;
                IF { UNIT ; FAILWITH } { UNIT } ; DIP { DROP ; DROP } ;
                DROP ; PUSH mutez 0 ; AMOUNT ; COMPARE ; EQ ; DUP ; NOT ;
                IF { UNIT ; FAILWITH } { UNIT } ; DIP { DROP } ; DROP ;
                DUP ; CAR ; SWAP ; CDR ; DUP ; CAR ; SWAP ; CDR ; DUP ;
                CAR ; SWAP ; CDR ; CDR ;
                { DIP { DIP { DIP { DIP { DUP } ; SWAP } ; SWAP } ; SWAP } ;
                  SWAP } ;
                { DIP { DIP { DIP { DIP { DIP { DROP } } } } } } ; SOME ;
                PAIR ; SWAP ; PAIR ; SWAP ; PAIR ; SWAP ; PAIR ;
                NIL operation ; PAIR } } } } ;
    DIP { DROP ; DROP } }`


//FAILWITH is not in the grammar    
const ctfive = code_test_five.replace(/[\n\r\t]/g,'');


parser.feed (storage_one)

console.log(util.inspect(parser.results, false, null, true));