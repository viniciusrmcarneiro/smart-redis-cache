# smart-redis-cache

## Examples

-   [How to use CacheRedis](src/cache-redis.md)

```bash
        docker-compose run --rm cache-redis-example
```
### how to run load test

./dc integration-test up redis mongo
./dc integration-test scale app=1 worker=1
./dc load-test run --rm load-test
