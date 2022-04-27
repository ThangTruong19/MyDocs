var _ = require('lodash');
var pickAvailableResponse = require('../../common/pickAvailableResponse');
var validation = require('../../common/validation.js');

var evaluationNames = {
  1: '連続発生',
  2: '指定期間発生日数',
  3: '累積発生回数',
};
var ignoreZeroTexts = ['無視しない', '無視する'];

module.exports = function(args)
{
  var systemErrorData = validation(args.query, 'ERROR');

  if (systemErrorData.length) {
    return fail();
  }

  if (
    args.header.accept ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    args.header.accept === 'text/comma-separated-values'
  ) {
    return startDownload({
      id: '0',
      name: '〇〇ファイル作成',
      request_datetime: '2000/01/01 00:00:00',
      complete_datetime: '2000/01/01 00:00:00',
      request_api_id: 'KOM-00100010',
      result_api_id: 'KOM-00000011',
      status_code: '0',
      status_name: '受付',
      content_type: args.header.accept,
    });
  }

  const xFields = args.header['x-fields'];
  var from = parseInt(args.header['x-from']);
  var count = parseInt(args.header['x-count']);
  var sort = args.header['x-sort'] || 'flag_conditions.latest_update_datetime';
  var TOTAL = 100;
  var loopEnd = TOTAL > from + count - 1 ? from + count - 1 : TOTAL;
  var data = {
    flag_conditions: [],
  };

  if (args.query.flag_condition_id) {
    data.flag_conditions.push(createData(args, args.query.flag_condition_id));
  } else {
    for (var i = from; i <= loopEnd; i++) {
      data.flag_conditions.push(createData(args, i));
    }
  }

  return success({
    result_header: {
      'X-From': from,
      'X-Count': count,
      'X-Sort': sort,
      'X-TotalCount': TOTAL,
      'Cache-Control': 'no-cache',
    },
    result_data: xFields ? pickAvailableResponse(data, xFields) : data,
  });
};

