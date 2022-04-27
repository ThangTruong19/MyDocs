module.exports = function(args) {
  const functions = [];

  const resultData = {
    functions: [],
  };

  return {
    status: 200,
    json: {
      result_data: resultData,
    },
  };
};
