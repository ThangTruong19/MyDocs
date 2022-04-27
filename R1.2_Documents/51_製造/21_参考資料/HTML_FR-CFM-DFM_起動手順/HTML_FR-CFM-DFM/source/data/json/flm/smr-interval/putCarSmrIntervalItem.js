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
          maker_name: 'コマツ',
          division_id: '1',
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
          update_datetime: '2017-05-23T23:59:59.999Z',
        },
        smr_interval_item: {
          id: '11',
          label: '1000時間点検',
          management_kind: '1',
          management_label: '管理する',
          inspection_start_smr: '500',
          smr_interval: '990',
          smr_interval_kind: '1',
          threshold: '-50',
          threshold_kind: '1',
          update_datetime: '2017-05-24T23:59:59.999Z',
        },
      },
    },
  };
  var error = {
    error_data: [
      {
        code: 'COM0002E',
        message:
          '{{car.smr_interval_items.smr_interval}}のリクエスト情報が不正です。',
        keys: ['car.smr_interval_items.smr_interval'],
      },
      {
        code: 'COM0002E',
        message:
          '{{car.smr_interval_items.threshold}}のリクエスト情報が不正です。',
        keys: ['car.smr_interval_items.threshold'],
      },
    ],
  };

  var limit = args.body.car ? args.body.car.smr_interval_items.length : 0;

  for (var i = 1; i <= (args.body.car.smr_interval_items.length || 0); i++) {
    data.responses.push(Math.random() < 0.5 ? success : error);
  }

  return done(data);

  // return {
  //   status: 207,
  //   json: data
  // };
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
