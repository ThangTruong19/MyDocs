var validation = require('../../common/validation.js');

module.exports = function(args) {
  var errorData = validation(args.body);
  if (errorData.length > 0) {
    return fail(errorData);
  }

  var data = {
    result_data: {
      group: {
        preset_roles: [
          {
            authorities: [
              {
                default_kind_name: 'ON',
                default_kind: '1',
                name: '車両参照',
                id: '11115',
              },
            ],
            group_kind_order: 1,
            group_kind_name: 'ブロック',
            group_kind_id: '3',
          },
        ],
        general_role: {
          authorities: [
            {
              default_kind_name: 'ON',
              default_kind: '1',
              name: '車両参照',
              id: '99999',
            },
          ],
          name: '一般権限',
          id: '88888',
        },
        administrator_role: {
          authorities: [
            {
              default_kind_name: 'ON',
              default_kind: '1',
              name: '車両操作',
              id: '77777',
            },
          ],
          name: '管理者権限',
          id: '66666',
        },
        represent_administrator: {
          user_label_english: 'komatsu tarou',
          user_label: '小松太郎',
          user_id: '44444',
        },
        rental_car_business: {
          name: '対応',
          kind: '0',
        },
        child_plants: [
          {
            label_english: 'Child Plants',
            label: 'チャイルド工場名',
            id: '33333',
          },
        ],
        identification: {
          update_datetime: '2017-08-01T23:59:59.000Z',
          kind_name: 'ブロック',
          kind_id: '3',
          organization_code: 'ABBESS',
          label_english: 'group name',
          label: 'グループ名称',
          id: '12345',
        },
        attribute: {
          first_day_of_week_name: '日曜日',
          first_day_of_week_kind: '0',
          customer_publish_group_label: '公開名称1',
          phone_no: '0312345678',
          email: 'example@example.jp',
          address: '青森県青森市青森町2-10',
          nation_code: 'JP',
          nation_name: '日本',
          time_difference: '+0900',
          publish_kind: '1',
          publish_name: '公開有',
        },
        map_application: {
          lang_name: '日本語',
          lang_code: 'ja',
          name: 'GoogleMaps',
          id: '1',
        },
        map: {
          properties: {
            magnification: '5',
          },
          geometry: {
            coordinates: [139.766027, 35.681657],
            type: 'Point',
          },
          type: 'Feature',
        },
        default_lang: {
          name: '日本語',
          code: 'ja',
        },
        langs: [
          {
            name: '日本語',
            code: 'ja',
          },
        ],
        configuration_groups: [
          {
            kind_name: 'リージョン',
            kind_id: '2',
            label_english: 'group name',
            label: 'グループ名称',
            id: '12345678',
          },
        ],
        publish_target: {
          regions: [
            {
              label_english: 'region name',
              label: 'リージョン',
              id: '123456',
            },
          ],
          global_name: '全世界',
          global_kind: '0',
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
