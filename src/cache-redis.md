# CacheRedis

It is a very low level cache layer. Basically it's gives you the functions: storeEntity and getEntity.

## getEntity

```js
{
    entity: String; // it is the namesapce which the data will be cached
    key: String; // it is the namesapce which the data will be cached
}
```

## storeEntity

```js
{
    entity: String; // it is the namesapce which the data will be cached
    key: String; // it is the namesapce which the data will be cached
    data: Object; // the data that should be cached
}
```

## notifyEntityChanged

mostly it should be called by Whenever an entity's value is changed or deleted. It will publish the change so the entity value is deleted from the cache.

```js
{
    entity: String; // it is the namesapce which the data will be cached
    key: String; // it is the namesapce which the data will be cached
}
```

## Very basic usage of the cache-redis

This example assumes that there is a pg and redis connection established already. For more details take a look at the file **cache-redis.example.js**

```javascript
const Redis = require("ioredis");
const pg = require("pg");
const CacheRedis = require("./cache-redis.js");

const log = (...args) => (data) => {
    console.log(...args, data);
    return data;
};

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
    // creating an user in the table
    const id = await insertUser(pgClient);

    //  getting user from db and caching
    await getUser(pgClient, cache, id);

    // getting user from cache
    return getUser(pgClient, cache, id).then(log("RESULT->"));
};

const main = async (pgClient, redisCli) => {
    const cache = CacheRedis(redisCli);

    await createUserTable(pgClient);
    return insertGetGet(pgClient, cache);
};

["SIGTERM", "SIGINT"].forEach((event) =>
    process.on(event, () => {
        redisCli.disconnect();
        pgClient.end();
    }),
);

return main(pgClient, redisCli)
    .catch(console.error.bind(console, "ERROR->"))
    .then(() => {
        redisCli.disconnect();
        pgClient.end();
    });
```
