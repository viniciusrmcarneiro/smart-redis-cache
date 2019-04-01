const { recyclerNotifier } = require("smart-redis-cache/src/recycler-notifier");
const cacher = require("smart-redis-cache/src/cacher");

const _60Minutes = 1000 * 60 * 60;

const keyGetter = ({ userId }) => userId;

module.exports = ({ userCrud, cache }) => {
    const update = recyclerNotifier({
        cache,
        entity: "user",
        keyGetter,
        modifier: userCrud.update,
    });

    const remove = recyclerNotifier({
        cache,
        entity: "user",
        keyGetter,
        modifier: userCrud.delete,
    });

    const read = cacher({
        cache,
        entity: "user",
        ttlInMS: _60Minutes,
        keyGetter,
        getter: userCrud.read,
    });
    return { update, read, remove };
};
