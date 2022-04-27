const _ = require('lodash');

module.exports = function(args) {
  var makers =
    args.query.group_id !== '2' ? _.times(20, i => createData(i)) : [];

  var mock = {
    result_data: {
      maker_setting: {
        update_datetime: '2017-11-14T19:12:38.466Z',
        group_id: args.query.group_id || '1',
        group_label: 'コマツ関東建設グループ',
        group_label_english: 'KOMATSU-KANTO-KENSETSU GROUP',
        makers,
      },
    },
  };

  return success(mock);
};

function createData(i) {
  var active_kind = +(i < 5);

  return {
    id: '' + i,
    code: '0' + i,
    name: 'コマツ' + i,
    active_kind: '' + active_kind,
    active_name: ['無効', '有効'][active_kind],
  };
}

function success(data) {
  return {
    status: 200,
    json: {
      result_data: data.result_data,
    },
  };
}

function fail(msg) {
  return {
    status: 400,
    json: {
      error_data: [
        {
          code: 'ERR0001',
          message: msg,
          key: '???',
        },
      ],
    },
  };
}
