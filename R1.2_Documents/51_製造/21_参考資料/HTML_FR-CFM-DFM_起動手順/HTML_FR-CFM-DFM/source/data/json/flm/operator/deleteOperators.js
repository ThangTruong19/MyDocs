var _ = require('lodash');

module.exports = function(args) {
  var responses = [];

  if (_.isArray(args.query.operator)) {
    _.each(args.query.operator, (operator, index) => {
      responses.push(responseBody(index, operator));
    });
  } else {
    responses.push(responseBody(1, args.query.operator));
  }

  return success(responses);
};

function responseBody(index, operator) {
  var type = _.random(0, 1);
  if (type === 0) {
    return {
      result_data: {
        operator_id: String(index),
      },
      request: {
        operator: operator,
      },
    };
  } else {
    return {
      error_data: [
        {
          code: 'E00000',
          message: 'オペレータIDが不正です。',
          keys: [],
        },
        {
          code: 'E00001',
          message: 'オペレータラベルが不正です。',
          keys: [],
        },
      ],
      request: {
        operator: operator,
      },
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
