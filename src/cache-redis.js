const storeEntity = (redis) => ({ ttlInMS, entity, key, data }) => {
    const args = [`entity:${entity}:${key}`, JSON.stringify(data)];
    if (ttlInMS) {
        args.push(
            "PX",
            typeof ttlInMS == "function" ? ttlInMS({ key, data }) : ttlInMS,
        );
    }

    return redis.set(...args);
};
const getEntity = (redis) => ({ key, entity }) => {
    return redis
        .get(`entity:${entity}:${key}`)
        .then((a) => (a ? JSON.parse(a) : undefined));
};

const notifyEntityChanged = (redis) => ({ entity, key }) => {
    return redis.rpush("entity:changed", JSON.stringify({ entity, key }));
};

module.exports = (redisCli) => ({
    storeEntity: storeEntity(redisCli),
    getEntity: getEntity(redisCli),
    notifyEntityChanged: notifyEntityChanged(redisCli),
});
