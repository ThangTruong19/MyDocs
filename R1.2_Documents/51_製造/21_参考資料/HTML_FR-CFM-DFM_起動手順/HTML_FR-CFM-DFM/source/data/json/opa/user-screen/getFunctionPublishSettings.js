var _ = require('lodash');

module.exports = function(args) {
  var categories = [
    {
      name: '一覧',
      items: [
        'オペレータ識別管理 オペレータ一覧',
        'オペレータ識別管理 IDキー番号一覧',
        'オペレータ識別管理 対象車両一覧（ID入力）',
        'オペレータ識別管理 対象車両一覧（IDキー）',
        '車両管理 一覧',
        '車両管理 引き当て一覧',
        '連絡先管理 一覧',
        '連絡先管理 紐付け一覧',
        '分類管理 分類管理一覧',
        'フラグ管理 フラグ管理一覧',
        'SMRインターバル管理項目管理 対象管理項目一覧',
        'SMRインターバル管理項目管理 車両毎設定一覧',
        'エリア管理 グループエリア一覧',
        'エリア管理 車両毎エリア一覧',
        'ユーザ管理 一覧',
        '顧客管理 一覧',
        'サブグループ管理 一覧',
        '作業履歴管理 作業履歴管理一覧',
        'サービス委託管理 申請一覧',
        'サービス委託管理 承認・却下一覧',
      ],
    },
    {
      name: '管理とてもとてもとても長いメニュー',
      items: [
        'オペレータ識別管理 オペレータID一括登録/変更',
        '車両管理 オペ識別初期化',
        '車両管理 一括登録/一括変更',
        '車両管理 登録',
        '車両管理 端末開始設定',
        '車両管理 端末載せ替え',
        '車両管理 時差設定変更',
        '車両管理 担当代理店変更',
        '連絡先管理 登録',
        '分類管理 登録',
        'フラグ管理 登録',
        'SMRインターバル管理項目管理 登録',
        'エリア管理 登録',
        'ユーザ管理 登録',
        '顧客管理 登録',
        'サブグループ管理 登録',
      ],
    },
  ];

  var mock = {
    result_header: {
      'Cache-Control': 'no-cache',
    },
    result_data: {
      group_function_publish_setting: {
        function_categories: [],
        update_datetime: '2017-05-23T23:59:59.999Z',
        group_label_english: 'groupEn',
        group_label: 'groupA',
        group_id: args.query.group_id || '5',
      },
    },
  };
  var data;
  var authority;

  mock.result_data.group_function_publish_setting.function_categories = createData(
    categories
  );

  return success(mock);
};

function createData(categories) {
  return _.map(categories, (category, index) => ({
    id: String(index + 1),
    order: String(index + 1),
    name: category.name,
    function_publish_settings: createFunctionPublishSettings(
      category.items,
      index
    ),
  }));
}

function createFunctionPublishSettings(categoryItems, baseIndex) {
  return _.map(categoryItems, (item, index) => ({
    id: String(baseIndex * 100 + index + 1),
    order: String(baseIndex * 100 + index + 1),
    name: item,
    external_app_publish_settings: createExternalAppPublishSettings(),
  }));
}

function createExternalAppPublishSettings() {
  var appKinds = [0, 1];
  var appKindNames = ['代理店向け', '顧客向け'];
  var permissionKindNames = ['設定不可', '設定可'];
  var publishKindNames = ['非公開', '公開'];

  return _.map(appKinds, appKind => {
    var permissionKind = _.sample([0, 1]);
    var publishKind = _.sample([0, 1]);
    return {
      permission_kind_name: permissionKindNames[permissionKind],
      permission_kind: String(permissionKind),
      publish_kind_name: publishKindNames[publishKind],
      publish_kind: String(publishKind),
      external_app_kind_name: appKindNames[appKind],
      external_app_kind: String(appKind),
    };
  });
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
