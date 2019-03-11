"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var OperationKindType;
(function (OperationKindType) {
    OperationKindType["SeedNonceRevelation"] = "seed_nonce_revelation";
    OperationKindType["Delegation"] = "delegation";
    OperationKindType["Transaction"] = "transaction";
    OperationKindType["AccountActivation"] = "activate_account";
    OperationKindType["Origination"] = "origination";
    OperationKindType["Reveal"] = "reveal";
    OperationKindType["Endorsement"] = "endorsement";
    OperationKindType["Ballot"] = "ballot";
})(OperationKindType = exports.OperationKindType || (exports.OperationKindType = {}));
var BallotVote;
(function (BallotVote) {
    BallotVote[BallotVote["Yay"] = 0] = "Yay";
    BallotVote[BallotVote["Nay"] = 1] = "Nay";
    BallotVote[BallotVote["Pass"] = 2] = "Pass";
})(BallotVote = exports.BallotVote || (exports.BallotVote = {}));
//# sourceMappingURL=TezosChainTypes.js.map