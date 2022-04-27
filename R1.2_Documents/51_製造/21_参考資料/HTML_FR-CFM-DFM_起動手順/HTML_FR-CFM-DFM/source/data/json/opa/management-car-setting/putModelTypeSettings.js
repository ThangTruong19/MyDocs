var validation = require('../../common/validation.js');

module.exports = function(args) {
  var errorData = [];

  console.log(args.body.model_type_setting);

  if (
    args.body.model_type_setting.model_types.find(
      modelType => modelType.type_rev === '10M19'
    ) != null
  ) {
    errorData.push({
      keys: ['model_type_setting.model_types.maker_code'],
      message: '{{model_type_setting.model_types.maker_code}}が不正です。',
      code: 'ERROR',
    });
  }

  if (
    args.body.model_type_setting.model_types.find(
      modelType => modelType.type_rev === '10M29'
    ) != null
  ) {
    errorData.push({
      keys: ['model_type_setting.model_types.model'],
      message: '{{model_type_setting.model_types.model}}が不正です。',
      code: 'ERROR',
    });
  }

  if (
    args.body.model_type_setting.model_types.find(
      modelType => modelType.type_rev === '10M39'
    ) != null
  ) {
    errorData.push({
      keys: ['model_type_setting.model_types.type_rev'],
      message: '{{model_type_setting.model_types.type_rev}}が不正です。',
      code: 'ERROR',
    });
  }

  if (errorData.length > 0) {
    return fail(errorData);
  }

  var mock = {
    result_data: {
      model_type_setting: {
        update_datetime: '2017-11-14T20:36:23.386Z',
        group_id: '17929',
        group_label: 'コマツ関東建設グループ',
        group_label_english: 'KOMATSU-KANTO-KENSETSU GROUP',
        models: [
          {
            maker_id: '302',
            maker_code: '0302',
            maker_name: 'コマツ開発',
            division_id: '1',
            division_code: '0001',
            division_name: '油圧ショベル',
            model_id: '4321',
            model: 'PC100',
            types: [
              {
                id: '1111',
                type_rev: '10M0',
                active_kind: '1',
                active_name: '有効',
                icon_font: {
                  id: '1',
                  no: '65',
                },
              },
            ],
          },
        ],
      },
    },
  };

  return success(mock);
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
