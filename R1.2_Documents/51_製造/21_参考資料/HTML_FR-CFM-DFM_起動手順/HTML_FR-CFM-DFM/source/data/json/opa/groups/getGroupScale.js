var pickAvailableResponse = require('../../common/pickAvailableResponse');

module.exports = function(args) {
  var xFields = args.header['x-fields'];
  var from = 1;
  var count = args.query.group_ids.length;
  var sort = 'groups.identification.label';
  var mock = {
    result_header: {
      'X-From': from,
      'X-Count': count,
      'X-Sort': sort,
      'X-TotalCount': count,
    },
    result_data: {
      groups: [],
    },
  };

  args.query.group_ids.forEach(function(id) {
    mock.result_data.groups.push({
      identification: {
        id: id,
        label: 'グループ名称',
        label_english: 'group name',
        organization_code: 'ABBESS',
        kind_id: '3',
        kind_name: 'ブロック',
        update_datetime: '2017-08-01T23:59:59.000Z',
      },
      attribute: {
        phone_no: '0312345678',
        email: 'example@example.jp',
        address: '青森県青森市青森町2-10',
        nation_code: 'JP',
        nation_name: '日本',
        time_difference: '+0900',
        publish_kind: '1',
        publish_name: '公開有',
        customer_publish_group_label: '公開名称1',
        first_day_of_week_kind: '0',
        first_day_of_week_name: '日曜日',
      },
      count: {
        subordinate_group: {
          name: 'グループ数',
          value: 100,
        },
        car: {
          name: '車両数',
          value: 200,
        },
      },
    });
  });

  mock.result_data = pickAvailableResponse(mock.result_data, xFields);

  return success(mock);
  // return fail500();
};

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
