const recyclerNotifier = ({
    cache,
    entity,
    keyGetter,
    modifier,
    logger = { error: () => {} },
}) => (...args) =>
    Promise.resolve(modifier(...args)).then((result) => {
        const key = keyGetter(...args);
        return cache
            .notifyEntityChanged({ entity, key })
            .then(() => result)
            .catch((err) => {
                logger.error("err=>", err);
                return result;
            });
    });

module.exports = recyclerNotifier;
