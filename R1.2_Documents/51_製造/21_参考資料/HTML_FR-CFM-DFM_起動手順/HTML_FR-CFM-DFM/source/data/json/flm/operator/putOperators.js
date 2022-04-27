var _ = require('lodash');

module.exports = function(args) {
  var responses = [];
  _.each(args.body.operators, (operator, index) => {
    var type = _.random(0, 1);
    if (type === 0) {
      responses.push({
        result_data: {
          operator: {
            id: String(index),
            code: '12345678',
            current_label: {
              id: String(index),
              label: 'オペレータ0001',
              start_datetime: '2017/05/23 00:00:00',
              end_datetime: null,
            },
            label_histories: [
              {
                id: '1',
                label: 'オペレータ0001',
                start_datetime: '2017/05/23 00:00:00',
                end_datetime: null,
              },
            ],
            update_datetime: '2017-05-23T23:59:59.999Z',
          },
        },
      });
    } else {
      responses.push({
        error_data: [
          {
            code: 'E00000',
            message: 'オペレータIDの形式に誤りがあります。',
            keys: [],
          },
          {
            code: 'E00000',
            message:
              '{{operators.current_label.label}}の形式に誤りがあります。',
            keys: ['operators.current_label.label'],
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
