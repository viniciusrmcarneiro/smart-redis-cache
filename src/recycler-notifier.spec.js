const sinon = require("sinon");
const chai = require("chai");

chai.use(require("chai-as-promised"));
require("chai").should();
const expect = chai.expect;
const path = require("path");

const __targetFileName = __filename.replace(/\.spec\.js$/, ".js");
const __targetRelativePath = path.relative(process.cwd(), __targetFileName);

describe(`#${__targetRelativePath}`, () => {
    const _target = require(__targetFileName);

    it("should export an function", () => {
        expect(_target).to.be.a("function");
    });

    it("should create a recyclerNotifier", () => {
        _target({});
    });

    it("should notify entity changed with the right key", async () => {
        const modifier = sinon.stub();
        const keyGetter = sinon.stub();
        const cache = sinon.stub({
            notifyEntityChanged: () => {},
        });

        const entity = "user";
        const key = "123";
        keyGetter.returns(key);

        const expectedArgs = [{ entity, key }];
        cache.notifyEntityChanged.resolves({});

        await _target({ cache, entity, keyGetter, modifier })(key);

        sinon.assert.calledOnce(cache.notifyEntityChanged);
        sinon.assert.calledWithExactly(
            cache.notifyEntityChanged,
            ...expectedArgs
        );
    });
    it("should return the modifier result", async () => {
        const modifier = sinon.stub();
        const keyGetter = sinon.stub();
        const cache = sinon.stub({
            notifyEntityChanged: () => {},
        });

        const entity = "user";

        const expectedReturn = { name: "xpto", anything: { v: true } };
        cache.notifyEntityChanged.resolves();
        modifier.resolves(expectedReturn);

        const returned = await _target({ cache, entity, keyGetter, modifier })(
            ""
        );
        expect(returned).to.equal(expectedReturn);
    });
});
