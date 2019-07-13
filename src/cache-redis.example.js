const CacheRedis = require("./cache-redis.js");
const recyclerNotifier = require("./recycler-notifier");
const cacher = require("./cacher");
const Worker = require("./worker");

const Redis = require("ioredis");
const pg = require("pg");

const log = (...args) => (data) => {
    // eslint-disable-next-line no-console
    console.log(...args, data);
    return data;
};

const _1_Second = 1000;
const wait = (ms) => new Promise((resolve) => setTimeout(() => resolve(), ms));

const pgCreateClient = async (attempts = 5) => {
    const pgClient = new pg.Client({
        user: process.env.POSTGRES_USER,
        host: process.env.POSTGRES_HOST,
        database: process.env.POSTGRES_DB,
        password: process.env.POSTGRES_PASSWORD,
        port: process.env.POSTGRES_PORT || 5432,
    });

    // trying to connect to postgress
    try {
        await pgClient.connect();
        return pgClient;
    } catch (error) {
        if (attempts === 0) {
            throw error;
        }
        // waits 5 secs so the database's container initialized
        await wait(_1_Second * 5);

        // trying to connect again
        return pgCreateClient(attempts - 1);
    }
};

const userCrud = {
    insert: (pgClient) =>
        pgClient
            .query(
                "INSERT INTO public.user (id, name) values (DEFAULT, $1::text) RETURNING id;",
                [new Date().toString()]
            )
            .then((a) => a.rows[0].id)
            .then(log("INSERTED USER ID->")),
    read: (pgClient, userId) =>
        pgClient
            .query("select * from public.user where id = $1::int", [userId])
            .then(({ rows }) => rows[0])
            .then(log("USER-DB RETURNED->")),
    update: (pgClient, userId, name) =>
        pgClient
            .query(
                "UPDATE public.user SET name = $2::text where id = $1::int",
                [userId, name]
            )
            .then(() => log("USER UPDATED")()),
};

const testRedisCache = async (pgClient, cache) => {
    const entity = "user";

    const keyGetter = (pgClient, id) => id;

    const id = await userCrud.insert(pgClient);

    const readUser = cacher({
        cache,
        entity,
        keyGetter,
        getter: userCrud.read,
    });

    const updateUser = recyclerNotifier({
        cache,
        entity,
        keyGetter,
        modifier: userCrud.update,
    });

    // getting user from db and caching it
    await readUser(pgClient, id);

    // getting user from cache
    await readUser(pgClient, id).then(log("USER-DB RETURNED -> "));

    // changing user name
    await updateUser(pgClient, id, "new user name");

    // getting user from db and caching it
    await readUser(pgClient, id).then(log("USER-CACHE RETURNED -> "));

    // getting cached user
    await readUser(pgClient, id).then(log("USER-CACHE RETURNED -> "));
};

const main = async () => {
    const pgClient = await pgCreateClient();

    const redisCli = new Redis({
        port: process.env.REDIS_PORT || 6379, // Redis port
        host: process.env.REDIS_HOST, // Redis host
        db: 0,
    });
    const redisCliWorker = new Redis({
        port: process.env.REDIS_PORT || 6379, // Redis port
        host: process.env.REDIS_HOST, // Redis host
        db: 0,
    });

    let _count = 0;
    const shouldDoNext = () => {
        ++_count;
        console.log({ _count });
        return true;
    };
    const worker = Worker({ redis: redisCliWorker, shouldDoNext });

    [("SIGTERM", "SIGINT")].forEach((event) =>
        process.on(event, () => {
            redisCli.disconnect();
            pgClient.end();
        })
    );

    try {
        const cache = CacheRedis(redisCli);

        await pgClient.query(
            "CREATE TABLE IF NOT EXISTS public.user (id SERIAL, name TEXT not null);"
        );

        await testRedisCache(pgClient, cache);
    } finally {
        worker.stop();
        await worker.finish();
        redisCliWorker.disconnect();
        redisCli.disconnect();
        pgClient.end();
    }
};

// eslint-disable-next-line no-console
main().catch(console.error);
