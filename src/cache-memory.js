const _cache = {};
const subscribeToEntityChanges = () => {};
const storeEntity = ({ key, data, entity }) => {
    console.log('storeEntity', { key, data });
    _cache[key] = data;
    return Promise.resolve();
};
const getEntity = ({ key, entity }) => {
    const r = _cache[key];
    console.log('getEntity', { key, entity, r });

    return Promise.resolve(r);
};
const discardEntityByKey = ({ entity, key }) => {
    const r = _cache[key];
    delete _cache[key];
    console.log('discardEntityByKey', { r, _cache: _cache[key] });
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
