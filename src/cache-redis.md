# CacheRedis

It is a very low level cache layer. Basically it exposes two functions storeEntity and getEntity.

## getEntity

```js
{
    entity: String; // it is the namesapce which the data will be cached
    key: String; // id/key of the cached entity
}
```

## storeEntity

```js
{
    entity: String; // it is the namesapce which the data will be cached
    key: String; // id/key of the cached entity
    data: Object; // the data that should be cached
}
```

## notifyEntityChanged

mostly it is called whenever an entity's value is changed or deleted. It will publish the change so the entity cache deleted.

```js
{
    entity: String; // it is the namesapce which the data will be cached
    key: String; // it is the namesapce which the data will be cached
}
```

## Very basic usage of the cache-redis

This example assumes that there is a postegres and redis connection established. For more details take a look at the file **cache-redis.example.js**

```javascript
const CacheRedis = require("./cache-redis.js");
const Redis = require("ioredis");
const pg = require("pg");

const log = (...args) => (data) => {
    console.log(...args, data);
    return data;
};


const createUserTable = (pgClient) =>
    pgClient.query(
        `CREATE TABLE IF NOT EXISTS public.user (
    id SERIAL, name TEXT not null
);`
    );

const insertUser = (pgClient) =>
    pgClient
        .query(
            "INSERT INTO public.user (id, name) values (DEFAULT, $1::text) RETURNING id;",
            [new Date().toString()]
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
                    .catch(() => data)
            )
            .then(log("FROM DB->"));
    };

    return cache
        .getEntity({ entity, key })
        .catch(get)
        .then(get);
};

const main = async (pgClient, cache) => {
    await createUserTable(pgClient);
    const id = await insertUser(pgClient)

    // getting user from db and caching it
    await getUser(pgClient, cache, id);

    // getting user from cache
    return getUser(pgClient, cache, id).then(log("RESULT->"))
};


// connect to the databases
let pgClient, redisCli;

const cache = CacheRedis(redisCli);

["SIGTERM", "SIGINT"].forEach((event) =>
    process.on(event, () => {
        redisCli.disconnect();
        pgClient.end();
    })
);

main(pgClient, cache)
    .catch(console.error.bind(console, "ERROR->"))
    .then(() => {
        redisCli.disconnect();
        pgClient.end();
    })

```
