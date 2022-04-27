module.exports = function (msg) {
  return new Promise(function (resolve) {
    setTimeout(() => {
      resolve({
        status: 204,
      });
    }, 5000);
  });
}
