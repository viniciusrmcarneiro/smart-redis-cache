const fs = require("fs");
const path = require("path");

module.exports = (env) => {
    const http = {
        certs: {
            key: fs.readFileSync(path.join(__dirname, "../server.key")),
            cert: fs.readFileSync(path.join(__dirname, "../server.crt")),
        },
        port: env.PORT || 8000,
    };
    const redis = {
        connObj: {
            port: 6379,
            host: env.REDIS_SERVER,
            family: 4,
            db: 0,
        },
    };

    const mongodb = {
        connObj: {
            url: `mongodb://${env.MONGO_SERVER}:27017`,
            dbName: "redis-cache-test",
        },
    };

    return {
        http,
        redis,
        mongodb,
    };
};
