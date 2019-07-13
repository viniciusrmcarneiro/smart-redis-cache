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

    it("should create a cacher", () => {
        _target({});
    });

    it("should get the entity from the cache", () => {
        const getter = sinon.stub();
        const keyGetter = sinon.stub();
        const cache = sinon.stub({
            getEntity: () => {},
        });

        const entity = "user";
        const key = "123";
        keyGetter.returns(key);

        const expectedReturn = { name: "123", anything: { other: 1 } };
        cache.getEntity.resolves(expectedReturn);

        return expect(
            _target({ cache, entity, keyGetter, getter })(key)
        ).eventually.become(expectedReturn);
    });

    it("should call getter if returned cache is undefined", () => {
        const getter = sinon.stub();
        const keyGetter = sinon.stub();
        const cache = sinon.stub({
            getEntity: () => {},
            storeEntity: () => {},
        });

        const entity = "user";
        const key = "123";
        keyGetter.returns(key);

        const expectedReturn = { name: "123", anything: { other: 1 } };
        cache.getEntity.resolves(undefined);
        cache.storeEntity.resolves(undefined);

        getter.resolves(expectedReturn);
        return expect(
            _target({ cache, entity, keyGetter, getter })(key)
        ).eventually.become(expectedReturn);
    });

    it("should create cache if entity is not cached", async () => {
        const getter = sinon.stub();
        const keyGetter = sinon.stub();
        const cache = sinon.stub({
            getEntity: () => {},
            storeEntity: () => {},
        });

        const entity = "user";
        const key = "123";
        keyGetter.returns(key);

        const entityValue = { name: "123", anything: { other: 1 } };
        cache.getEntity.resolves(undefined);
        cache.storeEntity.resolves(undefined);

        getter.resolves(entityValue);
        const expectedArg = {
            ttlInMS: undefined,
            entity,
            key,
            data: entityValue,
        };
        await _target({ cache, entity, keyGetter, getter })(key);

        sinon.assert.calledOnce(cache.storeEntity);
        sinon.assert.calledWithExactly(cache.storeEntity, expectedArg);
    });

    it("should return entity value even if storeEntity fails", async () => {
        const getter = sinon.stub();
        const keyGetter = sinon.stub();
        const cache = sinon.stub({
            getEntity: () => {},
            storeEntity: () => {},
        });

        const entity = "user";
        const key = "123";
        keyGetter.returns(key);

        const entityValue = { name: "123", anything: { other: 1 } };
        cache.getEntity.resolves(undefined);
        cache.storeEntity.rejects(new Error("xpto"));

        getter.resolves(entityValue);
        const expectedArg = {
            ttlInMS: undefined,
            entity,
            key,
            data: entityValue,
        };
        await _target({ cache, entity, keyGetter, getter })(key);

        sinon.assert.calledOnce(cache.storeEntity);
        sinon.assert.calledWithExactly(cache.storeEntity, expectedArg);
    });
});
