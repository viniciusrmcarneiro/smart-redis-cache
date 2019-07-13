const waitOnList = ({ redis, shouldDoNext, onFinish, onReject, timeout = 0 }) =>
    redis
        .blpop("entity:changed", timeout)
        .then(async (data) => {
            console.log({ data });
            if (data && Array.isArray(data) && data.length > 1) {
                const rawPayload = data[1];
                if (rawPayload != undefined) {
                    const payload = JSON.parse(rawPayload);
                    await redis.del(`entity:${payload.entity}:${payload.key}`);
                }
            }
        })
        .then(() => {
            if (!shouldDoNext()) {
                onFinish();
                return;
            }

            return waitOnList({
                redis,
                shouldDoNext,
                onFinish,
                onReject,
            });
        })
        .catch(onReject);

const Worker = ({ redis, shouldDoNext }) => {
    let _stop = false;

    let _resolve, _reject;
    const finish = new Promise((resuolve, reject) => {
        _resolve = resuolve;
        _reject = reject;
    });

    const worker = {
        finish: () => finish,
        stop: () => (_stop = true),
    };

    waitOnList({
        redis,
        shouldDoNext: () => _stop === false && shouldDoNext(),
        onFinish: _resolve,
        onReject: _reject,
    });

    return worker;
};

module.exports = Worker;
