var pickAvailableResponse = require('../../common/pickAvailableResponse');

module.exports = function (args) {
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

  var xFields = args.header['x-fields'];
  var from = isNaN(args.header['x-from']) ? 1 : parseInt(args.header['x-from']);
  var count = isNaN(args.header['x-count'])
    ? 0
    : parseInt(args.header['x-count']);
  var sort =
    args.header['x-sort'] ||
    'flag_condition.flag_code,-flag_condition.latest_update_datetime';
  var TOTAL = isNaN(args.header['x-count']) ? 1 : 100;
  var loopEnd =
    TOTAL > from + count - 1 && count !== 0 ? from + count - 1 : TOTAL;
  var mock = {
    result_header: {
      'X-From': from,
      'X-Count': count,
      'X-Sort': sort,
      'X-TotalCount': TOTAL,
      'Cache-Control': 'no-cache',
    },
    result_data: {
      flag_conditions: [],
    },
  };
  var data;
  var kind = args.query.flag_kind_code;

  if (args.query.flag_condition_id) {
    kind = args.query.flag_condition_id > 3000 ? '3' : '2';
    flag_condition_id =
      parseInt(args.query.flag_condition_id) - parseInt(kind + '000');

    mock.result_data.flag_conditions.push(createData(String(flag_condition_id), kind));
  } else {
    for (var i = from; i <= loopEnd; i++) {
      mock.result_data.flag_conditions.push(createData(i, kind));
    }
  }

  mock.result_data = xFields
    ? pickAvailableResponse(mock.result_data, xFields)
    : mock.result_data;

  return success(mock);
};

function createData(i, kind) {
  var moment = require('moment');
  var flag_code = '2';

  // 検出種別が交換種別の場合
  if (kind === '3') {
    flag_code = i % 2 === 0 ? '1' : '2';
  }

  var flag_color = flag_code === '1' ? '赤旗' : '黄旗';
  var detection_condition_code = i % 2 === 0 ? '1' : '2';
  var detection_condition_name =
    detection_condition_code === '1' ? '連続発生' : '指定期間発生日数';
  var group_id = i % 5 === 1 ? '5' : '99';
  var event_code = i <= 52 ? String(i) : String(i % 52);
  var min_alerm_time = i % 3 === 0 ? null : String(10 ** (i % 2));
  var remaining_time_threshold =
    10 ** (i % 3) === 100 ? '-99' : String(10 ** (i % 3));
  var icon_font_no = event_code;

  data = {
    id: String(kind * 1000 + i),
    flag_kind_code: kind,
    flag_kind_name: kind === '2' ? 'コーション' : '交換時期',
    free_memo:
      'メモ。\n ○○○○年 ○○月 ○○日にシステムをアップデートが\n行われます。' +
      ('0000' + (i * 1000 + i)).slice(-5),
    flag_code: flag_code,
    flag_color: flag_color,
    group_id: group_id,
    group_label: group_id === '5' ? 'テストブロック' : 'テストリージョン',
    group_label_english: 'group' + group_id,
    group_kind_id: '5',
    group_kind_name: group_id === '5' ? 'ブロック' : 'リージョン',
    update_datetime: moment()
      .subtract(i * 2, 'days')
      .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
    latest_update_datetime: moment()
      .subtract(i * 2, 'days')
      .format('YYYY/MM/DD HH:mm:ss'),
  };

  // 検出種別がコーションの場合
  if (kind === '2') {
    data['event_condition'] = {
      icon_font: {
        no: icon_font_no,
        id: icon_font_no,
      },
      event_code: event_code,
      event_name: 'エアークリーナー目詰まり' + event_code,
      detection_condition_code: detection_condition_code,
      detection_condition_name: detection_condition_name,
      time_identification: {
        remaining_time_threshold: null,
        condition: null,
      },
    };

    if (detection_condition_code === '1') {
      data['event_condition']['occurrence_identification'] = {
        condition: '発生日数:  ' + String(i) + '日',
        consecutive_occurrence_days: String(i),
        decision_period: null,
        occurrence_days: null,
        min_alerm_time: min_alerm_time,
      };
    } else {
      data['event_condition']['occurrence_identification'] = {
        condition: '発生日数/期間: ' + String(i) + '/' + String(i * 10) + '日',
        consecutive_occurrence_days: null,
        decision_period: String(i * 10),
        occurrence_days: String(i),
        min_alerm_time: min_alerm_time,
      };
    }

    // 検出種別が交換時期の場合
  } else {
    data['event_condition'] = {
      icon_font: {
        no: null,
        id: null,
      },
      event_code: null,
      event_name: null,
      detection_condition_code: detection_condition_code,
      detection_condition_name: detection_condition_name,
      time_identification: {
        remaining_time_threshold: remaining_time_threshold,
        condition: '残り時間閾値: ' + remaining_time_threshold + '時間',
      },
      occurrence_identification: {
        consecutive_occurrence_days: null,
        decision_period: null,
        occurrence_days: null,
        min_alerm_time: null,
        condition: null,
      },
    };
  }

  return data;
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

function fail(msg) {
  return {
    status: 500,
    json: {
      error_data: [
        {
          code: 'ERR0001',
          message: msg,
          key: '???',
        },
      ],
    },
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
