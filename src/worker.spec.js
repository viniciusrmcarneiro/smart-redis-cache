const sinon = require("sinon");
const chai = require("chai");

chai.use(require("chai-as-promised"));
require("chai").should();
const expect = chai.expect;
const path = require("path");

const __targetFileName = __filename.replace(/\.spec\.js$/, ".js");
const __targetRelativePath = path.relative(process.cwd(), __targetFileName);
const _wait = (t) => new Promise((r) => setTimeout(r, t));

describe(`#${__targetRelativePath}`, () => {
    const _target = require(__targetFileName);
    const sandbox = sinon.createSandbox();
    const redisCliStub = sandbox.stub({ blpop: () => {}, del: () => {} });

    beforeEach(() => {
        sandbox.reset();
    });

    it("should export an function", () => {
        expect(_target).to.be.a("function");
    });

    it("should delete first item when it starts", async () => {
        const expectedKey = "entity:user:1";
        redisCliStub.blpop
            .onFirstCall()
            .resolves([
                undefined,
                JSON.stringify({ entity: "user", key: "1" }),
            ]);

        const shouldDoNext = sandbox.stub();
        shouldDoNext.onSecondCall().returns(false);

        const worker = _target({ redis: redisCliStub, shouldDoNext });
        await worker.finish();

        sinon.assert.calledOnce(redisCliStub.del);
        sinon.assert.calledWithExactly(redisCliStub.del, expectedKey);
    });

    it("should delete all items when it starts", async () => {
        const keys = ["1", "2", "3"];
        const expectedKeys = keys.map((key) => `entity:user:${key}`);

        const shouldDoNext = sandbox.stub();
        keys.forEach((key, index, list) => {
            redisCliStub.blpop
                .onCall(index)
                .resolves([undefined, JSON.stringify({ entity: "user", key })]);
            shouldDoNext.onCall(index).returns(index < list.length - 1);
        });

        const worker = _target({ redis: redisCliStub, shouldDoNext });
        await worker.finish();

        sinon.assert.calledThrice(redisCliStub.del);
        expectedKeys.forEach((expectedKey, index) => {
            sinon.assert.calledWithExactly(
                redisCliStub.del.getCalls()[index],
                expectedKey
            );
        });
    });

    it("should not throw when pop resolves undefined", async () => {
        redisCliStub.blpop.onFirstCall().resolves(undefined);

        const shouldDoNext = sandbox.stub();
        shouldDoNext.onSecondCall().returns(false);

        const worker = _target({ redis: redisCliStub, shouldDoNext });
        await worker.finish();

        sinon.assert.notCalled(redisCliStub.del);
    });

    it("should not throw when pop resolves a non array", async () => {
        redisCliStub.blpop.onFirstCall().resolves("test");

        const shouldDoNext = sandbox.stub();
        shouldDoNext.onSecondCall().returns(false);

        const worker = _target({ redis: redisCliStub, shouldDoNext });
        await worker.finish();

        sinon.assert.notCalled(redisCliStub.del);
    });

    it("should not throw when pop resolves an array length 1", async () => {
        const shouldDoNext = sandbox.stub();
        const redis = {
            blpop: sandbox.spy(() => _wait(2).then(() => ["test"])),
        };

        shouldDoNext.returns(true);

        const worker = _target({
            redis,
            shouldDoNext,
        });

        await _wait(6);

        worker.stop();

        await worker.finish();

        expect(redis.blpop.getCalls().length).greaterThan(2);

    });

    it("should not throw when pop resolves undefined", async () => {
        redisCliStub.blpop.onFirstCall().resolves([undefined, undefined]);

        const shouldDoNext = sandbox.stub();
        shouldDoNext.onSecondCall().returns(false);

        const worker = _target({ redis: redisCliStub, shouldDoNext });
        await worker.finish();

        sinon.assert.notCalled(redisCliStub.del);
    });

    it("should support stop", async () => {
        const shouldDoNext = sandbox.stub();
        const redis = {
            blpop: sandbox.spy(() => _wait(2)),
        };

        shouldDoNext.returns(true);

        const worker = _target({
            redis,
            shouldDoNext,
        });

        await _wait(6);

        worker.stop();

        await worker.finish();

        expect(redis.blpop.getCalls().length).greaterThan(2);
    });
});
