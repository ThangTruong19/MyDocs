module.exports = function (msg) {
  return {
    status: 500,
    json: {
      error_data: [
        {
          code: 'ERR0001',
          message: typeof msg === 'string' ? msg : 'エラー',
          keys: ['???']
        },
      ],
    },
  };
};
