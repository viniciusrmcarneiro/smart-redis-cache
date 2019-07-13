module.exports = (env) => {
    const http = {
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
