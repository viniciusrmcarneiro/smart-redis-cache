const recyclerWorker = ({ cache, queue }) => {
    const subscription = cache.subscribeToEntityChanges({
        queue,
        handler: () => cache.discardEntityByKey({ entity, key }),
    });

    return () => subscription.unsubscribe();
};
