/* eslint-disable func-names, prefer-arrow-callback */
/* eslint-env node, mocha */
const chai = require('chai');
const { parseResult } = require('../lib/xmlParsing');

// @see http://support.getcheddar.com/kb/api-8/error-handling#2-the-basics
const embeddedErrorFormat = `
<?xml version="1.0" encoding="UTF-8"?>
<customers>
    <errors>
        <error id="1235" code="422" auxCode="6000">The transaction was declined</error>
    </errors>
    <customer id="foo" code="YOUR_CODE"></customer>
</customers>
`;

describe('#parseResult', function () {
    it('should handle embedded cheddar formats for errors', async function () {
        try {
            await parseResult(embeddedErrorFormat);
            throw new Error('PARSING_SUCCEEDED');
        } catch (err) {
            chai.expect(err.message).to.equal('The transaction was declined');
        }
    });
});

