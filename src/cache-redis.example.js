const CacheRedis = require("./cache-redis.js");
const Redis = require("ioredis");
const pg = require("pg");

const log = (...args) => (data) => {
    console.log(...args, data);
    return data;
};

const _1_Second = 1000 * 5;
const wait = (ms) => new Promise((r) => setTimeout(() => r(), ms));

const pgCreateClient = (attempts = 0) => {
    const pgClient = new pg.Client({
        user: process.env.POSTGRES_USER,
        host: process.env.POSTGRES_HOST,
        database: process.env.POSTGRES_DB,
        password: process.env.POSTGRES_PASSWORD,
        port: process.env.POSTGRES_PORT || 5432,
    });

    // trying to connect to postgress
    return pgClient
        .connect()
        .then(() => pgClient)
        .catch(async (error) => {
            if (attempts === 0) {
                throw error;
            }
            // waits 5 secs so the database container's initialized
            await wait(_1_Second);

            // trying to connect again
            return pgCreateClient(attempts - 1);
        });
};

const createUserTable = (pgClient) =>
    pgClient.query(
        `CREATE TABLE IF NOT EXISTS public.user (
    id SERIAL, name TEXT not null
);`,
    );

const insertUser = (pgClient) =>
    pgClient
        .query(
            "INSERT INTO public.user (id, name) values (DEFAULT, $1::text) RETURNING id;",
            [new Date().toString()],
        )
        .then((a) => a.rows[0].id)
        .then(log("INSERTED USER ID->"));

const getUser = (pgClient, cache, userId) => {
    const entity = "user";
    const key = userId;

    const get = (data) => {
        if (data !== undefined) {
            log("FROM CACHE")(data);
            return data;
        }

        return pgClient
            .query("select * from public.user where id = $1::int", [userId])
            .then(({ rows }) => rows[0])
            .then((data) =>
                // caching query result
                cache
                    .storeEntity({
                        entity,
                        key,
                        data,
                    })
                    .then(() => data)
                    .catch(() => data),
            )
            .then(log("FROM DB->"));
    };

    return cache
        .getEntity({ entity, key })
        .catch(get)
        .then(get);
};

const insertGetGet = async (pgClient, cache) => {
    // create an user in the table
    const id = await insertUser(pgClient);

    //  getting user from db and caching
    await getUser(pgClient, cache, id);

    // getting user from cache
    return getUser(pgClient, cache, id).then(log("RESULT->"));
};

const main = async (pgClient, cache) => {
    await createUserTable(pgClient);
    return insertGetGet(pgClient, cache);
};

pgCreateClient(5).then((pgClient) => {
    const redisCli = new Redis({
        port: process.env.REDIS_PORT || 6379, // Redis port
        host: process.env.REDIS_HOST, // Redis host
        db: 0,
    });

    ["SIGTERM", "SIGINT"].forEach((event) =>
        process.on(event, () => {
            redisCli.disconnect();
            pgClient.end();
        }),
    );
    const cache = CacheRedis(redisCli);

    return main(pgClient, cache)
        .catch(console.error.bind(console, "ERROR->"))
        .then(() => {
            redisCli.disconnect();
            pgClient.end();
        });
});
