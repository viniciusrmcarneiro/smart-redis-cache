const { MongoClient, ObjectID } = require("mongodb");

const createTableCli = ({ url, dbName, tableName }) =>
    MongoClient.connect(url).then((client) => {
        const collection = client.db(dbName).collection(tableName);

        return {
            save: (id, values) => {
                const _id = new ObjectID(id);
                return collection.updateOne(
                    { _id },
                    { $set: Object.assign({}, values, { _id }) },
                    { upsert: true }
                );
            },
            getById: (id) => collection.findOne({ _id: new ObjectID(id) }),
            removeById: (id) => collection.remove({ _id: new ObjectID(id) }),
            close: () => client.close(),
        };
    });

module.exports = { createTableCli };
