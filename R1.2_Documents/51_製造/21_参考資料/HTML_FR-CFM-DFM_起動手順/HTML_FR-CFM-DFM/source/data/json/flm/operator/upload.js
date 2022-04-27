module.exports = function(args) {
  var data = [];
  var mock;
  var hasError;

  for (var i = 1; i <= 10; i++) {
    mock = {};
    hasError = Math.random() < 0.3;
    if (hasError) {
      mock = {
        error_data: [
          {
            code: 'COM0002E',
            message: 'オペレータIDの形式に誤りがあります',
            keys: ['operators.code'],
          },
          {
            code: 'COM0002E',
            message: 'オペレータ名の形式に誤りがあります',
            keys: ['operators.current_label.label'],
          },
        ],
        request: {
          operator: {
            update_datetime: '2017-05-22T23:59:59.999Z',
            current_label: {
              label: '小松次郎' + i,
            },
            code: 'F0-F0-' + i,
            id: '2',
          },
          customer_label: '顧客_' + i,
          customer_id: '60' + i,
          line_no: String(i + 1),
        },
      };
    } else {
      mock = {
        result_data: {
          operator: {
            id: '' + i,
            code: '12345678' + i,
            current_label: {
              id: '' + i,
              label: 'オペレータ' + i,
              start_datetime: '2017/05/23 00:00:00',
              end_datetime: null,
            },
            label_histories: [
              {
                id: '' + i,
                label: 'オペレータ' + i,
                start_datetime: '2017/05/23 00:00:00',
                end_datetime: null,
              },
            ],
            update_datetime: '2017-05-23T23:59:59.999Z',
          },
        },
        request: {
          operator: {
            update_datetime: '2017-05-22T23:59:59.999Z',
            current_label: {
              label: '小松太郎' + i,
            },
            code: 'FF-FF-' + i,
            id: '1',
          },
          customer_label: '顧客_' + i,
          customer_id: '60' + i,
          line_no: String(i + 1),
        },
      };
    }

    data.push(mock);
  }

  return success(data);
};

function success(data) {
  return {
    status: 207,
    json: {
      responses: data,
    },
  };
}

function fail(msg) {
  return {
    status: 400,
    json: {
      error_data: [
        {
          code: 'ERR0001',
          message: msg,
          key: '???',
        },
      ],
    },
  };
}

function fail500() {
  return {
    status: 500,
    json: {
      error_data: [
        {
          code: 'ACOM0001F',
          message: 'システムエラーが発生しております。',
          keys: [],
        },
      ],
    },
  };
}
