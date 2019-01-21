const Redis = require("ioredis");
const express = require("express");
const mongo = require("./mongo");
const app = express();
const _config = require("./config")(process.env);
const userRoutes = require("./routes/user-routes");

mongo
    .createTableCli(
        Object.assign({}, _config.mongodb.connObj, { tableName: "users" })
    )
    .then((userTable) => {
        const userCrud = require("./user-crud");
        const cache = require("smart-redis-cache/src/cache")(
            new Redis(_config.redis.connObj)
        );
        const { getUser, updateUser, createUser } = require("./user-cached")({
            userCrud,
            cache,
        });

        const update = updateUser.bind(null, userTable);
        const create = createUser.bind(null, userTable);
        const read = getUser.bind(null, userTable);

        app.use(userRoutes.create({ update, create, read }));
    });

const server = app.listen(_config.http.port, () =>
    console.log(`listening on port ${_config.http.port}!`)
);

["SIGTERM", "SIGINT"].forEach((event) =>
    process.on(event, function() {
        try {
            console.log(`${event}-before`);
            server.close();
            console.log(`${event}-after`);
        } catch (ex) {
            console.erro("error", ex);
        }
    })
);
