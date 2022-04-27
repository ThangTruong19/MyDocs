var _ = require('lodash');

module.exports = function(args) {
  var responses = [];

  if (_.isArray(args.body.car_assigns)) {
    args.body.car_assigns.forEach((car_assign, index) => {
      responses.push(responseBody(index));
    });
  } else {
    responses.push(responseBody(1));
  }
  return success(responses);
};

function responseBody(index) {
  var type = _.random(0, 2);

  if (type < 2) {
    const body = {
      result_data: {
        car_assign: {
          car: {
            change_support_distributor: {
              label_english: 'KOMATSU Tokyo C',
              label: 'コマツ東京C',
              id: '3',
            },
            assigned_group: {
              label_english: 'group1',
              label: 'グループ1',
              id: '2',
            },
            car_identification: {
              update_datetime: '2017-05-23T23:59:59.999Z',
              model: 'SK714',
              model_id: '1',
              division_name: 'スキッドステアローダ',
              division_code: '0001',
              division_id: '1',
              maker_name: 'コマツ',
              maker_id: '1',
              id: '1',
              model_type_id: '1',
              type: 'A12345',
              rev: 'M0',
              type_rev: 'A12345M0',
              icon_font_no: '1',
              serial: 'A12345',
              pin: '12345',
              production_date: '2017/05/23',
            },
          },
          update_datetime: '2017-05-23T23:59:59.999Z',
          status_name: '未申請/完了',
          status: '0',
          id: '1',
        },
      },
    };

    if (type === 1) {
      body.result_data.warning_data = [
        {
          "code": "ACAR0590W",
          "message": "代理店変更は完了しましたが、時差設定に失敗しました。時差設定更新要求をおこなってくだい。",
          "keys": [
            "car_id"
          ]
        }
      ];
    }

    return body;
  } else {
    return {
      error_data: [
        {
          keys: [],
          message: '引き当て元グループの入力が不正です。',
          code: 'COM0002E',
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
