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
  var detailMock = {
    result_header: {
      'X-From': from,
      'X-Count': count,
      'X-Sort': sort,
      'X-TotalCount': TOTAL,
      'Cache-Control': 'no-cache',
    },
    result_data: {
      sub_group: {},
    },
  };

  var id = args.params.id;
  detailMock.result_data.sub_group = createData(id);

  return success(detailMock);
};

function createData(i) {
  var moment = require('moment');
  var data = {
    identification: {
      id: String(i),
      label: `サブグループ${i}`,
      label_english: `subgroup${i}`,
      organization_code: 'ABBESS',
      kind_id: '8',
      kind_name: 'サブグループ',
      update_datetime: moment()
        .subtract(i * 2, 'days')
        .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
    },
    attribute: {
      phone_no: '(03)5412-1111',
      email: 'example@example.jp',
      address: '青森県青森市青森町2-10',
      time_difference: '+0900',
      nation_code: 'JP',
      nation_name: '日本',
    },
    administrator_role: {
      id: '66666',
      name: '管理者権限',
      authorities: [
        {
          id: '1',
          name: '権限1',
          default_kind: '1',
          default_kind_name: 'On',
        },
        {
          id: '2',
          name: '権限2',
          default_kind: '0',
          default_kind_name: 'Off',
        },
      ],
    },
    general_role: {
      id: '88888',
      name: '一般権限',
      authorities: [
        {
          id: '1',
          name: '権限1',
          default_kind: '1',
          default_kind_name: 'On',
        },
      ],
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
