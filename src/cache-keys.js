const storeEntity = redis => ({ ttlInMS, entity, key, data }) => {
    const args = [`entity:${entity}:${key}`, JSON.stringify(data)];
    if (ttlInMS) {
        args.push('PX', typeof ttlInMS == 'function' ? ttlInMS({ key, data }) : ttlInMS);
    }

    return redis.set(...args);
};
const getEntity = redis => ({ key, entity }) => {
    return redis.get(`entity:${entity}:${key}`).then(a => (a ? JSON.parse(a) : undefined));
};

const discardEntityByKey = redis => ({ entity, key }) => {
    return redis.rpush('entity:changed', JSON.stringify({ entity, key })).then(() => {
        return redis.publish(`entity:changed`, entity);
    });
};

const publishChangedEntity = discardEntityByKey;

module.exports = redisCli => ({
    subscribeToEntityChanges: () => {},
    publishChangedEntity: publishChangedEntity(redisCli),
    storeEntity: storeEntity(redisCli),
    getEntity: getEntity(redisCli),
    discardEntityByKey: discardEntityByKey(redisCli),
});
