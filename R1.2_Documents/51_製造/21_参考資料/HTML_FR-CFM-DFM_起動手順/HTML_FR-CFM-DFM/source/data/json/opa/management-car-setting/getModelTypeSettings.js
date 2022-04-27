const _ = require('lodash');

module.exports = function(args) {
  var mock = {
    result_data: {
      model_type_setting: {
        update_datetime: '2017-11-14T19:12:38.466Z',
        group_id: args.query.group_id || '1',
        group_label: 'コマツ関東建設グループ',
        group_label_english: 'KOMATSU-KANTO-KENSETSU GROUP',
        models: [],
      },
    },
  };

  // グループ：「グループ2」選択時は検索結果を0件とする
  if (args.query.group_id !== '4' && args.query.division_code !== '0002') {
    mock.result_data.model_type_setting.models.push(
      createData('1', 'PC100', args.query)
    );
    mock.result_data.model_type_setting.models.push(
      createData('2', 'PC300', args.query)
    );
  }

  if (args.query.group_id !== '4' && args.query.division_code !== '0001') {
    mock.result_data.model_type_setting.models.push(
      createData('3', 'PD200', args.query)
    );
  }

  if (args.query.models === 'test') {
    mock.result_data.model_type_setting.models = [];
    mock.result_data.model_type_setting.models.push(
      createData('1', 'PC100', args.query, 3)
    );
  }

  return success(mock);
};

function createData(modelID, modelName, query, count = 50) {
  var types = _.compact(
    _.map(_.times(count), function(index) {
      var active_kind = +(modelID !== '2' && index < 5);

      if (query.active_kind === '1' && !active_kind) {
        return null;
      }

      if (query.model === 'a' && index < 3) {
        return null;
      }

      return {
        id: modelID + index,
        type_rev: '10M' + modelID + index,
        active_kind: '' + active_kind,
        active_name: ['無効', '有効'][active_kind],
        icon_font: {
          id: '1',
          no: '65',
        },
      };
    })
  );

  return {
    types,
    maker_id: '302',
    maker_code: '0302',
    maker_name: 'コマツ開発',
    division_id: '1',
    division_code: '0001',
    division_name: '油圧ショベル',
    model_id: modelID,
    model: modelName,
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
