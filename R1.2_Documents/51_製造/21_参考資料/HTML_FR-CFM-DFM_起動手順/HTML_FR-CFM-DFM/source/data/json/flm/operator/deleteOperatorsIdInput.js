var _ = require('lodash');

module.exports = function(args) {
  var responses = [];
  _.each(args.query.car_id, (car_id, index) => {
    var type = _.random(0, 1);
    if (type === 0) {
      responses.push({
        result_data: {
          request_keys: ['ABC123456' + index],
        },
        request: {
          operator_code: args.query.operator_code,
          car_id: car_id,
        },
      });
    } else {
      responses.push({
        error_data: [
          {
            code: 'E00000',
            message: 'メーカの入力が不正です。',
            keys: [],
          },
        ],
        request: {
          operator_code: args.query.operator_code,
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
