var _ = require('lodash');

module.exports = function(args) {
  var categories = [
    {
      name: '一覧表示項目',
      items: _.map(_.range(1, 7), n => `一覧項目表示-${n}`),
    },
    {
      name: '検索条件表示項目',
      items: _.map(_.range(1, 8), n => `検索条件表示項目-${n}`),
    },
    {
      name: '項目名A',
      items: _.map(_.range(1, 5), n => `項目名A-${n}`),
    },
    {
      name: '項目名BDolor aute mollit cillum minim tempor incididunt voluptate amet nisi.',
      items: _.map(_.range(1, 7), n => `項目名B-${n}`),
    },
  ];

  var mock = {
    result_header: {
      'Cache-Control': 'no-cache',
    },
    result_data: {
      group_item_publish_setting: {
        item_categories: [],
        update_datetime: '2017-05-23T23:59:59.999Z',
        paper_size_name: 'レターサイズ81/2x11インチ',
        paper_size_id: '2',
        display_count: 20,
        group_label_english: 'groupEn',
        group_label: 'groupA',
        group_id: args.query.group_id || '5',
      },
    },
  };
  var data;
  var authority;

  mock.result_data.group_item_publish_setting.item_categories = createData(
    categories
  );

  return success(mock);
};

function createData(categories) {
  return _.map(categories, (category, index) => ({
    id: String(index + 1),
    order: String(index + 1),
    name: category.name,
    item_publish_settings: createPublishSettings(category.items, index),
  }));
}

function createPublishSettings(categoryItems, baseIndex) {
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
