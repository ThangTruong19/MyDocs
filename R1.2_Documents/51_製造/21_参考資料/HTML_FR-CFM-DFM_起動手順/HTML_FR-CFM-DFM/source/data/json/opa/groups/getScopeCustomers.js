var pickAvailableResponse = require('../../common/pickAvailableResponse');
var groupKinds = ['グローバル顧客', '広域顧客'];

module.exports = function(args) {
  var xfields = args.header['x-fields'].split(',');
  var from = 1;
  var total = 20;
  var count =
    args.query.scope_group_kind === '-99' || args.query.scope_group_kind == null
      ? total
      : 10;
  var sort = 'group.scope_groups.region.identification.label';
  var mock = {
    result_header: {
      'X-From': from,
      'X-Count': count,
      'X-Sort': sort,
      'X-TotalCount': count,
    },
    result_data: {
      group: {
        identification: {
          id: '' + args.params.id,
          label: 'グループ名称',
          label_english: 'group name',
          organization_code: 'ABBESS',
          kind_id: '' + (9 + (args.params.id % 2)),
          kind_name: groupKinds[args.params.id % 2],
          update_datetime: '2017-08-01T23:59:59.000Z',
        },
        scope_groups: [],
      },
    },
  };

  for (var i = from; i <= count; i++) {
    var data = createData(i, args.query.scope_group_kind, +args.params.id % 2);

    if (data) {
      mock.result_data.group.scope_groups.push(data);
    }
  }

  mock.result_data = pickAvailableResponse(mock.result_data, xfields);

  return success(mock);
};

function createData(i, scopeGroupKind = '-99', customerType) {
  var kind;
  if (scopeGroupKind === '-99') {
    kind = i % 2 === 0 ? 0 : 1;
  } else {
    kind = scopeGroupKind;
  }

  if (i % 2 !== +kind) {
    return;
  }

  var data = {
    kind: '' + kind,
    name: ['未設定', '設定済'][kind],
    region: {
      identification: null,
    },
    customer: {
      identification: null,
    },
  };

  data.region.identification = {
    id: '' + i,
    label: 'リージョン（' + ['未設定', '設定済'][kind] + '）' + i,
    label_english: 'group name' + i,
    organization_code: 'ABBESS',
    kind_id: '2',
    kind_name: 'リージョン',
    update_datetime: '2017-08-01T23:59:59.000Z',
  };

  data.customer.identification = {
    id: '' + i,
    label: '顧客（' + ['未設定', '設定済'][kind] + '）' + i,
    label_english: 'group name' + i,
    organization_code: 'ABBESS',
    kind_id: '8',
    kind_name: '顧客',
    update_datetime: '2017-08-01T23:59:59.000Z',
  };

  if (customerType === 0) {
    data.block = {};
    data.distributor = {};

    data.block.identification = {
      id: '' + i,
      label: 'ブロック（' + ['未設定', '設定済'][kind] + '）' + i,
      label_english: 'group name' + i,
      organization_code: 'ABBESS',
      kind_id: '3',
      kind_name: 'ブロック',
      update_datetime: '2017-08-01T23:59:59.000Z',
    };

    data.distributor.identification = {
      id: '' + i,
      label: '代理店（' + ['未設定', '設定済'][kind] + '）' + i,
      label_english: 'group name' + i,
      organization_code: 'ABBESS',
      kind_id: '4',
      kind_name: '代理店',
      update_datetime: '2017-08-01T23:59:59.000Z',
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
    status: 400,
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
