var moment = require('moment');
var validation = require('../../common/validation');
var pickAvailableResponse = require('../../common/pickAvailableResponse');
var successEmpty = require('../../common/successEmpty');

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

  var xfields = args.header['x-fields'] && args.header['x-fields'].split(',');
  var from = parseInt(args.header['x-from']) || 1;
  var count = parseInt(args.header['x-count']) || 100;
  var sort = args.header['x-sort'] || 'id_key_code';
  var TOTAL = 100;
  var loopEnd = TOTAL > from + count - 1 ? from + count - 1 : TOTAL;
  var id_keys = [];
  var mock = {
    result_header: {
      'X-From': from,
      'X-Count': count,
      'X-Sort': sort,
      'X-TotalCount': TOTAL,
      'Cache-Control': 'no-cache',
    },
    result_data: {
      id_keys: [],
    },
  };
  var result_data = { id_keys: [] };

  if (validation(args.query, 'system_error').length > 0) {
    return fail500();
  }
  // 検索項目にemptyという値が入力されていれば、該当オペレータなしでレスポンスが返る
  if (validation(args.query, 'empty').length > 0) {
    return successEmpty('id_keys', mock);
  }

  for (var i = from; i <= loopEnd; i++) {
    result_data.id_keys.push(createData(i));
  }
  mock.result_data = pickAvailableResponse(result_data, xfields);

  return success(mock);
};

function createData(i) {
  var isInitialOperator = i % 4 === 0; // Math.random() < 0.2;
  var idKeyCode = '1A-DD-' + ('0' + i.toString(16).toUpperCase()).slice(-2);
  var current_operator = {
    id: i.toString(),
    code: isInitialOperator ? null : ('000000' + (i * 10 + i)).slice(-7),
    current_label: {
      id: (i * 10 + i).toString(),
      label: isInitialOperator
        ? null
        : 'オペレータ' + ('000' + (i * 10 + i)).slice(-4),
      start_datetime: moment()
        .subtract(i * 2, 'days')
        .format('YYYY/MM/DD HH:mm:ss'),
      end_datetime: '',
    },
    update_datetime: moment()
      .subtract(i * 2, 'days')
      .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
    start_datetime: moment()
      .subtract(i * 2, 'days')
      .format('YYYY/MM/DD HH:mm:ss'),
    end_datetime: '',
  };

  var data = {
    id: i.toString(),
    code: idKeyCode,
    current_operator: current_operator,
    operator_histories: [],
    update_datetime: moment()
      .subtract(i * 2, 'days')
      .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
  };

  if (!isInitialOperator && i % 3 != 0) {
    // operator_label_histories生成
    for (var j = 1; j <= 5; j++) {
      var hOpeSt = moment()
        .subtract(j * 10, 'days')
        .format('YYYY/MM/DD HH:mm:ss');
      var hOpeEd = moment()
        .subtract(j, 'days')
        .format('YYYY/MM/DD HH:mm:ss');
      var history = {
        id: (j * 100 + j).toString(),
        code: ('000000' + (j * 100 + j)).slice(-7),
        current_label: {
          id: (j * 100 + j).toString(),
          label: 'オペレータ' + ('000' + (j * 100 + j)).slice(-4),
          start_datetime: hOpeSt,
          end_datetime: '',
        },
        update_datetime: moment()
          .subtract(j * 10, 'days')
          .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
        start_datetime: hOpeSt,
        end_datetime: hOpeEd,
      };
      data['operator_histories'].push(history);
    }
  }
  data['update_datetime'] = moment().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');

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
