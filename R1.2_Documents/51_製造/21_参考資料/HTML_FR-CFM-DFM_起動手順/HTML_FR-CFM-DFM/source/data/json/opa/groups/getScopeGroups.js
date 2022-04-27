var pickAvailableResponse = require('../../common/pickAvailableResponse');
var groupKinds = [
  {
    key: 'BU',
    value: '4',
    kind: 'D',
  },
  {
    key: 'DU',
    value: '7',
    kind: 'D',
  },
];

module.exports = function(args) {
  args.query.scope_group_kind = args.query.scope_group_kind || '-99';
  var xfields = args.header['x-fields'].split(',');
  var from = 1;
  var total = 20;
  var count = args.query.scope_group_kind === '-99' ? total : 10;
  var sort = 'group.scope_groups.identification.label';
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
          kind_id: groupKinds[args.params.id % 2].value,
          kind_name: groupKinds[args.params.id % 2].key,
          update_datetime: '2017-08-01T23:59:59.000Z',
        },
        scope_groups: [],
      },
    },
  };

  for (var i = from; i <= total; i++) {
    var data = createData(i, args.query.scope_group_kind);

    if (data) {
      mock.result_data.group.scope_groups.push(data);
    }
  }

  mock.result_data = pickAvailableResponse(mock.result_data, xfields);

  return success(mock);
};

function createData(i, scopeGroupKind) {
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
    identification: null,
  };

  data.identification = {
    id: '' + i,
    label: 'グループ（' + ['未設定', '設定済'][kind] + '）' + i,
    label_english: 'group name' + i,
    organization_code: 'ABBESS',
    kind_id: '' + (i % 10),
    kind_name: groupKinds[i % 10],
    update_datetime: '2017-08-01T23:59:59.000Z',
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
          key: '???',
        },
      ],
    },
  };
}
