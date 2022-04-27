var _ = require('lodash');

module.exports = function (args) {
  var responses = [];
  _.each(args.body.id_keys, (id_key, index) => {
    var type = _.random(0, 1);
    if (type === 0) {
      responses.push({
        result_data: {
          id_key: {
            id: String(index),
            code: 'FFFFFF',
            current_operator: {
              id: String(index),
              code: '12345678',
              current_label: {
                id: '1',
                label: '小松 太郎',
                start_datetime: '2017/05/23 00:00:00',
                end_datetime: null,
              },
              update_datetime: '2017-05-23T23:59:59.999Z',
              start_datetime: '2017/05/23 00:00:00',
              end_datetime: '2017/05/23 00:00:00',
            },
            operator_histories: [
              {
                id: String(index),
                code: '12345678',
                current_label: {
                  id: String(index),
                  label: '小松 太郎',
                  start_datetime: '2017/05/23 00:00:00',
                  end_datetime: null,
                },
                update_datetime: '2017-05-23T23:59:59.999Z',
                start_datetime: '2017/05/23 00:00:00',
                end_datetime: '2017/05/23 00:00:00',
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
            code: "E00000",
            message: "{{id_keys.current_operator.code}}の形式に誤りがあります。",
            keys: []
          },
          {
            code: "E00000",
            message: "{{id_keys.current_operator.label}}の形式に誤りがあります。",
            keys: []
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
