var _ = require('lodash');

module.exports = function(args) {
  var responses = [];

  if (_.isArray(args.body.cars)) {
    _.each(args.body.cars, (car, index) => {
      responses.push(responseBody(index));
    });
  } else {
    responses.push(responseBody(1));
  }

  return success(responses);
};

function responseBody(index) {
  var type = _.random(0, 1);
  if (type === 0) {
    return {
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
          status_name: '申請中',
          status: '1',
          id: '1',
        },
      },
    };
  } else {
    return {
      error_data: [
        {
          keys: ['cars.change_support_distributor_id'],
          message: '{{cars.change_support_distributor_id}}の入力が不正です。',
          code: 'COM0002E',
        },
        {
          keys: [],
          message: '機種の入力が不正です。',
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
