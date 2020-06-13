import "mocha";
import { expect } from "chai";

import {ConseilRequestError, ConseilResponseError} from '../../src/types/conseil/ConseilErrorTypes';

describe('ErrorTypes tests', () => {
    it('ConseilRequestError', async () => {
        const error = new ConseilRequestError(404, 'Not found', 'https://conseil.server', null);

        expect(error.httpStatus).to.equal(404);
    });

    it('ConseilResponseError', async () => {
        const error = new ConseilResponseError(501, 'Not implemented', 'https://conseil.server', null, null);

        expect(error.httpStatus).to.equal(501);
    });
});
