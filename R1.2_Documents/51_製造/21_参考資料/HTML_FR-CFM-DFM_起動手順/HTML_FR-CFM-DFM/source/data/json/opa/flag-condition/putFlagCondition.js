var validation = require('../../common/validation.js');

module.exports = function(args) {
  var errorData = validation(args.body);
  if (errorData.length > 0) {
    return fail(errorData);
  }
  var mock = {
    result_data: {
      flag_condition: {
        id: '1001',
        group_id: '1093819',
        group_label: 'ブロックA',
        group_label_english: 'groupA',
        flag_code: '2',
        flag_color: '黄旗',
        flag_kind_code: '2',
        flag_kind_name: 'コーション',
        free_memo: 'フラグ条件メモ',
        update_datetime: '2017-05-23T23:59:59.999Z',
        latest_update_datetime: '2017/05/23 23:59:59',
        event_condition: {
          occurrence_identification: {
            condition: '発生日数/期間 ： 10/80日',
            min_alerm_time: '5',
            occurrence_days: '10',
            decision_period: '80',
            consecutive_occurrence_days: null,
          },
          time_identification: {
            condition: null,
            remaining_time_threshold: null,
          },
          icon_font: {
            no: '65',
            id: '1',
          },
          detection_condition_name: '指定期間発生日数',
          detection_condition_code: '1',
          event_name: '冷却水オーバーヒート',
          event_code: '1',
        },
      },
    },
  };

  return success(mock);
};

function success(data) {
  return {
    status: 200,
    json: {
      responses: {
        result_data: data.result_data,
      },
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
