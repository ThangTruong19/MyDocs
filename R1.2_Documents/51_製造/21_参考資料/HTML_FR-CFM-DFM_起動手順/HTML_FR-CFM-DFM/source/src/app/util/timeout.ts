const timeout = (timer = 0) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, timer);
  });
};

export default timeout;
