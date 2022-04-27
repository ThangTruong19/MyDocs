var validation = require('../../common/validation.js');

module.exports = function(args) {
  var errorData = validation(args.body);
  if (errorData.length > 0) {
    return fail(errorData);
  }

  var data = {
    accumulate_fuel_interval_item: {
      support_distributor_id: '1000017',
      support_distributor_label: 'コマツ東京C',
      support_distributor_label_english: 'KOMATSU Tokyo C',
      id: '11',
      label: 'エンジンOV',
      inspection_start_accumulate_fuel: 30000,
      accumulate_fuel_interval: 20000,
      accumulate_fuel_interval_kind: '1',
      threshold: -1000,
      threshold_kind: '1',
      target_model_kind: '1',
      update_datetime: '2017-05-23T23:59:59.999Z',
      car_conditions: [
        {
          division_name: '油圧ショベル',
          division_code: '0001',
          maker_name: 'コマツ',
          maker_code: '0001',
          model: 'SK714',
          type_rev: 'A12345M0',
        },
      ],
    },
  };

  return success(data);
  // fail500();
};

function success(data) {
  return {
    status: 200,
    json: {
      result_data: data,
    },
  };
}

function fail(errorData) {
  return {
    status: 400,
    json: {
      error_data: errorData,
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
