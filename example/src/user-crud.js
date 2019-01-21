class ErrorUserNotFound extends Error {
    constructor(userId) {
        super(`User ${userId} not found.`);
    }
}

const userExists = (userId) => (user) => {
    if (!user) {
        throw new ErrorUserNotFound(userId);
    }
    return user;
};

const updateUserValues = (values) => (user) => Object.assign({}, user, values);
const saveUser = (table, userId) => (user) => table.save(userId, user);

const getUser = (table, { userId }) => table.getById(userId);

const updateUser = (table, { userId, ...payload }) =>
    getUser(table, { userId })
        .then(userExists(userId))
        .then(updateUserValues(payload))
        .then(saveUser(table, userId));

const createUser = (table, user) => saveUser(table, null)(user);

module.exports = { getUser, updateUser, createUser };
