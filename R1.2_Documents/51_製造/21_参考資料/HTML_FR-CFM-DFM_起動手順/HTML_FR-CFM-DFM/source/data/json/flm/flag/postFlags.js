var validation = require('../../common/validation.js');

module.exports = function(args) {
  var errorData = validation(args.body);
  if (errorData.length > 0) {
    return fail(errorData);
  }

  var data = {
    result_data: {
      flag_condition: {
        id: '1',
        flag_code: '5',
        flag_kind_code: '1',
        flag_kind_name: 'エラー',
        event_condition: {
          detection_condition_code: '1',
          detection_condition_name: '連続発生',
          event_code: '1101',
          event_name: 'イベント名称',
          occurrence_identification: {
            consecutive_occurrence_days: 2,
            decision_period: 2,
            condition: '連続発生日数：2日（期間：2日）',
            ignore_0minute_code: '1',
            ignore_0minute_name: '無視する',
          },
        },
        support_distributor_id: '1',
        support_distributor_label: 'コマツ東京',
        car_conditions: [
          {
            maker_code: '1111',
            maker_name: 'コマツ',
            division_code: '9999',
            division_name: '油圧ショベル',
            model: 'SK714',
            type_rev: '123',
          },
        ],
        free_memo: 'フラグ条件メモ',
        update_datetime: '2017-05-23T23:59:58.999Z',
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
