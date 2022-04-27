var moment = require('moment');
var _ = require('lodash');
var validation = require('../../common/validation');
var pickAvailableResponse = require('../../common/pickAvailableResponse');
var successEmpty = require('../../common/successEmpty');

module.exports = function(args) {
  if (
    args.header.accept ===
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
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
      content_type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
  }

  var xfields = args.header['x-fields'] && args.header['x-fields'].split(',');
  var from = args.header['x-from'] ? parseInt(args.header['x-from']) : 1;
  var count = args.header['x-count'] ? parseInt(args.header['x-count']) : 0;
  var sort = args.header['x-sort'] || 'operator_code';
  var TOTAL = 100;
  var loopEnd =
    TOTAL > from + count - 1 && count !== 0 ? from + count - 1 : TOTAL;
  var operators = [];
  var mock = {
    result_header: {
      'X-From': from,
      'X-Count': count,
      'X-Sort': sort,
      'X-TotalCount': TOTAL,
      'Cache-Control': 'no-cache',
    },
    result_data: {
      operators: [],
    },
  };
  var result_data = { operators: [] };
  var hasCarIdParams = _.has(args.query, 'car_id');

  if (validation(args.query, 'system_error').length > 0) {
    return fail500();
  }
  // 検索項目にemptyという値が入力されていれば、該当オペレータなしでレスポンスが返る
  if (validation(args.query, 'empty').length > 0) {
    return successEmpty('operators', mock);
  }

  // 削除モーダルではoperator_labelがリクエストされ、返すデータの数をoperator_labelの数と合わせる
  if (args.query.operator_label) {
    loopEnd = _.isArray(args.query.operator_label)
      ? args.query.operator_label.length
      : 1;
  }

  for (var i = from; i <= loopEnd; i++) {
    result_data.operators.push(createData(i, hasCarIdParams));
  }
  mock.result_data = pickAvailableResponse(result_data, xfields);

  return success(mock);
};

function createData(i, hasCarIdParams) {
  var isInitialOperator = !hasCarIdParams && i % 4 === 0;
  var idKeyCode = '1A-DD-' + ('0' + i.toString(16).toUpperCase()).slice(-2);
  var data = {
    id: i.toString(),
    code: isInitialOperator ? idKeyCode : ('000000' + (i * 10 + i)).slice(-7),
    current_label: {
      id: (i * 10 + i).toString(),
      label:
        Math.random() < 0.5
          ? null
          : 'オペレータ' + ('000' + (i * 10 + i)).slice(-4),
      start_datetime: moment()
        .subtract(i * 2, 'days')
        .format('YYYY/MM/DD HH:mm:ss'),
      end_datetime: '',
    },
    label_histories: [],
    update_datetime: moment()
      .subtract(i * 2, 'days')
      .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
  };

  if (!isInitialOperator && i % 3 != 0) {
    // label_histories生成
    for (var j = 1; j <= 5; j++) {
      var hOpeSt = moment()
        .subtract(j * 10, 'days')
        .format('YYYY/MM/DD HH:mm:ss');
      var hOpeEd = moment()
        .subtract(j, 'days')
        .format('YYYY/MM/DD HH:mm:ss');
      var history = {
        id: (j * 100 + j).toString(),
        label: 'オペレータ' + ('000' + (j * 100 + j)).slice(-4),
        start_datetime: hOpeSt,
        end_datetime: hOpeEd,
      };
      data['label_histories'].push(history);
    }
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
          keys: ['???'],
        },
      ],
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

function startDownload(data) {
  return {
    status: 202,
    json: {
      result_data: data,
    },
  };
}
