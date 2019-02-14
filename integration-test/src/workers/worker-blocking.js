const Redis = require("ioredis");

const _RedisConfi = {
    port: 6379, // Redis port
    host: process.env.REDIS_SERVER, // Redis host
    family: 4, // 4 (IPv4) or 6 (IPv6)
    db: 0,
};

const wait = (dbCli) =>
    dbCli
        .blpop("entity:changed", 0)
        .then((data) => {
            if (!data) {
                return;
            }

            const rawPayload = data[1];
            if (!rawPayload) {
                // eslint-disable-next-line no-console
                console.log("nothing for lpop ");
                return;
            }

            let payload;

            try {
                payload = JSON.parse(rawPayload);
                // eslint-disable-next-line no-console
                console.log({ payload });
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error(e);
                // eslint-disable-next-line no-console
                console.log({ payload, rawPayload });
            }
            return dbCli.del(`entity:${payload.entity}:${payload.key}`);
        })
        .then(wait.bind(null, dbCli))
        .catch(wait.bind(null, dbCli));

const main = () => {
    const dbCli = new Redis(_RedisConfi);
    wait(dbCli);
    return () => dbCli.close();
};

const finish = main();

["SIGTERM", "SIGINT"].forEach((event) =>
    process.on(event, function() {
        try {
            // eslint-disable-next-line no-console
            console.log(`${event}-before`);
            finish();
            // eslint-disable-next-line no-console
            console.log(`${event}-after`);
        } catch (ex) {
            // eslint-disable-next-line no-console
            console.erro("error", ex);
        }
    })
);
