var validation = require('../../common/validation.js');

module.exports = function (args) {
  var systemErrorData = validation(args.query, 'system_error');
  if (systemErrorData.length > 0) {
    return fail500();
  }

  var from = isNaN(args.header['x-from']) ? 1 : parseInt(args.header['x-from']);
  var count = isNaN(args.header['x-count'])
    ? 0
    : parseInt(args.header['x-count']);
  var sort = args.header['x-sort'] || 'request_status.car_identification.division_name';
  var TOTAL = isNaN(args.header['x-count']) ? 1 : 100;
  var loopEnd =
    TOTAL > from + count - 1 && count !== 0 ? from + count - 1 : TOTAL;
  var listMock = {
    result_header: {
      'X-From': from,
      'X-Count': count,
      'X-Sort': sort,
      'X-TotalCount': TOTAL,
      'Cache-Control': 'no-cache',
    },
    result_data: {
      request_status: [],
    },
  };
  for (var i = from; i <= loopEnd; i++) {
    listMock.result_data.request_status.push(createData(i));
  }

  return success(listMock);
};

function createData() {
  data = {
    request_status_information: {
      request_kind: 'A12345',
      request_kind_name: '送信番号送信要求',
      request_datetime: '2017/02/01 23:59:59',
      status: '10',
      status_name: '送信中'
    },
    car_identification: {
      id: '1',
      model: 'D85PX',
      type_rev: '15E0',
      serial: 'A12345',
      division_name: '油圧シャベル'
    },
    customize_usage_definitions: [
      {
        id: '1',
        name: 'カスタマイズ用途定義1'
      },
      {
        id: '2',
        name: 'カスタマイズ用途定義2'
      }
    ],
    customize_definitions: [
      {
        id: '1',
        name: 'カスタマイズ定義1'
      },
      {
        id: '2',
        name: 'カスタマイズ定義2'
      }
    ],
  };
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
    status: 400,
    json: {
      error_data: [
        {
          code: 'ERR0001',
          message: msg,
          keys: '???',
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
