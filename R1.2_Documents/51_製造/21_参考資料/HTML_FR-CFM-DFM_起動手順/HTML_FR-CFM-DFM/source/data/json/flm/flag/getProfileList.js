var _ = require('lodash');
var pickAvailableResponse = require('../../common/pickAvailableResponse');

module.exports = function(args) {
  var model = args.query.model;

  var data = {
    flag_condition_links: [
      {
        car_condition: {
          maker_code: '1111',
          maker_name: 'コマツ',
          division_code: '9999',
          division_name: '油圧ショベル',
          model: model,
          type_rev: '123',
        },
      },
      {
        car_condition: {
          maker_code: '1111',
          maker_name: 'コマツ',
          division_code: '9999',
          division_name: '油圧ショベル',
          model: model,
          type_rev: '456',
        },
      },
      {
        car_condition: {
          maker_code: '1111',
          maker_name: 'コマツ',
          division_code: '9999',
          division_name: '油圧ショベル',
          model: model,
          type_rev: '789',
        },
      },
    ],
  };

  var flag_conditions = [
    [
      {
        id: '1',
        flag_code: '5',
        flag_color: 'オレンジ',
        flag_kind_code: '1',
        flag_kind_name: 'エラー',
        free_memo: 'フラグ条件メモ',
        event_condition: {
          event_code: '0001',
          event_name: '',
          detection_condition_code: '1',
          detection_condition_name: '連続発生',
          occurrence_identification: {
            consecutive_occurrence_days: 2,
            decision_period: 5,
            occurrence_days: 0,
            condition: '連続発生日数：2日（期間：5日）',
            accumulate_occurrence_count: 0,
            ignore_0minute_code: '1',
            ignore_0minute_name: '無視する',
          },
        },
        latest_update_datetime: '2017/05/23 23:59:59',
        update_datetime: '2017-05-23T23:59:59.999Z',
      },
      {
        id: '2',
        flag_code: '5',
        flag_color: 'オレンジ',
        flag_kind_code: '1',
        flag_kind_name: 'エラー',
        free_memo: 'フラグ条件メモ',
        event_condition: {
          event_code: '0002',
          event_name: '',
          detection_condition_code: '2',
          detection_condition_name: '指定期間発生日数',
          occurrence_identification: {
            consecutive_occurrence_days: 0,
            decision_period: 7,
            occurrence_days: 4,
            condition: '指定期間発生日数：4日（期間：7日）',
            accumulate_occurrence_count: 0,
            ignore_0minute_code: '0',
            ignore_0minute_name: '無視しない',
          },
        },
        latest_update_datetime: '2017/05/23 23:59:59',
        update_datetime: '2017-05-23T23:59:59.999Z',
      },
      {
        id: '3',
        flag_code: '5',
        flag_color: 'オレンジ',
        flag_kind_code: '1',
        flag_kind_name: 'エラー',
        free_memo: 'フラグ条件メモ',
        event_condition: {
          event_code: '0003',
          event_name: '',
          detection_condition_code: '3',
          detection_condition_name: '累積発生回数',
          occurrence_identification: {
            consecutive_occurrence_days: 0,
            decision_period: 0,
            occurrence_days: 0,
            condition: '累積発生回数：100回',
            accumulate_occurrence_count: 100,
            ignore_0minute_code: '1',
            ignore_0minute_name: '無視する',
          },
        },
        latest_update_datetime: '2017/05/23 23:59:59',
        update_datetime: '2017-05-23T23:59:59.999Z',
      },
    ],
    [],
    [
      {
        id: '11',
        flag_code: '5',
        flag_color: 'オレンジ',
        flag_kind_code: '1',
        flag_kind_name: 'エラー',
        free_memo: 'フラグ条件メモ',
        event_condition: {
          event_code: '0011',
          event_name: '',
          detection_condition_code: '1',
          detection_condition_name: '連続発生',
          occurrence_identification: {
            consecutive_occurrence_days: 3,
            decision_period: 10,
            occurrence_days: 0,
            condition: '連続発生日数：3日（期間：10日）',
            accumulate_occurrence_count: 0,
            ignore_0minute_code: '1',
            ignore_0minute_name: '無視する',
          },
        },
        latest_update_datetime: '2017/05/23 23:59:59',
        update_datetime: '2017-05-23T23:59:59.999Z',
      },
    ],
  ];

  for (var i = 0; i < 3; i++) {
    data.flag_condition_links[i].flag_conditions = flag_conditions[i];

    if (args.query.group_id) {
      data.flag_condition_links[i].flag_conditions.forEach(function(f) {
        _.assign(f, {
          support_distributor_id: '1',
          support_distributor_label: 'コマツ',
          support_distributor_label_english: 'KOMATSU',
        });
      });
    }
  }

  return success(data);
};

function success(data) {
  return {
    status: 200,
    json: {
      result_data: data,
    },
  };
}

function fail(msg) {
  return {
    status: 500,
    json: {
      error_data: [
        {
          code: 'COM0002E',
          message: 'リクエスト情報が不正です。',
          keys: ['car_id'],
        },
      ],
    },
  };
}
