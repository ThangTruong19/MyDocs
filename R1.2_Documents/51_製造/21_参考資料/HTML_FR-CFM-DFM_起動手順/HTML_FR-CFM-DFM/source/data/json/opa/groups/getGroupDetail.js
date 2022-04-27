var pickAvailableResponse = require("../../common/pickAvailableResponse");

module.exports = function(args) {
  var xFields = args.header["x-fields"];
  var id = args.params.id || "1";
  var data = pickAvailableResponse(createData(+id));

  return success(data);
  // return fail500();
};

function createData(i) {
  var group = {};

  var groupKinds = [
    {
      key: "BU",
      value: "4",
      kind: "D"
    },
    {
      key: "Block",
      value: "5",
      kind: "D"
    },
    {
      key: "工場",
      value: "6",
      kind: "D"
    },
    {
      key: "DU",
      value: "7",
      kind: "D"
    },
    {
      key: "DB",
      value: "8",
      kind: "D"
    },
    {
      key: "銀行",
      value: "12",
      kind: "D"
    },
    {
      key: "保険",
      value: "13",
      kind: "D"
    },
    {
      key: "ファイナンス",
      value: "14",
      kind: "D"
    },
    {
      key: "グローバル顧客",
      value: "9",
      kind: "D"
    },
    {
      key: "広域顧客",
      value: "10",
      kind: "D"
    }
  ];

  group.identification = {
    id: "" + i,
    label: "グループ名称",
    label_english: "group name",
    organization_code: "ABBESS",
    kind_id: groupKinds[i % 10].value,
    kind_name: groupKinds[i % 10].key,
    update_datetime: "2017-08-01T23:59:59.000Z"
  };

  group.rental_car_business = {
    name: "非対応",
    kind: "1"
  };

  group.attribute = {
    first_day_of_week_name: "月曜日",
    first_day_of_week_kind: "1",
    phone_no: "0312345678",
    email: "example@example.jp",
    address: "青森県青森市青森町2-10",
    nation_code: "JP",
    nation_name: "日本",
    time_difference: "+0900",
    publish_kind: "" + (i % 2),
    publish_name: "公開有",
    customer_publish_group_label: "公開名称1"
  };

  group.map_application = {
    id: "0",
    name: "GoogleMaps"
  };

  group.default_lang = {
    name: "日本語",
    code: "ja-JP"
  };

  if (i % 10 === 0 || i % 10 === 1) {
    group.map_application.lang_code = "en-US";
    group.map_application.lang_name = "英語";

    group.langs = [
      {
        code: "ja-JP",
        name: "日本語"
      },
      {
        code: "en-US",
        name: "英語"
      }
    ];

    group.map = {
      properties: {
        magnification: "5"
      },
      geometry: {
        coordinates: [139.766027, 35.681657],
        type: "Point"
      },
      type: "Feature"
    };
  }

  group.configuration_groups = [
    {
      id: "2",
      label: "ブロック2",
      label_english: "block2",
      kind_id: "12",
      kind_name: "リージョン2"
    },
    {
      id: "3",
      label: "ブロック3",
      label_english: "block3",
      kind_id: "13",
      kind_name: "リージョン3"
    }
  ];

  if (i % 10 === 8) {
    group.publish_target = {
      global_kind: "1",
      global_name: "個別",
      regions: [
        {
          id: "1",
          label: "リージョン1",
          label_english: "region1"
        },
        {
          id: "2",
          label: "リージョン2",
          label_english: "region2"
        }
      ]
    };
  }

  if (i % 10 === 2) {
    group.child_plants = [
      {
        id: "1",
        label: "チャイルド工場1",
        label_english: "Child Plant"
      },
      {
        id: "2",
        label: "チャイルド工場2",
        label_english: "Child Plant"
      }
    ];
  }

  group.represent_administrator = {
    user_id: "200" + i,
    email: "test-jp" + i + "@example.com",
    user_account: "test-jp" + i + "@account.example.com",
    user_label: "小松太郎 日本" + i,
    user_label_english: "komatsu tarou jp" + i,
    nation_name: "日本",
    nation_code: "JP",
    company_label_english: "Komatsu Tokyo",
    company_label: "コマツ東京" + i
  };

  group.administrator_role = {
    id: "66666",
    name: "管理者権限",
    authorities: []
  };

  group.general_role = {
    id: "88888",
    name: "一般権限",
    authorities: []
  };

  group.administrator_role.authorities.push({
    id: "1",
    name: "権限1",
    default_kind: "1",
    default_kind_name: "ON"
  });

  group.general_role.authorities.push({
    id: "1",
    name: "権限1",
    default_kind: "0",
    default_kind_name: "OFF"
  });

  if (i % 10 === 1) {
    group.preset_roles = [
      {
        group_kind_id: "14",
        group_kind_name: "ファイナンス",
        group_kind_order: 62,
        authorities: [
          {
            id: "94",
            name: "作業履歴",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "95",
            name: "ユーザ管理権限（登録／削除／変更／権限付与）",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "116",
            name: "カレンダ予約ロック権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "114",
            name: "強制ロック権限/パスワードロック権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "115",
            name: "夜間予約ロック権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "101",
            name: "注目車両管理権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "107",
            name: "エラー情報の参照権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "108",
            name: "交換時期情報の参照権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "110",
            name: "通信不良記録閲覧権限",
            default_kind: "1",
            default_kind_name: "ON"
          }
        ]
      },
      {
        group_kind_id: "13",
        group_kind_name: "保険",
        group_kind_order: 61,
        authorities: [
          {
            id: "94",
            name: "作業履歴",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "95",
            name: "ユーザ管理権限（登録／削除／変更／権限付与）",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "116",
            name: "カレンダ予約ロック権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "114",
            name: "強制ロック権限/パスワードロック権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "115",
            name: "夜間予約ロック権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "101",
            name: "注目車両管理権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "107",
            name: "エラー情報の参照権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "108",
            name: "交換時期情報の参照権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "110",
            name: "通信不良記録閲覧権限",
            default_kind: "1",
            default_kind_name: "ON"
          }
        ]
      },
      {
        group_kind_id: "12",
        group_kind_name: "銀行",
        group_kind_order: 60,
        authorities: [
          {
            id: "94",
            name: "作業履歴",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "101",
            name: "注目車両管理権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "108",
            name: "交換時期情報の参照権限",
            default_kind: "1",
            default_kind_name: "ON"
          }
        ]
      },
      {
        group_kind_id: "11",
        group_kind_name: "顧客",
        group_kind_order: 52,
        authorities: [
          {
            id: "94",
            name: "作業履歴",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "133",
            name: "オペレータ識別設定管理権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "127",
            name: "オペレータ識別管理権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "101",
            name: "注目車両管理権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "104",
            name: "ランドマーク管理権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "108",
            name: "交換時期情報の参照権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "129",
            name: "要求（IDリスト情報）権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "103",
            name: "オペレータ稼動情報参照権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "226",
            name: "オペレータ名称参照権限",
            default_kind: "1",
            default_kind_name: "ON"
          }
        ]
      },
      {
        group_kind_id: "8",
        group_kind_name: "代理店",
        group_kind_order: 41,
        authorities: [
          {
            id: "94",
            name: "作業履歴",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "271",
            name: "操作履歴閲覧権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "95",
            name: "ユーザ管理権限（登録／削除／変更／権限付与）",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "113",
            name: "複数車両ロック権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "120",
            name: "SMS送信権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "119",
            name: "お知らせ転送権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "133",
            name: "オペレータ識別設定管理権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "116",
            name: "カレンダ予約ロック権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "117",
            name: "パスワードクリア権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "112",
            name: "メッセージ送受信権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "97",
            name: "レンタル車両管理権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "114",
            name: "強制ロック権限/パスワードロック権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "286",
            name: "車両管理権限(削除)",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "96",
            name: "車両管理権限（登録／変更）",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "115",
            name: "夜間予約ロック権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "109",
            name: "範囲外管理権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "126",
            name: "SMR間隔管理項目設定権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "127",
            name: "オペレータ識別管理権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "135",
            name: "サービス委託管理権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "118",
            name: "サブグループ管理権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "102",
            name: "サブグループ参照権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "136",
            name: "フラグ条件設定権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "99",
            name: "顧客管理権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "100",
            name: "顧客権限情報一括更新権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "101",
            name: "注目車両管理権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "98",
            name: "分類管理権限（登録／削除／変更）",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "131",
            name: "累積燃料消費量管理権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "107",
            name: "エラー情報の参照権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "104",
            name: "ランドマーク管理権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "108",
            name: "交換時期情報の参照権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "125",
            name: "KDPF要求権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "129",
            name: "要求（IDリスト情報）権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "106",
            name: "要求（エラー情報）権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "128",
            name: "要求（オペ識別情報）権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "111",
            name: "要求（交換時期）権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "130",
            name: "連絡先管理権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "123",
            name: "KOMTRAX端末状態対応編集権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "103",
            name: "オペレータ稼動情報参照権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "226",
            name: "オペレータ名称参照権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "122",
            name: "サービス対応編集権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "124",
            name: "セキュリティ対応編集権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "284",
            name: "端末交換操作権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "110",
            name: "通信不良記録閲覧権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "105",
            name: "要求（基本情報）権限",
            default_kind: "1",
            default_kind_name: "ON"
          }
        ]
      },
      {
        group_kind_id: "7",
        group_kind_name: "代理店・ユニオン",
        group_kind_order: 40,
        authorities: [
          {
            id: "94",
            name: "作業履歴",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "271",
            name: "操作履歴閲覧権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "95",
            name: "ユーザ管理権限（登録／削除／変更／権限付与）",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "113",
            name: "複数車両ロック権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "120",
            name: "SMS送信権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "119",
            name: "お知らせ転送権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "133",
            name: "オペレータ識別設定管理権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "116",
            name: "カレンダ予約ロック権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "117",
            name: "パスワードクリア権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "112",
            name: "メッセージ送受信権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "97",
            name: "レンタル車両管理権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "114",
            name: "強制ロック権限/パスワードロック権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "96",
            name: "車両管理権限（登録／変更）",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "115",
            name: "夜間予約ロック権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "109",
            name: "範囲外管理権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "126",
            name: "SMR間隔管理項目設定権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "127",
            name: "オペレータ識別管理権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "135",
            name: "サービス委託管理権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "118",
            name: "サブグループ管理権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "102",
            name: "サブグループ参照権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "136",
            name: "フラグ条件設定権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "99",
            name: "顧客管理権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "100",
            name: "顧客権限情報一括更新権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "101",
            name: "注目車両管理権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "98",
            name: "分類管理権限（登録／削除／変更）",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "131",
            name: "累積燃料消費量管理権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "107",
            name: "エラー情報の参照権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "104",
            name: "ランドマーク管理権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "108",
            name: "交換時期情報の参照権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "125",
            name: "KDPF要求権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "129",
            name: "要求（IDリスト情報）権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "106",
            name: "要求（エラー情報）権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "128",
            name: "要求（オペ識別情報）権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "111",
            name: "要求（交換時期）権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "130",
            name: "連絡先管理権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "123",
            name: "KOMTRAX端末状態対応編集権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "103",
            name: "オペレータ稼動情報参照権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "226",
            name: "オペレータ名称参照権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "122",
            name: "サービス対応編集権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "124",
            name: "セキュリティ対応編集権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "110",
            name: "通信不良記録閲覧権限",
            default_kind: "1",
            default_kind_name: "ON"
          },
          {
            id: "105",
            name: "要求（基本情報）権限",
            default_kind: "1",
            default_kind_name: "ON"
          }
        ]
      }
    ];
  }

  return group;
}

function success(group) {
  return {
    status: 200,
    json: {
      result_data: {
        group
      }
    }
  };
}

function fail500() {
  return {
    status: 500,
    json: {
      error_data: [
        {
          code: "ACOM0001F",
          message: "システムエラーが発生しております。",
          keys: []
        }
      ]
    }
  };
}