function createData(args, i) {
  var flag;
  var evaluationCode, ignoreZero;
  var eventCondition, carConditions;

  evaluationCode = (i % 3) + 1;
  ignoreZero = i % 2;
  flag = {
    id: '' + i,
    flag_code: '5',
    flag_color: 'オレンジ',
    flag_kind_code: '1',
    flag_kind_name: 'エラー',
    free_memo: 'フラグ条件メモ\n（少し長いメモ1234567890メモ）',
    latest_update_datetime: '2017/05/23 23:59:59',
    update_datetime: '2017-05-23T23:59:59.999Z',
  };

  eventCondition = {
    event_code: 'E' + ('000' + i).slice(-4),
    event_name: '',
    detection_condition_code: '' + evaluationCode,
    detection_condition_name: evaluationNames[evaluationCode],
  };

  eventCondition.occurrence_identification = (function() {
    switch (evaluationCode) {
      case 1:
        return {
          consecutive_occurrence_days: 2,
          decision_period: 4,
          occurrence_days: 0,
          condition: '連続発生日数：2日（期間：4日）',
          accumulate_occurrence_count: 0,
          ignore_0minute_code: '' + ignoreZero,
          ignore_0minute_name: ignoreZeroTexts[ignoreZero],
        };
      case 2:
        return {
          consecutive_occurrence_days: 0,
          decision_period: 7,
          occurrence_days: 3,
          condition: '指定期間発生日数：3日（期間：7日）',
          accumulate_occurrence_count: 0,
          ignore_0minute_code: '' + ignoreZero,
          ignore_0minute_name: ignoreZeroTexts[ignoreZero],
        };
      case 3:
        return {
          consecutive_occurrence_days: 0,
          decision_period: 0,
          occurrence_days: 0,
          condition: '累積発生回数：200回',
          accumulate_occurrence_count: 200,
          ignore_0minute_code: '' + ignoreZero,
          ignore_0minute_name: ignoreZeroTexts[ignoreZero],
        };
    }
  })();

  carConditions = [
    {
      division_code: '0001',
      division_name: '油圧ショベル',
      maker_code: '0001',
      maker_name: 'コマツ',
      model: 'PD200',
      type_rev: '21M0',
    },
    {
      division_code: '0001',
      division_name: '油圧ショベル',
      maker_code: '0001',
      maker_name: 'コマツ',
      model: 'PD200',
      type_rev: '22M0',
    },
    {
      division_code: '0001',
      division_name: '油圧ショベル',
      maker_code: '0001',
      maker_name: 'コマツ',
      model: 'PD200',
      type_rev: '21M0',
    },
    {
      division_code: '0001',
      division_name: '油圧ショベル',
      maker_code: '0001',
      maker_name: 'コマツ',
      model: 'PD200',
      type_rev: '22M0',
    },
    {
      division_code: '0001',
      division_name: '油圧ショベル',
      maker_code: '0001',
      maker_name: 'コマツ',
      model: 'PD200',
      type_rev: '21M0',
    },
    {
      division_code: '0001',
      division_name: '油圧ショベル',
      maker_code: '0001',
      maker_name: 'コマツ',
      model: 'PD200',
      type_rev: '22M0',
    },
    {
      division_code: '0001',
      division_name: '油圧ショベル',
      maker_code: '0001',
      maker_name: 'コマツ',
      model: 'PD200',
      type_rev: '21M0',
    },
    {
      division_code: '0001',
      division_name: '油圧ショベル',
      maker_code: '0001',
      maker_name: 'コマツ',
      model: 'PD200',
      type_rev: '22M0',
    },
    {
      division_code: '0001',
      division_name: '油圧ショベル',
      maker_code: '0001',
      maker_name: 'コマツ',
      model: 'PD200',
      type_rev: '21M0',
    },
    {
      division_code: '0001',
      division_name: '油圧ショベル',
      maker_code: '0001',
      maker_name: 'コマツ',
      model: 'PD200',
      type_rev: '22M0',
    },
    {
      division_code: '0001',
      division_name: '油圧ショベル',
      maker_code: '0001',
      maker_name: 'コマツ',
      model: 'PD200',
      type_rev: '21M0',
    },
    {
      division_code: '0001',
      division_name: '油圧ショベル',
      maker_code: '0001',
      maker_name: 'コマツ',
      model: 'PD200',
      type_rev: '22M0',
    },
    {
      division_code: '0001',
      division_name: '油圧ショベル',
      maker_code: '0001',
      maker_name: 'コマツ',
      model: 'PD200',
      type_rev: '21M0',
    },
    {
      division_code: '0001',
      division_name: '油圧ショベル',
      maker_code: '0001',
      maker_name: 'コマツ',
      model: 'PD200',
      type_rev: '22M0',
    },
    {
      division_code: '0001',
      division_name: '油圧ショベル',
      maker_code: '0001',
      maker_name: 'コマツ',
      model: 'PD200',
      type_rev: '21M0',
    },
    {
      division_code: '0001',
      division_name: '油圧ショベル',
      maker_code: '0001',
      maker_name: 'コマツ',
      model: 'PD200',
      type_rev: '22M0',
    },
    {
      division_code: '0001',
      division_name: '油圧ショベル',
      maker_code: '0001',
      maker_name: 'コマツ',
      model: 'PD200',
      type_rev: '21M0',
    },
    {
      division_code: '0001',
      division_name: '油圧ショベル',
      maker_code: '0001',
      maker_name: 'コマツ',
      model: 'PD200',
      type_rev: '22M0',
    },
    {
      division_code: '0001',
      division_name: '油圧ショベル',
      maker_code: '0001',
      maker_name: 'コマツ',
      model: 'PD200',
      type_rev: '21M0',
    },
    {
      division_code: '0001',
      division_name: '油圧ショベル',
      maker_code: '0001',
      maker_name: 'コマツ',
      model: 'PD200',
      type_rev: '22M0',
    },

    {
      division_code: '0003',
      division_name: 'クレーン',
      maker_code: '0001',
      maker_name: 'コマツ',
      model: 'PC300',
      type_rev: '41M0',
    },
  ];

  flag.event_condition = eventCondition;
  flag.car_conditions = carConditions;

  if (args.query.group_id) {
    _.assign(flag, {
      support_distributor_id: '' + args.query.group_id,
      support_distributor_label: '担当DB',
      support_distributor_label_english: 'KOMATSU',
    });
  }

  return flag;
}

function success(data) {
  return {
    status: 200,
    json: {
      result_data: data.result_data,
    },
    header: data.result_header,
  };
}

function startDownload(data) {
  return {
    status: 202,
    json: {
      result_data: data,
    },
  };
}

function fail(msgs) {
  return {
    status: 504,
    body: '<html><head></head><body><h1>error!</h1></body></html>'
  };
}
