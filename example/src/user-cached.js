const recyclerNotifier = require('smart-redis-cache/src/recycler-notifier');
const cacher = require('smart-redis-cache/src/cacher');

const _60Minutes = 1000 * 60 * 60;

const keyGetter = (table, { userId }) => userId;


module.exports = ({ userCrud, cache }) => {
    const updateUser = recyclerNotifier({
        cache,
        entity: 'user',
        keyGetter,
        modifier: userCrud.updateUser,
    });

    const getUser = cacher({
        cache,
        entity: 'user',
        ttlInMS: _60Minutes,
        keyGetter,
        getter: userCrud.getUser,
    });
    return Object.assign({}, userCrud, { updateUser, getUser });
};
