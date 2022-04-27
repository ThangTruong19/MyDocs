module.exports = function (args) {
  const functions = [
    {
      code: 'flm_operator_mgt_menu',
      name: 'オペレータ識別管理',
      options: [],
      functions: [
        {
          code: 'flm_operator_mgt_template_regist_link',
          name: 'オペレータID一括登録/変更',
          options: [
            {
              key: 'link',
              value: '/operators/batch',
            },
          ],
          functions: [],
        },
        {
          code: 'flm_operator_mgt_list_link',
          name: 'オペレータID一覧',
          options: [
            {
              key: 'link',
              value: '/operators',
            },
          ],
          functions: [],
        },
        {
          code: 'flm_operator_mgt_id_key_list_link',
          name: 'IDキー番号一覧',
          options: [
            {
              key: 'link',
              value: '/operators/id_keys',
            },
          ],
          functions: [],
        },
        {
          code: 'flm_operator_mgt_car_id_input_list_link',
          name: '対象車両一覧(ID入力)',
          options: [
            {
              key: 'link',
              value: '/operators/cars/id_input',
            },
          ],
          functions: [],
        },
        {
          code: 'flm_operator_mgt_car_id_key_list_link',
          name: '対象車両一覧(IDキー)',
          options: [
            {
              key: 'link',
              value: '/operators/cars/id_key',
            },
          ],
          functions: [],
        },
      ],
    },
    {
      code: 'flm_car_mgt_menu',
      name: '車両管理',
      options: [],
      functions: [
        {
          code: 'flm_car_mgt_operator_initialize_link',
          name: 'オペ識別初期化',
          options: [
            {
              key: 'link',
              value: '/cars/operators/init',
            },
          ],
          functions: [],
        },
        {
          code: 'flm_car_mgt_template_regist_link',
          name: '一括登録/一括変更',
          options: [
            {
              key: 'link',
              value: '/cars/batch',
            },
          ],
          functions: [],
        },
        {
          code: 'flm_car_mgt_regist_link',
          name: '登録',
          options: [
            {
              key: 'link',
              value: '/cars/new',
            },
          ],
          functions: [],
        },
        {
          code: 'flm_car_mgt_list_link',
          name: '一覧',
          options: [
            {
              key: 'link',
              value: '/cars',
            },
          ],
          functions: [],
        },
        {
          code: 'flm_car_mgt_terminal_start_setting_link',
          name: '端末開始設定',
          options: [
            {
              key: 'link',
              value: '/cars/terminal/start_setting',
            },
          ],
        },
        {
          code: 'flm_car_mgt_terminal_change_link',
          name: '端末載せ替え',
          options: [
            {
              key: 'link',
              value: '/cars/terminal/change',
            },
          ],
          functions: [],
        },
        {
          code: 'flm_car_mgt_time_difference_setting_link',
          name: '時差設定変更',
          options: [
            {
              key: 'link',
              value: '/cars/time_difference_setting',
            },
          ],
          functions: [],
        },
      ],
    },
    {
      code: 'flm_contact_mgt_menu',
      name: '連絡先管理',
      options: [],
      functions: [
        {
          code: 'flm_contact_mgt_regist_link',
          name: '登録',
          options: [
            {
              key: 'link',
              value: '/contacts/new',
            },
          ],
          functions: [],
        },
        {
          code: 'flm_contact_mgt_list_link',
          name: '一覧',
          options: [
            {
              key: 'link',
              value: '/contacts',
            },
          ],
          functions: [],
        },
        {
          code: 'flm_contact_mgt_customer_list_link',
          name: '紐付け一覧',
          options: [
            {
              key: 'link',
              value: '/contacts/customers',
            },
          ],
          functions: [],
        },
      ],
    },
    {
      code: 'flm_class_mgt_menu',
      name: '分類管理',
      options: [],
      functions: [
        {
          code: 'flm_class_mgt_regist_link',
          name: '登録',
          options: [
            {
              key: 'link',
              value: '/classes/new',
            },
          ],
          functions: [],
        },
        {
          code: 'flm_class_mgt_list_link',
          name: '分類管理一覧',
          options: [
            {
              key: 'link',
              value: '/classes',
            },
          ],
          functions: [],
        },
      ],
    },
    {
      code: 'flm_flag_condition_mgt_menu',
      name: 'フラグ管理',
      options: [],
      functions: [
        {
          code: 'flm_flag_condition_mgt_regist_link',
          name: '登録',
          options: [
            {
              key: 'link',
              value: '/flags/new',
            },
          ],
          functions: [],
        },
        {
          code: 'flm_flag_condition_mgt_list_link',
          name: 'フラグ管理一覧',
          options: [
            {
              key: 'link',
              value: '/flags',
            },
          ],
          functions: [],
        },
      ],
    },
    {
      code: 'flm_smr_interval_mgt_menu',
      name: 'SMRインターバル管理項目管理',
      options: [],
      functions: [
        {
          code: 'flm_smr_interval_mgt_regist_link',
          name: '登録',
          options: [
            {
              key: 'link',
              value: '/smr_interval/new',
            },
          ],
          functions: [],
        },
        {
          code: 'flm_smr_interval_mgt_list_link',
          name: '対象管理項目一覧',
          options: [
            {
              key: 'link',
              value: '/smr_interval',
            },
          ],
          functions: [],
        },
        {
          code: 'flm_smr_interval_mgt_car_list_link',
          name: '車両毎設定一覧',
          options: [
            {
              key: 'link',
              value: '/smr_interval/cars',
            },
          ],
          functions: [],
        },
      ],
    },
    {
      code: 'flm_group_mgt_menu',
      name: 'エリア管理',
      options: [],
      functions: [
        {
          code: 'flm_group_mgt_regist_link',
          name: 'グループエリア登録',
          options: [
            {
              key: 'link',
              value: '/group_area/new',
            },
          ],
          functions: [],
        },
        {
          code: 'flm_group_mgt_list_link',
          name: 'グループエリア一覧',
          options: [
            {
              key: 'link',
              value: '/group_area',
            },
          ],
          functions: [],
        },
        {
          code: 'flm_group_mgt_car_list_link',
          name: '車両毎エリア一覧',
          options: [
            {
              key: 'link',
              value: '/group_area/cars',
            },
          ],
          functions: [],
        },
      ],
    },
    {
      code: 'flm_user_mgt_menu',
      name: 'ユーザ管理',
      options: [],
      functions: [
        {
          code: 'flm_user_mgt_regist_link',
          name: '登録',
          options: [
            {
              key: 'link',
              value: '/users/new',
            },
          ],
          functions: [],
        },
        {
          code: 'flm_user_mgt_list_link',
          name: '一覧',
          options: [
            {
              key: 'link',
              value: '/users',
            },
          ],
          functions: [],
        },
      ],
    },
    {
      code: 'flm_customer_mgt_menu',
      name: '顧客管理',
      options: [],
      functions: [
        {
          code: 'flm_customer_mgt_template_regist_link',
          name: '一括登録/変更',
          options: [
            {
              key: 'link',
              value: '/customers/batch',
            },
          ],
          functions: [],
        },
        {
          code: 'flm_customer_mgt_regist_link',
          name: '登録',
          options: [
            {
              key: 'link',
              value: '/customers/new',
            },
          ],
          functions: [],
        },
        {
          code: 'flm_customer_mgt_list_link',
          name: '一覧',
          options: [
            {
              key: 'link',
              value: '/customers',
            },
          ],
          functions: [],
        },
      ],
    },
    {
      code: 'flm_subgroup_mgt_menu',
      name: 'サブグループ管理',
      options: [],
      functions: [
        {
          code: 'flm_subgroup_mgt_regist_link',
          name: '登録',
          options: [
            {
              key: 'link',
              value: '/subgroups/new',
            },
          ],
          functions: [],
        },
        {
          code: 'flm_subgroup_mgt_list_link',
          name: '一覧',
          options: [
            {
              key: 'link',
              value: '/subgroups',
            },
          ],
          functions: [],
        },
      ],
    },
    {
      code: 'flm_history_mgt_menu',
      name: '作業履歴管理',
      options: [],
      functions: [
        {
          code: 'flm_history_mgt_list_link',
          name: '作業履歴管理 一覧',
          options: [
            {
              key: 'link',
              value: '/histories',
            },
          ],
          functions: [],
        },
      ],
    },
    {
      code: 'flm_service_contract_mgt_menu',
      name: 'サービス委託管理',
      options: [],
      functions: [
        {
          code: 'flm_service_contract_mgt_consignor_list_link',
          name: '申請一覧',
          options: [
            {
              key: 'link',
              value: '/service_contracts/consignors',
            },
          ],
          functions: [],
        },
        {
          code: 'flm_service_contract_mgt_consignee_list_link',
          name: '承認・却下一覧',
          options: [
            {
              key: 'link',
              value: '/service_contracts/consignees',
            },
          ],
          functions: [],
        },
      ],
    },
    {
      code: 'flm_accum_fuel_interval_mgt_menu',
      name: '累積燃料消費量インターバル管理',
      options: [],
      functions: [
        {
          code: 'flm_accum_fuel_interval_mgt_regist_link',
          name: '登録',
          options: [
            {
              key: 'link',
              value: '/fuel_interval_items/new',
            },
          ],
          functions: [],
        },
        {
          code: 'flm_accum_fuel_interval_mgt_list_link',
          name: '一覧',
          options: [
            {
              key: 'link',
              value: '/fuel_interval_items',
            },
          ],
          functions: [],
        },
        {
          code: 'flm_accum_fuel_interval_mgt_car_list_link',
          name: '車両毎設定一覧',
          options: [
            {
              key: 'link',
              value: '/fuel_interval_items/cars',
            },
          ],
          functions: [],
        },
      ],
    },
    {
      code: 'flm_rental_car_mgt_menu',
      name: 'レンタル車両管理',
      options: [],
      functions: [
        {
          code: 'flm_rental_car_mgt_list',
          name: '一覧',
          options: [
            {
              key: 'link',
              value: '/rental_cars',
            },
          ],
        },
      ],
    },
    {
      code: 'flm_landmark_mgt_menu',
      name: 'ランドマーク管理',
      options: [],
      functions: [
        {
          code: 'flm_landmark_mgt_regist_link',
          name: '登録',
          options: [
            {
              key: 'link',
              value: '/landmarks/new',
            },
          ],
          functions: [],
        },
        {
          code: 'flm_landmark_mgt_list_link',
          name: '一覧',
          options: [
            {
              key: 'link',
              value: '/landmarks',
            },
          ],
          functions: [],
        },
      ],
    },
    {
      code: 'flm_support_distributor_chg_mgt_menu',
      name: '担当代理店変更管理',
      options: [],
      functions: [
        {
          code: 'flm_support_distributor_chg_mgt_consignor_list_link',
          name: '申請',
          options: [
            {
              key: 'link',
              value: '/support_distributor_change/consignor',
            },
          ],
          functions: [],
        },
        {
          code: 'flm_support_distributor_chg_mgt_consignee_list_link',
          name: '承認',
          options: [
            {
              key: 'link',
              value: '/support_distributor_change/consignee',
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
        code: 'flm_admin_menu',
        name: '管理',
        options: [],
        functions: [
          {
            code: 'flm_admin_menu_link',
            name: '管理メニュー',
            options: [
              {
                key: 'link',
                value: '/',
              },
            ],
            functions: [],
          },
          {
            code: 'flm_news_redirect_link',
            name: 'お知らせ転送',
            options: [
              {
                key: 'link',
                value: '/',
              },
            ],
            functions: [],
          },
          {
            code: 'flm_field_based_admin_link',
            name: '現場単位管理',
            options: [
              {
                key: 'link',
                value: '/site-management/site',
              },
            ],
            functions: [],
          },
        ],
      },
      {
        code: 'flm_mgt_side_menu',
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
        code: 'flm_user_menu',
        name: 'ユーザ',
        options: [],
        functions: [
          {
            code: 'flm_tos_link',
            name: '使用許諾契約書',
            options: [
              {
                key: 'link',
                value: '/entrance/tos',
              },
            ],
            functions: [],
          },
          {
            code: 'flm_group_switch_link',
            name: 'グループ変更',
            options: [
              {
                key: 'link',
                value: '/entrance/group/switch',
              },
            ],
            functions: [],
          },
          {
            code: 'flm_faq_link',
            name: 'FAQ',
            options: [
              {
                key: 'link',
                value: 'https://google.com',
              },
            ],
            functions: [],
          },
          {
            code: 'flm_faq_admin_link',
            name: '管理メニューFAQ',
            options: [
              {
                key: 'link',
                value: 'https://google.com',
              },
            ],
            functions: [],
          },
        ],
      },
      {
        code: 'flm_back_to_home_link',
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
        code: 'flm_car_detail_link',
        name: '車両詳細',
        options: [
          {
            key: 'link',
            value: '/',
          },
        ],
        functions: [],
      },
      {
        code: 'flm_car_mgt_list_delete_function',
        name: '車両一覧 削除',
        options: [],
        functions: [],
      },
      {
        code: 'flm_car_mgt_time_difference_setting_delete_function',
        name: '車両時差設定 削除',
        options: [],
        functions: [],
      },
      {
        code: 'flm_env_setting_menu',
        name: '環境設定',
        options: [],
        functions: [
          {
            code: 'flm_start_page_function',
            name: '初期表示ページ',
            options: [],
            functions: [],
          },
        ],
      },
    ],
  };

  if (args.header['x-screencode'] === 'flm_mgt_dashboard') {
    resultData.functions.unshift({
      code: 'flm_mgt_dashboard_menu',
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
