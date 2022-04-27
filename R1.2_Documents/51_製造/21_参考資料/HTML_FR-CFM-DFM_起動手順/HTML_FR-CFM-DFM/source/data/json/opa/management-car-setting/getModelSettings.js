const _ = require('lodash');

module.exports = function(args) {
  var mock = {
    result_data: {
      model_setting: {
        update_datetime: '2017-11-14T19:12:38.466Z',
        group_id: args.query.group_id || '1',
        group_label: 'コマツ関東建設グループ',
        group_label_english: 'KOMATSU-KANTO-KENSETSU GROUP',
        maker_divisions: [],
      },
    },
  };

  // グループ：「リージョン2」選択時は検索結果を0件とする
  if (args.query.group_id !== '2' && args.query.division_code !== '0002')
    mock.result_data.model_setting.maker_divisions.push(
      createData('1', '0001', '油圧ショベル', args.query)
    );

  if (args.query.group_id !== '2' && args.query.division_code !== '0001')
    mock.result_data.model_setting.maker_divisions.push(
      createData('2', '0002', 'ホイールローダ', args.query)
    );

  if (args.query.models === 'test') {
    mock.result_data.model_setting.maker_divisions = [];
    mock.result_data.model_setting.maker_divisions.push(
      createData('1', 'PC100', '油圧ショベル', args.query, 3)
    );
  }

  return success(mock);
};

function createData(divisionID, divisionCode, divisionName, query, count = 50) {
  var models = _.compact(
    _.map(_.times(count), function(index) {
      var active_kind = +(divisionID !== '2' && index < 5);

      if (query.active_kind === '1' && !active_kind) {
        return null;
      }

      if (query.model === 'a' && index < 3) {
        return null;
      }

      return {
        id: divisionID + index,
        model: 'PC100 ' + divisionID + index,
        active_kind: '' + active_kind,
        active_name: ['無効', '有効'][active_kind],
      };
    })
  );

  return {
    models,
    maker_id: '302',
    maker_code: '0302',
    maker_name: 'コマツ開発',
    division_id: divisionID,
    division_code: divisionCode,
    division_name: divisionName,
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
