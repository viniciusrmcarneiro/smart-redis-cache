const Redis = require("ioredis");
const express = require("express");
const mongo = require("./mongo");
const app = express();
const _config = require("./config")(process.env);
const userRoutes = require("./routes/user-routes");

const main = () => {
    return mongo
        .createTableCli(
            Object.assign({}, _config.mongodb.connObj, { tableName: "users" })
        )
        .then((userTable) => {
            const redisConn = new Redis(_config.redis.connObj);
            const userCrud = require("./user-crud")(userTable);
            const cache = require("smart-redis-cache/src/cache-redis")(
                redisConn
            );

            const { read, update, remove } = require("./user-cached")({
                userCrud,
                cache,
            });

            app.use(
                userRoutes.create({
                    update,
                    create: userCrud.create,
                    read,
                    remove,
                })
            );
            const server = app.listen(_config.http.port, () =>
                // eslint-disable-next-line no-console
                console.log(`listening on port ${_config.http.port}!`)
            );

            ["SIGTERM", "SIGINT"].forEach((event) =>
                process.on(event, function() {
                    try {
                        // eslint-disable-next-line no-console
                        console.log(`${event}-before`);
                        redisConn.disconnect();
                        userTable.close();
                        server.close();
                        // eslint-disable-next-line no-console
                        console.log(`${event}-after`);
                    } catch (ex) {
                        // eslint-disable-next-line no-console
                        console.error("error", ex);
                    }
                })
            );
        });
};

main().catch((error) => {
    console.error(error);
    process.exit(-1);
});
