var _ = require('lodash');

module.exports = function(args) {
  var responses = [];

  if (_.isArray(args.body.cars)) {
    _.each(args.body.cars, (operator, index) => {
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
        request_key: 'f570d731',
        car: {
          car_identification: {
            update_datetime: '2017-05-23T23:59:59.999Z',
            model: 'SK714',
            model_id: '1',
            division_name: 'スキッドステアローダ',
            division_code: '0001',
            division_id: '1',
            maker_name: 'コマツ',
            maker_id: '1',
            id: index.toString(),
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
      },
    };
  } else {
    return {
      error_data: [
        {
          code: 'COM0002E',
          message: '通信種別が不正です。',
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
