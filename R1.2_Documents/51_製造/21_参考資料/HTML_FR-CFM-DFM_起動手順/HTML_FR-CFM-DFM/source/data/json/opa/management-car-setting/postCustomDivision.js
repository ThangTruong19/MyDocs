var validation = require('../../common/validation.js');

module.exports = function(args) {
  var errorData;
  errorData = validation(args.body);
  if (errorData.length > 0) {
    return fail(errorData);
  }

  errorData = validation(args.body, 'system_error');
  if (errorData.length > 0) {
    return fail500(errorData);
  }

  var mock = {
    result_data: {
      custom_division: {
        update_datetime: '2017-11-14T20:36:23.386Z',
        group_id: '17929',
        group_label: 'コマツ関東建設グループ',
        group_label_english: 'KOMATSU-KANTO-KENSETSU GROUP',
        id: '1',
        names: [
          {
            label: '油圧ショベル',
            lang_code: 'ja-JP',
            lang_name: '日本語',
          },
        ],
        models: [
          {
            maker_id: '302',
            maker_code: '0001',
            maker_name: 'コマツ',
            division_id: '1',
            division_code: '0001',
            division_name: '油圧ショベル',
            model_id: '4321',
            model: 'PC100',
            types: [
              {
                id: '1111',
                type_rev: '10M0',
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

function fail500() {
  return {
    status: 500,
    json: {
      error_data: [
        {
          code: 'ACOM0001F',
          message: 'システムエラーが発生しております。',
          keys: [],
        },
      ],
    },
  };
}
