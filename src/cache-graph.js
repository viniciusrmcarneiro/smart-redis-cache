const RedisGraph = require("redisgraph.js/src/redisGraph.js");

const replaceDtoS = (s) => `'${s}'`;
const storeEntity = (graph) => ({ key, data, entity }) => {
    // return getEntity(graph)({ key, entity }).then(cached => {
    //     if (!cached) {
    const create = `MERGE (:${entity} { _key: '${key}', ${Object.entries(data)
        .map(([key, value]) => `${key} : ${replaceDtoS(JSON.stringify(value))}`)
        .join(",")}})`;
    return graph.query(create);
    // }
    // });
};
const toJSON = (keys, values) =>
    values
        .map((v, i) => [keys[i].split(".")[1], v])
        .filter(([k, value]) => value !== "NULL" && k !== "_key")
        .reduce((a, [k, v]) => {
            return Object.assign(a, { [k]: JSON.parse(v) });
        }, {});

const getEntity = (graph) => ({ key, entity }) => {
    return graph
        .query(`MATCH (obj:${entity}) WHERE obj._key = '${key}' RETURN obj`)
        .then((res) => res.next())
        .then((obj) =>
            obj !== undefined ? toJSON(obj.keys(), obj.values()) : undefined
        )
        .catch((err) => {
            if (err.message === "key doesn't contains a graph object.") {
                return undefined;
            }
            throw err;
        });
};

const discardEntityByKey = (graph) => ({ entity, key }) => {
    graph.ke;
    return getEntity(graph)({ key, entity }).then((cached) => {
        if (cached) {
            return graph.query(
                `MATCH (obj:${entity}) WHERE obj._key = '${key}' DELETE obj`
            );
        }
    });
};

const publishChangedEntity = discardEntityByKey;
const graph = new RedisGraph("cache-vinny", {
    host: process.env.REDIS_SERVER,
    port: 6379,
});
module.exports = {
    subscribeToEntityChanges: () => {},
    publishChangedEntity: publishChangedEntity(graph),
    storeEntity: storeEntity(graph),
    getEntity: getEntity(graph),
    discardEntityByKey: discardEntityByKey(graph),
};
