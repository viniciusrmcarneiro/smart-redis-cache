const recyclerNotifier = ({ cache, entity, keyGetter, modifier }) => (...args) =>
    Promise.resolve(modifier(...args)).then(result => {
        const key = keyGetter(...args);
        return cache
            .publishChangedEntity({ entity, key })
            .then(() => result)
            .catch(err => {
                    console.error('err=>',err);
                return result;
            });
    });

module.exports = recyclerNotifier;
