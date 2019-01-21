const chai = require('chai');
const { use, expect } = chai;
use(require('chai-http'));
const Redis = require('ioredis');

const create = () =>
    chai
        .request(`http://app:8000/create/t1`)
        .get('/')
        .then(res => res.body.upserted[0]._id);

const read = id =>
    chai
        .request(`http://app:8000/read/${id}`)
        .get('/')
        .then(res => {
            expect(res).to.have.status(200);
            return id;
        });
const update = id => {
    const email = `test${id}j@test.com.au`;
    return chai
        .request(`http://app:8000/update/${id}/${email}`)
        .get('/')
        .then(res => {
            expect(res).to.have.status(200);
            return id;
        });
};

const notCached = redisCli => id =>
    new Promise(r => setTimeout(() => r(), 500)).then(() =>
        redisCli.get(`entity:user:${id}`).then(cached => {
            expect(cached).to.be.null;
        })
    );
const run = total => {
    const redisCli = new Redis({
        port: 6379, // Redis port
        host: process.env.REDIS_SERVER, // Redis host
        family: 4, // 4 (IPv4) or 6 (IPv6)
        db: 0,
    });
    const a = [];
    for (var i = 0; i < total; i++) {
        a.push(
            create()
                .then(read)
                .then(update)
                // .then(notCached(redisCli))
        );
    }

    return Promise.all(a)
        .then(() => redisCli.quit())
        .catch(e => {
            console.log(e);
            redisCli.quit();
        });
};

for (var i = 0; i < 800; i++) {
    run(10);
}

