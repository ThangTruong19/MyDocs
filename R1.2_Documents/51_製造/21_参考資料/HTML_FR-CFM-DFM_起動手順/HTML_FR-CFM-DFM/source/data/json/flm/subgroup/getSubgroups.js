var validation = require('../../common/validation.js');

module.exports = function(args) {
  var systemErrorData = validation(args.query, 'system_error');
  if (systemErrorData.length > 0) {
    return fail500();
  }

  var from = isNaN(args.header['x-from']) ? 1 : parseInt(args.header['x-from']);
  var count = isNaN(args.header['x-count'])
    ? 0
    : parseInt(args.header['x-count']);
  var sort = args.header['x-sort'] || 'sub_groups.identification.id';
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
      sub_groups: [],
    },
  };
  var data;
  for (var i = from; i <= loopEnd; i++) {
    listMock.result_data.sub_groups.push(createData(i));
  }

  return success(listMock);
};

function createData(i) {
  var moment = require('moment');
  data = {
    identification: {
      id: String(i),
      label: `サブグループ${i}`,
      label_english: `subgroup${i}`,
      organization_code: 'ABBESS',
      kind_id: '13',
      kind_name: 'サブグループ',
      update_datetime: '2017-08-01T23:59:59.000Z',
    },
    attribute: {
      phone_no: '(03)5412-1111',
      email: 'example@example.jp',
      address: '青森県青森市青森町2-10',
      time_difference: '+0900',
      nation_code: 'JP',
      nation_name: '日本',
    },
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
