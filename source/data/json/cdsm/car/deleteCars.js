var _ = require('lodash');

module.exports = function (args) {
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
        car: {
          car_identification: {
            id: String(index),
            maker_id: '1',
            maker_code: '0001',
            maker_name: 'コマツ',
            division_id: '1',
            division_code: '0001',
            division_name: 'スキッドステアローダ',
            model_id: '1',
            model: 'SK714',
            model_type_id: '1',
            type: 'A12345',
            rev: 'M0',
            type_rev: 'A12345M0',
            icon_font_no: '1',
            serial: 'A12345',
            pin: '12345',
            production_date: '2017/05/23',
            initial_smr: '100.5',
            update_datetime: '2017-05-23T23:59:59.999Z',
          },
        },
      },
    };
  } else {
    return {
      request: {
        car: car,
      },
      error_data: [
        {
          code: "E00000",
          message: "指定された{{car}}は存在しません。",
          keys: []
        }
      ]
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
