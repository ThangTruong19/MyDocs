module.exports = function (args) {
  const functions = [
    {
      code: 'cdsm_car_mgt_menu',
      name: '車両カスタマイズデータ・設定管理',
      options: [],
      functions: [
        {
          code: 'cdsm_customize_setting_upload_link',
          name: '一括設定/一括更新',
          options: [
            {
              key: 'link',
              value: 'customize_setting_upload',
            },
          ],
          functions: [],
        },
        {
          code: 'cdsm_car_mgt_list_link',
          name: '車両検索',
          options: [
            {
              key: 'link',
              value: 'cars',
            },
          ],
          functions: [],
        }
      ],
    },
    {
      code: 'cdsm_history_request_status_mgt_menu',
      name: '作業・ステータス確認',
      options: [],
      functions: [
        {
          code: 'cdsm_history_mgt_list_link',
          name: '作業履歴',
          options: [
            {
              key: 'link',
              value: 'history',
            },
          ],
          functions: [],
        },
        {
          code: 'cdsm_request_status_mgt_list_link',
          name: '要求ステータス',
          options: [
            {
              key: 'link',
              value: 'customize_request_status',
            },
          ],
          functions: [],
        }
      ],
    },
    {
      code: 'cdsm_authority_mgt_menu',
      name: '権限管理',
      options: [],
      functions: [
        {
          code: 'cdsm_authority_mgt_list_link',
          name: '変更',
          options: [
            {
              key: 'link',
              value: 'authority',
            },
          ],
          functions: [],
        }
      ],
    }
  ];

  const resultData = {
    functions: [
      {
        code: 'cdsm_side_menu',
        name: 'サイドメニュー',
        options: [
          {
            key: 'link',
            value: '',
          },
        ],
        functions: functions,
      },
      {
        code: 'cdsm_user_menu',
        name: 'ユーザ',
        options: [],
        functions: [
          {
            code: 'cdsm_group_switch_link',
            name: 'グループ変更',
            options: [
              {
                key: 'link',
                value: '/entrance/group/switch',
              },
            ],
            functions: [],
          }
        ],
      },
      {
        code: 'cdsm_back_to_home_link',
        name: 'ホーム',
        options: [
          {
            key: 'link',
            value: '/',
          },
        ],
        functions: [],
      },
      {
        code: 'cdsm_env_setting_menu',
        name: '環境設定',
        options: [],
        functions: [
        ],
      },
      {
          "code": "cdsm_signout_link",
          "options": [
              {
                  "value": "http://login.microsoftonline.com/{tenant_id}/oauth2/logout?post_logout_redirect_uri={logout_redirect_url}",
                  "key": "link"
              }
          ],
          "name": "サインアウト",
          "functions": []
      }
    ],
  };

  if (args.header['x-screencode'] === 'cdsm_mgt_menu') {
    resultData.functions.unshift({
      code: 'cdsm_mgt_menu',
      name: 'メニュー',
      options: [
        {
          key: 'link',
          value: '',
        },
      ],
      functions: functions,
    });
  }

  return {
    status: 200,
    json: {
      result_data: resultData,
    },
  };
};
