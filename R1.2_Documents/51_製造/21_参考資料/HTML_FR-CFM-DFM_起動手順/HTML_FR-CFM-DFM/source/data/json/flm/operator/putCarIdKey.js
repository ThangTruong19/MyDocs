var _ = require('lodash');

module.exports = function(args) {
  var responses = [];
  _.each(args.body.car_ids, (car_id, index) => {
    var type = _.random(0, 1);
    const data = {};
    data.result_data = {
      request: {
        car_id: car_id,
        request_key: 'ABC123456' + index,
      },
    };

    if (type !== 0) {
      data.error_data = [
        {
          code: 'E00001',
          message: '機番の形式に誤りがあります。',
          keys: [],
        },
      ];
    }
    responses.push(data);
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
