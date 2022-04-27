module.exports = function(resource, data) {
  var result_data = {};
  result_data[resource] = [];

  return {
    status: 200,
    json: {
      result_data: result_data,
    },
    header: {
      'X-From': 1,
      'X-Count': 0,
      'X-Sort': data.result_header['X-Sort'],
      'X-TotalCount': 0,
      'Cache-Control': 'no-cache',
    },
  };
};
