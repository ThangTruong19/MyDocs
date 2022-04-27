var validation = require('../../common/validation.js');

module.exports = function(args) {
  var errorData = validation(args.body);
  if (errorData.length > 0) {
    return fail(errorData);
  }

  var data = {
    result_data: {
      sub_group: {
        identification: {
          id: '12345',
          label: 'コマツ総務部',
          label_english: 'Komatsu Affairs Department',
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
        represent_administrator: {
          user_id: '44444',
          user_label: '小松太郎',
          user_label_english: 'komatsu tarou',
        },
        administrator_role: {
          id: '66666',
          name: '管理者権限',
          authorities: [
            {
              id: '77777',
              name: '車両操作',
              default_kind: '1',
              default_kind_name: 'On',
            },
          ],
        },
        general_role: {
          id: '88888',
          name: '一般権限',
          authorities: [
            {
              id: '99999',
              name: '車両参照',
              default_kind: '1',
              default_kind_name: 'On',
            },
          ],
        },
      },
    },
  };
  return success(data);
};

function success(data) {
  return {
    status: 200,
    json: {
      result_data: data.result_data,
    },
  };
}

function fail(errorData) {
  return {
    status: 400,
    json: {
      error_data: errorData,
    },
  };
}
