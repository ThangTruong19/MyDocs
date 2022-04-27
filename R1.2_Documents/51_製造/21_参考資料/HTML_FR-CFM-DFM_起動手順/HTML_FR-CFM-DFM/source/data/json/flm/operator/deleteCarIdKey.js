var _ = require('lodash');

module.exports = function(args) {
  var responses = [];
  _.each(args.query.car_id, (car_id, index) => {
    var type = _.random(0, 1);
    if (type === 0) {
      responses.push({
        result_data: {
          request_key: 'ABC123456' + index,
        },
        request: {
          car_id: car_id,
        },
      });
    } else {
      responses.push({
        error_data: getErrorData(),
        request: {
          car_id: car_id,
        },
      });
    }
  });
  return success(responses);
};

function success(data) {
  return {
    status: 207,
    json: {
      responses: data,
    },
  };
}

function getErrorData() {
  var errors = [];
  var type = _.random(0, 1);
  if (type) {
    errors.push({
      code: 'E00002',
      message: '型式、機番の形式に誤りがあります。',
      keys: [],
    });
  } else {
    errors.push({
      code: 'E00001',
      message: '機種の形式に誤りがあります。',
      keys: [],
    });
  }

  return errors;
}
