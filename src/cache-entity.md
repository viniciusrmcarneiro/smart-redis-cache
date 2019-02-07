

```javascript
const { CacheRedis } = require('smart-redis-cache');
const Redis = require("ioredis");
const pg = require('pg')


const redisCli = new Redis({
    port: process.env.REDIS_PORT || 6379, // Redis port
    host: process.env.REDIS_HOST || 'localhost', // Redis host
    db: 0,
});
const cache = CacheRedis(redisCli);

const pgClient = new pg.Client()
pgClient.connect({
    user: process.env.PG_USER || 'dbuser',
    host: process.env.PG_HOST || 'database.server.com',
    database: process.env.PG_DB || 'mydb',
    password: process.env.PG_PASSWORD || 'secretpassword',
    port: process.env.PG_PORT || 3211,
})

const getUser = (userId) => {

    const get = (data) => {
        if (data !== undefined){
            return data;
        }

        return pgClient.query(
            `select * from usersAddress where userId = $1::text`,
            [userId]
            ).then( ({ rows }) => 
                cache.store(rows[0]).then( () => rows[0]).catch( () => rows[0] )
            );
    }

    const entity = 'user'
    const key = userId;
    return cache.getEntity({ entity, key })
        .catch(get)
        .then(get);
}


const getUserAddress = (userId, addressId) => {
    const get = (data) => {
        if (data !== undefined){
            return data;
        }

        return pgClient.query(
            `select * from usersAddress where userId = $1::text and addressId = $1::text`, 
            [userId, addressId]
            ).then( ({ rows }) => 
                cache.store(rows[0]).then( () => rows[0]).catch( () => rows[0])
            );
    }

const entity = 'userAddress'
    const key = { userId, addressId };
    return cache.getEntity({ entity, key })
        .catch(get)
        .then(get);
}
```