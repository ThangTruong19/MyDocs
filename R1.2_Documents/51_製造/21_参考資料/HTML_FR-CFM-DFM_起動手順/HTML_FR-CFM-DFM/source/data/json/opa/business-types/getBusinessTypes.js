var validation = require('../../common/validation.js');
var pickAvailableResponse = require('../../common/pickAvailableResponse');
var moment = require('moment');

module.exports = function(args) {
  var systemErrorData = validation(args.query, 'system_error');
  if (systemErrorData.length > 0) {
    return fail500();
  }
  var xfields = args.header['x-fields'].split(',');
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
    result_data: {},
  };

  var result_data = { business_types: [] };
  for (var i = from; i <= loopEnd; i++) {
    result_data.business_types.push(createData(i));
  }
  listMock.result_data = pickAvailableResponse(result_data, xfields);
  return success(listMock);
};

function createData(i) {
  var data = {
    id: String(i),
    block_id: String((i % 5) + 1),
    block_label: `公開先グループ${(i % 5) + 1}`,
    block_label_english: `group${(i % 5) + 1}`,
    name: `業種${i}`,
    update_datetime: moment()
      .subtract(i * 2, 'days')
      .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
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
