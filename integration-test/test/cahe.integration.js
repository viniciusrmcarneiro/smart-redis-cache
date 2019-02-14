const chai = require("chai");
const { use, expect } = chai;
use(require("chai-http"));
const Redis = require("ioredis");

describe.skip("test", () => {
    const _HOST = process.env.APP_URL || "${_HOST}";
    let redisCli;
    before(() => {
        redisCli = new Redis({
            port: 6379, // Redis port
            host: process.env.REDIS_SERVER, // Redis host
            family: 4, // 4 (IPv4) or 6 (IPv6)
            db: 0,
        });
    });
    after(() => {
        redisCli.disconnect();
    });

    let id;
    it("create", () => {
        return chai
            .request(`${_HOST}/create/t1`)
            .get("/")
            .then((res) => {
                expect(res).to.have.status(200);
                id = res.body.upserted[0]._id;
            });
    });

    it("read", () => {
        return chai
            .request(`${_HOST}/read/${id}`)
            .get("/")
            .then((res) => {
                expect(res).to.have.status(200);
            });
    });

    it("update", () => {
        const email = `test${new Date().getTime()}j@test.com.au`;
        return chai
            .request(`${_HOST}/update/${id}/${email}`)
            .get("/")
            .then((res) => {
                expect(res).to.have.status(200);
            });
    });

    it("is not cached", () =>
        new Promise((r) => setTimeout(() => r(), 500)).then(() =>
            redisCli.get(`entity:user:${id}`).then((cached) => {
                expect(cached).to.be.null;
            })
        ));
});
