var validation = require('../../common/validation.js');

module.exports = function(args) {
  var errorData = validation(args.body);
  if (errorData.length > 0) {
    return fail(errorData);
  }

  var data = {
    result_data: {
      smr_interval_item: {
        support_distributor_id: '17',
        support_distributor_label: 'コマツ東京C',
        support_distributor_label_english: 'KOMATSU Tokyo C',
        id: '11',
        label: '1000時間点検',
        inspection_start_smr: '500',
        smr_interval: '1000',
        smr_interval_kind: '1',
        threshold: '-50',
        threshold_kind: '1',
        target_model_kind: '1',
        update_datetime: '2017-05-23T23:59:59.999Z',
        car_conditions: [
          {
            type_rev: 'A12345M0',
            model: 'SK714',
            division_name: '油圧ショベル',
            division_code: '0001',
            maker_name: 'コマツ',
            maker_code: '0001',
          },
        ],
      },
    },
  };

  return success(data);
};

function success(data) {
  return {
    status: 200,
    json: {
      result_data: data.result_data,
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
