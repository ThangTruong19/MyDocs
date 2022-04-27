const timeout = (timer = 0): Promise<void> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(null);
        }, timer);
    });
};

export default timeout;
