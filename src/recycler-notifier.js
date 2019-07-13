const recyclerNotifier = ({ cache, entity, keyGetter, modifier }) => (
    ...args
) =>
    Promise.resolve(modifier(...args)).then((result) => {
        const key = keyGetter(...args);
        return cache
            .notifyEntityChanged({ entity, key })
            .then(() => result)
            .catch((err) => {
                // eslint-disable-next-line no-console
                console.error("err=>", err);
                return result;
            });
    });

module.exports = recyclerNotifier;
