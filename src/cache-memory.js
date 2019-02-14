const _cache = {};
const subscribeToEntityChanges = () => {};
const storeEntity = ({ key, data }) => {
    _cache[key] = data;
    return Promise.resolve();
};
const getEntity = ({ key }) => {
    const r = _cache[key];

    return Promise.resolve(r);
};
const discardEntityByKey = ({ key }) => {
    delete _cache[key];
    return Promise.resolve();
};
const publishChangedEntity = discardEntityByKey;

module.exports = {
    subscribeToEntityChanges,
    publishChangedEntity,
    storeEntity,
    getEntity,
    discardEntityByKey,
};
