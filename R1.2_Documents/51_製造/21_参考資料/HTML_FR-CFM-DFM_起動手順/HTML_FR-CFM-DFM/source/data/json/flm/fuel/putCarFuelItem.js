module.exports = function(args) {
  var data = {
    responses: [],
  };
  var success = {
    result_data: {
      car: {
        car_identification: {
          id: '1',
          maker_id: '1',
          maker_code: '0001',
          maker_name: 'コマツ',
          division_id: '1',
          division_code: '0001',
          division_name: 'ブルドーザ',
          model_id: '1',
          model: 'D85PX',
          model_type_id: '1',
          type: '15',
          rev: 'E0',
          type_rev: '15E0',
          icon_font_no: '1',
          serial: 'A12345',
          pin: 'KMT0D101CJAA12345',
          production_date: '2017/05/23',
          initial_smr: '100.5',
          update_datetime: '2017-05-23T23:59:59.999Z',
        },
        accumulate_fuel_interval_item: {
          id: '11',
          label: 'エンジンOV',
          management_kind: '1',
          management_name: '管理する',
          inspection_start_accumulate_fuel: '30000',
          accumulate_fuel_interval: '20000',
          accumulate_fuel_interval_kind: '1',
          threshold: '-1000',
          threshold_kind: '1',
          update_datetime: '2017-05-23T23:59:59.999Z',
        },
      },
    },
  };
  var error = {
    error_data: [
      {
        code: 'COM0002E',
        message:
          '{{car.accumulate_fuel_interval_items.accumulate_fuel_interval}}のリクエスト情報が不正です。',
        keys: ['car.accumulate_fuel_interval_items.accumulate_fuel_interval'],
      },
      {
        code: 'COM0002E',
        message:
          '{{car.accumulate_fuel_interval_items.threshold}}のリクエスト情報が不正です。',
        keys: ['car.accumulate_fuel_interval_items.threshold'],
      },
    ],
  };

  var limit = args.body.car
    ? args.body.car.accumulate_fuel_interval_items.length
    : 0;

  for (
    var i = 1;
    i <= (args.body.car.accumulate_fuel_interval_items.length || 0);
    i++
  ) {
    data.responses.push(Math.random() < 0.5 ? success : error);
  }

  return done(data);
};

function done(data) {
  return {
    status: 207,
    json: data,
  };
}

function fail(msgs) {
  return {
    status: 400,
    json: {
      error_data: [
        {
          code: 'COM0002E',
          message: msgs,
          keys: ['car_id'],
        },
      ],
    },
  };
}
