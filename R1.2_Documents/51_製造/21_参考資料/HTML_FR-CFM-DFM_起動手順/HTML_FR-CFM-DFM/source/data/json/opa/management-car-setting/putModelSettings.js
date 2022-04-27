var validation = require('../../common/validation.js');

module.exports = function(args) {
  var errorData = [];

  if (
    args.body.model_setting.models.find(model => model.model === 'PC100 19') !=
    null
  ) {
    errorData.push({
      keys: ['model_setting.models.maker_code'],
      message: '{{model_setting.models.maker_code}}が不正です。',
      code: 'ERROR',
    });
  }

  if (
    args.body.model_setting.models.find(model => model.model === 'PC100 29') !=
    null
  ) {
    errorData.push({
      keys: ['model_setting.models.model'],
      message: '{{model_setting.models.model}}が不正です。',
      code: 'ERROR',
    });
  }

  if (errorData.length > 0) {
    return fail(errorData);
  }

  var mock = {
    result_data: {
      model_setting: {
        update_datetime: '2017-11-14T20:36:23.386Z',
        group_id: '17929',
        group_label: 'コマツ関東建設グループ',
        group_label_english: 'KOMATSU-KANTO-KENSETSU GROUP',
        maker_divisions: [
          {
            maker_id: '302',
            maker_code: '0302',
            maker_name: 'コマツ開発',
            division_id: '1',
            division_code: '0001',
            division_name: '油圧ショベル',
            models: [
              {
                id: '4321',
                model: 'PC100',
                active_kind: '1',
                active_name: '有効',
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
