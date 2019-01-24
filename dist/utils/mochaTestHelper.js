"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mochaAsync = (fn) => {
    return done => {
        fn.call().then(done, err => {
            done(err);
        });
    };
};
exports.default = mochaAsync;
//# sourceMappingURL=mochaTestHelper.js.map