# smart-redis-cache

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/221cc589e1a14275ae9a8e904844d968)](https://app.codacy.com/app/viniciusrmcarneiro/smart-redis-cache?utm_source=github.com&utm_medium=referral&utm_content=viniciusrmcarneiro/smart-redis-cache&utm_campaign=Badge_Grade_Dashboard)
[![Coverage Status](https://coveralls.io/repos/github/viniciusrmcarneiro/smart-redis-cache/badge.svg)](https://coveralls.io/github/viniciusrmcarneiro/smart-redis-cache)

## Use case

The goal is to cache and expire **entities** on **Redis** as they are created and deleted.

Basically this library offers two functions so you can wrapper your **CRUD** functions.

For *update* and *delete* use `recyclerNotifier` and for *read* use `cacher`.

### creating cache instance
```javascript
const SmartCache = require('smart-redis-cache/src/cache-redis');

const cache = SmartCache(new Redis({ port: 6379, host: 'localhost' }));

const userKeyGetter =  ({ userId }) => userId;
```


### modifiers
when cached is invalidated
```javascript
const recyclerNotifier = require('smart-redis-cache/src/recycler-notifier');
const updateUser = recyclerNotifier({
  cache,
  entity: 'user',
  keyGetter: userKeyGetter,
  modifier: userCrud.update
});

const deleteUser = recyclerNotifier({
  cache,
  entity: 'user',
  keyGetter: userKeyGetter,
  modifier: userCrud.delete
});
```

### readers
just reads either from the source(db) or from redis
```javascript
const cacher = require('smart-redis-cache/src/cacher');
const readUser = cacher({
  cache,
  entity: 'user',
  ttlInMS: 1000 * 60, // cache for one minute
  keyGetter: userKeyGetter,
  getter: userCrud.read
});
```

### usage
from now on you should use your CRUD functions the same way as before.

```javascript
const user = await readUser({ userId: 'user-1'});

await updateUser({ 
  userId: 'user-2',
  name: 'user name',
  email: 'user@email.com'
});


await deleteUser({ userId: 'user-3' });
```
### worker
it's very important to start a **worker**. It's main job is to keep the cache in sync with the changes.
```javascript
    const redisCliWorker = new Redis({
        port: process.env.REDIS_PORT || 6379, // Redis port
        host: process.env.REDIS_HOST, // Redis host
        db: 0,
    });
    const worker = SmartCache.createWorker(redisCliWorker);
```

## Examples
-   [How to use CacheRedis](src/cache-redis.md)

```bash
        docker-compose run --rm cache-redis-example
```
### how to run load test

```bash
./dc integration-test up redis mongo
./dc integration-test scale app=1 worker=1
./dc load-test run --rm load-test
```