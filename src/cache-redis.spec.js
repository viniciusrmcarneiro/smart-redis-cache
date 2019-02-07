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

    it("should create a backend", () => {
        const backend = _target({});
        expect(backend).to.have.keys(
            "storeEntity",
            "getEntity",
            "notifyEntityChanged",
        );
    });

    describe("storeEntity", () => {
        it("should compose the key", () => {
            const redisCli = sinon.stub({ set: () => {} });
            const backend = _target(redisCli);
            const entity = "user";
            const key = "123";
            const expectedKey = "entity:user:123";
            backend.storeEntity({ entity, key, data: "" });

            sinon.assert.calledOnce(redisCli.set);

            expect(redisCli.set.getCall(0).args[0]).to.be.equal(
                expectedKey,
            );
        });

        it("should save stringifyed data in redis ", async () => {
            const redisCli = sinon.stub({ set: () => {} });
            const backend = _target(redisCli);
            const entity = "user";
            const key = "123";
            const data = { anything: 1 };
            const expectedData = '{"anything":1}';
            redisCli.set.resolves({ ok: 1 });
            await backend.storeEntity({ entity, key, data });

            sinon.assert.calledOnce(redisCli.set);

            expect(redisCli.set.getCall(0).args[1]).to.be.equal(
                expectedData,
            );
        });

        it("should set tll when it's a constant", async () => {
            const redisCli = sinon.stub({ set: () => {} });
            const backend = _target(redisCli);
            const entity = "user";
            const key = "123";
            const data = "";
            const ttlInMS = 60000;
            redisCli.set.resolves({ ok: 1 });

            await backend.storeEntity({
                entity,
                key,
                data,
                ttlInMS,
            });
            sinon.assert.calledOnce(redisCli.set);
            expect(redisCli.set.getCall(0).args.slice(2)).to.be.deep.equal([
                "PX",
                ttlInMS,
            ]);
        });

        it("should set tll when it's a function", async () => {
            const redisCli = sinon.stub({ set: () => {} });
            const backend = _target(redisCli);
            const entity = "user";
            const key = "123";
            const data = "";
            const ttlInMS = sinon.spy(() => 30);

            await backend.storeEntity({
                entity,
                key,
                data,
                ttlInMS,
            });
            expect(redisCli.set.getCall(0).args.slice(2)).to.be.deep.equal([
                "PX",
                30,
            ]);
        });
        it("should call ttl function with [key and data]", async () => {
            const redisCli = sinon.stub({ set: () => {} });
            const backend = _target(redisCli);
            const entity = "user";
            const key = "123";
            const data = "any0data";
            const ttlInMS = sinon.spy(() => 30);

            await backend.storeEntity({
                entity,
                key,
                data,
                ttlInMS,
            });
            sinon.assert.calledOnce(ttlInMS);
            sinon.assert.calledWithExactly(ttlInMS, {
                data,
                key,
            });
        });
    });

    describe("getEntity", () => {
        it("should compose the key", async () => {
            const redisCli = sinon.stub({ get: () => {} });
            const backend = _target(redisCli);
            const entity = "user";
            const key = "123";
            const expectedKey = "entity:user:123";

            redisCli.get.resolves();

            await backend.getEntity({ entity, key });

            sinon.assert.calledOnce(redisCli.get);
            sinon.assert.calledWithExactly(redisCli.get, expectedKey);
        });

        it("should return a parsed object when it exists", () => {
            const redisCli = sinon.stub({ get: () => {} });
            const backend = _target(redisCli);
            const entity = "user";
            const key = "123";
            const expectedResult = { a: 1 };
            redisCli.get.resolves(`{"a":1}`);

            return backend
                .getEntity({ entity, key })
                .should.eventually.become(expectedResult);
        });

        it("should return undefined when it doesn't exist", () => {
            const redisCli = sinon.stub({ get: () => {} });
            const backend = _target(redisCli);
            const entity = "user";
            const key = "123";
            const expectedResult = undefined;
            redisCli.get.resolves(undefined);

            return backend
                .getEntity({ entity, key })
                .should.eventually.become(expectedResult);
        });
    });

    describe("notifyEntityChanged", () => {
        it("should add entity to be notifyEntityChanged in the entity:changed list", async () => {
            const redisCli = sinon.stub({ rpush: () => {} });
            const backend = _target(redisCli);
            const entity = "user";
            const key = "123";
            const expectedData = `{"entity":"user","key":"123"}`;
            backend.notifyEntityChanged({ entity, key });

            sinon.assert.calledOnce(redisCli.rpush);
            sinon.assert.calledWithExactly(redisCli.rpush, "entity:changed", expectedData);
        });
    });
});
