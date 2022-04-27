var _ = require('lodash');

module.exports = function(args) {
  var responses = [];
  _.each(args.body.car_ids, (car_id, index) => {
    var type = _.random(0, 1);
    if (type === 0) {
      responses.push({
        result_data: {
          request_keys: ['ABC123456' + index],
          car_id: car_id,
        },
      });
    } else {
      responses.push({
        error_data: [
          {
            code: 'E00000',
            message: '{{operator_codes}}が不正です。',
            keys: ['operator_codes'],
          },
          {
            code: 'E00000',
            message: '{{operator_labels}}が不正です。',
            keys: ['operator_labels'],
          },
        ],
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
