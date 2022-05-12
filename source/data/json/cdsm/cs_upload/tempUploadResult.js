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
  var sort = args.header['x-sort'] || 'operation_histories.datetime';
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
      operation_histories: [],
    },
  };
  var data;
  for (var i = from; i <= loopEnd; i++) {
    listMock.result_data.operation_histories.push(createData(i));
  }

  return success(listMock);
};

function createData(i) {
  var moment = require('moment');

  data = {
    changeType: '代理店A',
    brand: '代理店A',
    type: '代理店A',
    model: '代理店A',
    serialNumber: '代理店A',
    customizeUsageDefinitionLabel: '代理店A',
    version: '代理店A',
    priority: '代理店A',
    startDay: '代理店A',
    endDay: '代理店A',
    timeBeforeEffect: '代理店A'
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
