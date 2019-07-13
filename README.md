# smart-redis-cache

[![Codacy Badge](https://api.codacy.com/project/badge/Grade/221cc589e1a14275ae9a8e904844d968)](https://app.codacy.com/app/viniciusrmcarneiro/smart-redis-cache?utm_source=github.com&utm_medium=referral&utm_content=viniciusrmcarneiro/smart-redis-cache&utm_campaign=Badge_Grade_Dashboard)

## Examples

-   [How to use CacheRedis](src/cache-redis.md)

```bash
        docker-compose run --rm cache-redis-example
```
### how to run load test

./dc integration-test up redis mongo
./dc integration-test scale app=1 worker=1
./dc load-test run --rm load-test
