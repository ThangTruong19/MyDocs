var validation = require('../../common/validation.js');
var pickAvailableResponse = require('../../common/pickAvailableResponse');
var groupKinds = [
  {
    key: 'BU',
    value: '4',
    kind: 'D',
  },
  {
    key: 'Block',
    value: '5',
    kind: 'D',
  },
  {
    key: '工場',
    value: '6',
    kind: 'D',
  },
  {
    key: 'DU',
    value: '7',
    kind: 'D',
  },
  {
    key: 'DB',
    value: '8',
    kind: 'D',
  },
  {
    key: '銀行',
    value: '12',
    kind: 'D',
  },
  {
    key: '保険',
    value: '13',
    kind: 'D',
  },
  {
    key: 'ファイナンス',
    value: '14',
    kind: 'D',
  },
  {
    key: 'グローバル顧客',
    value: '9',
    kind: 'D',
  },
  {
    key: '広域顧客',
    value: '10',
    kind: 'D',
  },
];

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
  var sort = args.header['x-sort'] || 'groups.identification.kind_name';
  var TOTAL = isNaN(args.header['x-count']) ? 1 : 100;
  var loopEnd =
    TOTAL > from + count - 1 && count !== 0 ? from + count - 1 : TOTAL;
  var mock = {
    result_header: {
      'X-From': from,
      'X-Count': count,
      'X-Sort': sort,
      'X-TotalCount': TOTAL,
    },
    result_data: {
      groups: [],
    },
  };

  for (var i = from; i <= loopEnd; i++) {
    mock.result_data.groups.push(createData(i, args.query.group_kind_id));
  }

  mock.result_data = pickAvailableResponse(mock.result_data, xfields);

  return success(mock);
};

function createData(i, kindId) {
  var groupKind = groupKinds.find(function(kind) {
    return kindId === kind.value;
  });
  return {
    identification: {
      id: '' + (kindId === '-99' ? i : i * 2 + +kindId + 1),
      label: 'グループ名称' + i,
      label_english: 'group name' + i,
      organization_code: 'ABBESS',
      kind_id: kindId === '-99' ? groupKinds[(i % 2) + 8].value : kindId,
      kind_name: kindId === '-99' ? groupKinds[(i % 2) + 8].key : groupKind.key,
      update_datetime: '2017-08-01T23:59:59.000Z',
    },
    publish_setting_groups: [
      {
        regions: [
          {
            identification: {
              id: '22222',
              label: 'アジア',
              label_english: 'Asia',
              organization_code: 'ASIAR',
              kind_id: '2',
              kind_name: 'リージョン',
              update_datetime: '2017-08-01T23:59:59.000Z',
            },
          },
        ],
        blocks: [
          {
            identification: {
              id: '33333',
              label: '日本',
              label_english: 'Japan',
              organization_code: 'JPNB',
              kind_id: '3',
              kind_name: 'ブロック',
              update_datetime: '2017-08-01T23:59:59.000Z',
            },
          },
        ],
        distributors: [
          {
            identification: {
              id: '44444',
              label: 'コマツサービスエース',
              label_english: 'Komatsu Service Ace',
              organization_code: 'KSADB',
              kind_id: '4',
              kind_name: '代理店',
              update_datetime: '2017-08-01T23:59:59.000Z',
            },
          },
        ],
        customers: [
          {
            identification: {
              id: '55555',
              label: '田中建設',
              label_english: 'Tanaka Kensetu',
              organization_code: 'TNKC',
              kind_id: '8',
              kind_name: '顧客',
              update_datetime: '2017-08-01T23:59:59.000Z',
            },
          },
        ],
      },
    ],
  };
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
