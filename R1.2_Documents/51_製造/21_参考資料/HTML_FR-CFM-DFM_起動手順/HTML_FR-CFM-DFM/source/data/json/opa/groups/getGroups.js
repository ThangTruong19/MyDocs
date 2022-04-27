var validation = require('../../common/validation.js');
var pickAvailableResponse = require('../../common/pickAvailableResponse');

module.exports = function(args) {
  var systemErrorData = validation(args.query, 'system_error');
  if (systemErrorData.length > 0) {
    return fail500();
  }

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
    });
  }

  var xFields = args.header['x-fields'];
  var from = isNaN(args.header['x-from']) ? 1 : parseInt(args.header['x-from']);
  var count = isNaN(args.header['x-count'])
    ? 0
    : parseInt(args.header['x-count']);
  var sort = args.header['x-sort'] || 'groups.identification.kind_name';
  var TOTAL = 100;
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
    mock.result_data.groups.push(createData(i));
  }

  mock.result_data = pickAvailableResponse(mock.result_data, xFields);

  return success(mock);
};

function createData(i) {
  var integrationStatus = +(i % 3 === 0);
  var integrationStatusNames = ['未実施', '実施中'];
  var data = {
    integration_status_name: integrationStatusNames[integrationStatus],
    integration_status: '' + integrationStatus,
    identification: null,
    attribute: null,
    configuration_groups: null,
  };

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

  data.identification = {
    id: '' + i,
    label: 'グループ名称' + i,
    label_english: 'group name' + i,
    organization_code: 'ABBESS',
    kind_id: groupKinds[i % 10].value,
    kind_name: groupKinds[i % 10].key,
    update_datetime: '2017-08-01T23:59:59.000Z',
  };

  data.attribute = {
    first_day_of_week_name: '日曜日',
    first_day_of_week_kind: '0',
    phone_no: '0312345678',
    email: 'example@example.jp',
    address: '青森県青森市青森町2-10',
    nation_code: 'JP',
    nation_name: '日本',
    time_difference: '+0900',
    publish_kind: '' + (i % 2),
    publish_name: '公開有',
    customer_publish_group_label: '公開名称1',
  };

  data.configuration_groups = [
    {
      id: '12345678',
      label: 'グループ名称',
      label_english: 'group name',
      kind_id: '2',
      kind_name: 'リージョン',
    },
  ];

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

function startDownload(data) {
  return {
    status: 202,
    json: {
      result_data: data,
    },
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
