var _ = require('lodash');

module.exports = function(args) {
  var responses = [];

  if (_.isArray(args.query.car)) {
    _.each(args.query.car, (car, index) => {
      responses.push(responseBody(index, car));
    });
  } else {
    responses.push(responseBody(1, args.query.car));
  }

  return success(responses);
};

function responseBody(index, car) {
  var type = _.random(0, 1);
  if (type === 0) {
    return {
      request: {
        car: car,
      },
      result_data: {
        car_id: car.split(',')[0],
      },
    };
  } else {
    return {
      request: {
        car: car,
      },
      error_data: [
        {
          code: 'E00000',
          message: '機種の形式に誤りがあります。',
          keys: [],
        },
      ],
    };
  }
}

function success(data) {
  return {
    status: 207,
    json: {
      responses: data,
    },
  };
}
