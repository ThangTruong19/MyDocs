module.exports = function(args) {
  var checkData = {
    responses: [
      {
        request: {
          group_id: '12345',
        },
      },
    ],
    group_integration_request: {
      identification: {
        label: 'グループ一括統合',
        update_mode: '0',
        update_mode_name: '更新チェック',
        update_check_datetime: '2000/01/01 00:00:00',
      },
    },
  };

  var updateData = {
    responses: [
      {
        request: {
          group_id: '12345',
        },
        result_data: {
          group: {
            identification: {
              id: '12345',
              label: 'グループ名称',
              label_english: 'group name',
              organization_code: 'ABBESS',
              kind_id: '3',
              kind_name: 'ブロック',
              update_datetime: '2017-08-01T23:59:59.000Z',
            },
          },
        },
      },
      {
        request: {
          group_id: '1980',
        },
        error_data: [
          {
            code: 'ACOM0002E',
            message: 'リクエスト情報が不正です。',
            keys: ['group_id'],
          },
        ],
      },
    ],
    group_integration_request: {
      id: '1',
      name: 'グループ統合要求',
      accept_datetime: '2000/01/01 00:00:00',
      status: '0',
      status_name: '受付',
    },
  };

  var checkError = {
    error_data: [
      {
        code: 'ACOM0002E',
        message: '指定された{{group.group_ids}}は使用できません。',
        keys: [],
      },
    ],
  };

  var checkWarning = {
    error_data: [
      {
        code: 'ACOM0002W',
        message: 'リクエスト情報が不正です。',
        keys: [],
      },
      {
        code: 'ACOM0002W',
        message: 'リクエスト情報が不正です。',
        keys: [],
      },
    ],
  };

  if (args.body.group.update_mode === '0') {
    // 動作検証用
    // 統合対象グループの数によってレスポンスが変化
    switch (args.body.group.group_ids.length) {
      case 2:
        return fail400(checkWarning);
      case 3:
        return fail400(checkError);
      default:
        return success(checkData, 200);
    }
  }

  return success(updateData, 202);
};

function success(data, status) {
  return {
    status,
    json: data,
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

function fail400(data) {
  return {
    status: 400,
    json: data,
  };
}
