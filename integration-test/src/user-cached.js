const recyclerNotifier = require("smart-redis-cache/src/recycler-notifier");
const cacher = require("smart-redis-cache/src/cacher");

const _60Minutes = 1000 * 60 * 60;

const keyGetter = (table, { userId }) => userId;

module.exports = ({ crud, cache }) => {
    const update = recyclerNotifier({
        cache,
        entity: "user",
        keyGetter,
        modifier: crud.update,
    });

    const remove = recyclerNotifier({
        cache,
        entity: "user",
        keyGetter,
        modifier: crud.delete,
    });

    const read = cacher({
        cache,
        entity: "user",
        ttlInMS: _60Minutes,
        keyGetter,
        getter: crud.read,
    });
    return { update, read, remove };
};
