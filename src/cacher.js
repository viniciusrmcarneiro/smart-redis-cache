const cacher = ({ cache, ttlInMS, entity, keyGetter, getter }) => (...args) => {
    const key = keyGetter(...args);

    return cache.getEntity({ entity, key }).then(cachedData => {
        if (cachedData !== undefined) {
            return cachedData;
        }

        return Promise.resolve(getter(...args)).then(data =>
            cache
                .storeEntity({ ttlInMS, entity, key, data })
                .then(() => data)
                .catch(err => {
                    console.error('err=>', err);
                    return data;
                })
        );
    });
};
module.exports = cacher;
