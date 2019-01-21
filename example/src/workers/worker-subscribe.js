const Redis = require("ioredis");

const del = (dbCli) =>
    dbCli.lpop("entity:changed").then((rawPayload) => {
        if (!rawPayload) {
            console.log("nothing for lpop ");
            return;
        }

        let payload;

        try {
            payload = JSON.parse(rawPayload);
            console.log({ payload });
            return dbCli.del(`entity:${payload.entity}:${payload.key}`);
        } catch (e) {
            console.error(e);
            console.log({ payload, rawPayload });
        }
    });
const redisConfig = {
    port: 6379, // Redis port
    host: process.env.REDIS_SERVER, // Redis host
    family: 4, // 4 (IPv4) or 6 (IPv6)
    db: 0,
};

const pub = new Redis(redisConfig);
pub.subscribe("entity:changed").then(() => {
    const redisCli = new Redis(redisConfig);

    pub.on("message", (channel, rawPayload) => {
        del(redisCli);
    });

    return del(redisCli);
});
