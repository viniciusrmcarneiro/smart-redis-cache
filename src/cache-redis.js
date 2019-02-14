/**
 * @param {Object} redis
 * @returns {function({ entity: string, key: string, ttlInMS: Number, data: Object }): Promise<Object>}
 */
const storeEntity = (redis) => ({ ttlInMS, entity, key, data }) => {
    const args = [`entity:${entity}:${key}`, JSON.stringify(data)];
    if (ttlInMS) {
        args.push(
            "PX",
            typeof ttlInMS == "function" ? ttlInMS({ key, data }) : ttlInMS
        );
    }

    return redis.set(...args);
};

/**
 * @param {Object} redis
 * @returns {function({ entity: string, key: string }): Promise<Object>}
 */
const getEntity = (redis) => ({ key, entity }) => {
    return redis
        .get(`entity:${entity}:${key}`)
        .then((a) => (a ? JSON.parse(a) : undefined));
};

/**
 * @param {Object} redis
 * @returns {function({ entity: string, key: string }): Promise<void>}
 */
const notifyEntityChanged = (redis) => ({ entity, key }) => {
    return redis.rpush("entity:changed", JSON.stringify({ entity, key }));
};

/**
 * Creates a new instance of CacheRedis.
 * @class
 * @param {object} redis - redis client connected object
 */
const CacheRedis = (redisCli) => ({
    storeEntity: storeEntity(redisCli),
    getEntity: getEntity(redisCli),
    notifyEntityChanged: notifyEntityChanged(redisCli),
});

module.exports = CacheRedis;
