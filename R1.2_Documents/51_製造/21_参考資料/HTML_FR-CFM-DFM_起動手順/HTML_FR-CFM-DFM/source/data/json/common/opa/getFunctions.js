module.exports = function(args) {
  const functions = [
    {
      code: 'opa_system_notification_mgt_menu',
      name: 'システム通知管理',
      options: [],
      functions: [
        {
          code: 'opa_system_notification_mgt_list_link',
          name: 'システム通知管理 一覧',
          options: [
            {
              functions: 'link',
              value: '/system_notifications',
            },
          ],
          functions: [],
        },
        {
          code: 'opa_system_notification_mgt_regist_link',
          name: 'システム通知管理 登録',
          options: [
            {
              functions: 'link',
              value: '/system_notifications/new',
            },
          ],
          functions: [],
        },
      ],
    },
    {
      code: 'opa_custom_car_attribute_mgt_menu',
      name: 'カスタム車両属性管理',
      options: [],
      functions: [
        {
          code: 'opa_custom_car_attribute_mgt_list_link',
          name: 'カスタム車両属性管理 一覧',
          options: [
            {
              functions: 'link',
              value: '/custom_car_attributes',
            },
          ],
          functions: [],
        },
        {
          code: 'opa_custom_car_attribute_mgt_regist_link',
          name: 'カスタム車両属性管理 登録',
          options: [
            {
              functions: 'link',
              value: '/custom_car_attributes/new',
            },
          ],
          functions: [],
        },
      ],
    },
    {
      code: 'opa_macro_report_mgt_menu',
      name: 'Reportマクロ管理',
      options: [],
      functions: [
        {
          code: 'opa_macro_report_mgt_list_link',
          name: 'Reportマクロ管理 表示制御',
          options: [
            {
              functions: 'link',
              value: '/report_macro',
            },
          ],
          functions: [],
        },
      ],
    },
    {
      code: 'opa_service_contract_mgt_menu',
      name: 'サービス委託管理',
      options: [],
      functions: [
        {
          code: 'opa_service_contract_mgt_list_link',
          name: 'サービス委託管理 一覧',
          options: [
            {
              functions: 'link',
              value: '/service_contract',
            },
          ],
          functions: [],
        },
      ],
    },
    {
      code: 'opa_group_mgt_menu',
      name: 'グループ管理',
      options: [],
      functions: [
        {
          code: 'opa_group_mgt_regist_link',
          name: 'グループ管理 登録',
          options: [
            {
              functions: 'link',
              value: '/groups/new',
            },
          ],
          functions: [],
        },
        {
          code: 'opa_group_mgt_list_link',
          name: 'グループ管理 一覧',
          options: [
            {
              functions: 'link',
              value: '/groups',
            },
          ],
          functions: [],
        },
        {
          code: 'opa_group_mgt_publish_setting_group_link',
          name: 'グループ管理 公開設定',
          options: [
            {
              functions: 'link',
              value: '/groups/publish',
            },
          ],
          functions: [],
        },
        {
          code: 'opa_group_mgt_publish_setting_customer_link',
          name: 'グループ管理 顧客公開設定',
          options: [
            {
              functions: 'link',
              value: '/groups/customer_publish',
            },
          ],
          functions: [],
        },
        {
          code: 'opa_group_mgt_integration_link',
          name: 'グループ管理 グループ統合',
          options: [
            {
              functions: 'link',
              value: '/groups/integration',
            },
          ],
          functions: [],
        },
      ],
    },
    {
      code: 'opa_flag_condition_mgt_menu',
      name: 'フラグ条件設定管理',
      options: [],
      functions: [
        {
          code: 'opa_flag_condition_mgt_list_link',
          name: 'フラグ条件設定管理 一覧',
          options: [
            {
              functions: 'link',
              value: '/flag_conditions',
            },
          ],
          functions: [],
        },
        {
          code: 'opa_flag_condition_mgt_regist_link',
          name: 'フラグ条件設定管理 登録',
          options: [
            {
              functions: 'link',
              value: '/flag_conditions/new',
            },
          ],
          functions: [],
        },
      ],
    },
    {
      code: 'opa_user_mgt_menu',
      name: '運用ユーザ管理',
      options: [],
      functions: [
        {
          code: 'opa_user_mgt_user_export_link',
          name: '運用ユーザ管理 ユーザ一覧出力',
          options: [
            {
              functions: 'link',
              value: '/users/export',
            },
          ],
          functions: [],
        },
        {
          code: 'opa_user_mgt_list_link',
          name: '運用ユーザ管理 一覧',
          options: [
            {
              functions: 'link',
              value: '/users',
            },
          ],
          functions: [],
        },
        {
          code: 'opa_user_mgt_regist_link',
          name: '運用ユーザ管理 登録',
          options: [
            {
              functions: 'link',
              value: '/users/new',
            },
          ],
          functions: [],
        },
      ],
    },
    {
      code: 'opa_history_mgt_menu',
      name: '作業履歴管理',
      options: [],
      functions: [
        {
          code: 'opa_history_mgt_list_link',
          name: '作業履歴管理 一覧',
          options: [
            {
              functions: 'link',
              value: '/histories',
            },
          ],
        },
      ],
    },
    {
      code: 'opa_management_car_setting_mgt_menu',
      name: '管理車両設定管理',
      options: [],
      functions: [
        {
          code: 'opa_management_car_setting_mgt_model_setting_link',
          name: '管理車両設定管理 機種設定',
          options: [
            {
              functions: 'link',
              value: '/management_car_setting/model_setting',
            },
          ],
          functions: [],
        },
        {
          code: 'opa_management_car_setting_mgt_model_type_setting_link',
          name: '管理車両設定管理 型式設定',
          options: [
            {
              functions: 'link',
              value: '/management_car_setting/model_type_setting',
            },
          ],
          functions: [],
        },
        {
          code: 'opa_management_car_setting_mgt_maker_setting_link',
          name: '管理車両設定管理 メーカ設定',
          options: [
            {
              functions: 'link',
              value: '/management_car_setting/maker_setting',
            },
          ],
          functions: [],
        },
        {
          code: 'opa_management_car_setting_mgt_div_setting_link',
          name: '管理車両設定管理 車両種類設定',
          options: [
            {
              functions: 'link',
              value: '/management_car_setting/division_setting',
            },
          ],
          functions: [],
        },
        {
          code: 'opa_management_car_setting_mgt_custom_div_regist_link',
          name: '管理車両設定管理 カスタム車種登録',
          options: [
            {
              functions: 'link',
              value: '/management_car_setting/custom_divisions/new',
            },
          ],
          functions: [],
        },
        {
          code: 'opa_management_car_setting_mgt_custom_div_list_link',
          name: '管理車両設定管理 カスタム車種一覧',
          options: [
            {
              functions: 'link',
              value: '/management_car_setting/custom_divisions',
            },
          ],
          functions: [],
        },
      ],
    },
    {
      code: 'opa_business_type_mgt_menu',
      name: '業種管理',
      options: [],
      functions: [
        {
          code: 'opa_business_type_manegement_template_regist_link',
          name: '一括登録/一括変更',
          options: [
            {
              functions: 'link',
              value: '/business_types/batch',
            },
          ],
          functions: [],
        },
        {
          code: 'opa_business_type_manegement_regist_link',
          name: ' 登録',
          options: [
            {
              functions: 'link',
              value: '/business_types/new',
            },
          ],
          functions: [],
        },
        {
          code: 'opa_business_type_manegement_list_link',
          name: ' 一覧',
          options: [
            {
              functions: 'link',
              value: '/business_types',
            },
          ],
          functions: [],
        },
      ],
    },
    {
      code: 'opa_user_screen_mgt_menu',
      name: 'ユーザ画面設定管理',
      options: [],
      functions: [
        {
          code: 'opa_user_screen_mgt_function_publish_setting_link',
          name: 'メニュー設定',
          options: [
            {
              functions: 'link',
              value: '/user_screen/function_publish_setting',
            },
          ],
          functions: [],
        },
        {
          code: 'opa_user_screen_mgt_item_publish_setting_link',
          name: '閲覧画面設定',
          options: [
            {
              functions: 'link',
              value: '/user_screen/item_publish_setting',
            },
          ],
          functions: [],
        },
      ],
    },
  ];

  const resultData = {
    functions: [
      {
        code: 'opa_mgt_side_menu',
        name: 'サイドメニュー',
        options: [
          {
            functions: 'link',
            value: '',
          },
        ],
        functions: functions,
      },
      {
        code: 'opa_user_menu',
        name: 'ユーザ',
        options: [],
        functions: [
          {
            code: 'opa_tos_link',
            name: '使用許諾契約書',
            options: [
              {
                functions: 'link',
                value: '/entrance/tos',
              },
            ],
            functions: [],
          },
          {
            code: 'opa_group_switch_link',
            name: 'グループ変更',
            options: [
              {
                functions: 'link',
                value: '/entrance/group/switch',
              },
            ],
            functions: [],
          },
          {
            code: 'opa_faq_link',
            name: 'FAQ',
            options: [
              {
                functions: 'link',
                value: 'https://google.com',
              },
            ],
            functions: [],
          },
        ],
      },
      {
        code: 'opa_back_to_home_link',
        name: 'ホーム',
        options: [
          {
            key: 'link',
            value: '/',
          },
        ],
        functions: [],
      },
    ],
  };

  if (args.header['x-screencode'] === 'opa_mgt_dashboard') {
    resultData.functions.unshift({
      code: 'opa_mgt_dashboard_menu',
      name: 'メニュー',
      options: [
        {
          functions: 'link',
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
