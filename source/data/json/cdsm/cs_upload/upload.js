module.exports = function(args) {
  var data = [];
  var mock;
  var hasError;

  hasError = Math.random() < 0.5;
  for (var i = 1; i <= 10; i++) {
    mock = {};

    if (hasError) {
      mock = {
        // error_data: [
        //   {
        //     code: 'COM0002E',
        //     message: 'オペレータIDの形式に誤りがあります',
        //     keys: ['operators.code'],
        //   },
        //   {
        //     code: 'COM0002E',
        //     message: 'オペレータ名の形式に誤りがあります',
        //     keys: ['operators.current_label.label'],
        //   },
        // ],
        request: {
          // operator: {
          //   update_datetime: '2017-05-22T23:59:59.999Z',
          //   current_label: {
          //     label: '小松次郎' + i,
          //   },
          //   code: 'F0-F0-' + i,
          //   id: '2',
          // },
          // customer_label: '顧客_' + i,
          // customer_id: '60' + i,
          // line_no: String(i + 1),
          response_code: '400',
          error_msg: '[ACOM00' + (i % 10) + ']' + i + '行目、機種野形式に誤りがあります。' ,
        },
      };
    } else {
      mock = {
        // result_data: {
        //   operator: {
        //     id: '' + i,
        //     code: '12345678' + i,
        //     current_label: {
        //       id: '' + i,
        //       label: 'オペレータ' + i,
        //       start_datetime: '2017/05/23 00:00:00',
        //       end_datetime: null,
        //     },
        //     label_histories: [
        //       {
        //         id: '' + i,
        //         label: 'オペレータ' + i,
        //         start_datetime: '2017/05/23 00:00:00',
        //         end_datetime: null,
        //       },
        //     ],
        //     update_datetime: '2017-05-23T23:59:59.999Z',
        //   },
        // },
        request: {
          // operator: {
          //   update_datetime: '2017-05-22T23:59:59.999Z',
          //   current_label: {
          //     label: '小松太郎' + i,
          //   },
          //   code: 'FF-FF-' + i,
          //   id: '1',
          // },
          // customer_label: '顧客_' + i,
          // customer_id: '60' + i,
          // line_no: String(i + 1),
          response_code: '200',
          change_type: Math.random() < 0.3 ? '変更': '削除',
          brand: 'コマツ',
          type: 'PC20' + i % 10,
          model: Math.random() < 0.2 ? '10': '11',
          serial_number: 'XXX' + i % 10,
          customize_usage_definition_label: Math.random() < 0.7 ? 'KOMTRAX標準': 'オペレーション分析',
          version: Math.random() < 0.2 ? 'Ver1': (Math.random() < 0.8 ? 'Ver2' : 'Ver3'),
          priority: Math.random() < 0.7 ? '中': '低',
          start_day: '2022/11/15',
          end_day: '2022/12/31',
          time_before_effect: Math.random() < 0.7 ? '即時': '通常',
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
