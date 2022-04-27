var validation = require('../../common/validation.js');
var pickAvailableResponse = require('../../common/pickAvailableResponse');
var moment = require('moment');

module.exports = function(args) {
  // var systemErrorData = validation(args.query, 'system_error')
  // if (systemErrorData.length > 0) {
  //   return fail500();
  // }
  // var xfields = args.header['x-fields'].split(',');
  var mock = {
    responses: [
      {
        request: {
          line_no: '1',
          business_type: {
            id: '1575139',
            block_label: '関東',
            block_label_english: 'Kanto',
            item_names: [
              {
                label: '土木(建設業)',
                lang_name: '日本語',
              },
              {
                label: 'Sint velit non ipsum aliqua anim amet non cillum eiusmod eu adipisicing ea duis.',
                lang_name: '英語',
              },
              {
                label: '',
                lang_name: 'フランス語',
              },
            ],
            update_datetime: '2019-03-19T00:00:00.000Z',
          },
        },
        error_data: [
          {
            code: 'COM0002E',
            message: '業種名(英語)はリクエスト情報が不正です。',
            keys: ['bussiness_type.item_names[2].label'],
          },
          {
            code: 'COM0002E',
            message: '業種名(フランス語)はリクエスト情報が不正です。',
            keys: ['bussiness_type.item_names[3].label'],
          },
          {
            code: 'COM0002E',
            message: '業種名(フランス語)はリクエスト情報が不正です。',
            keys: ['bussiness_type.item_names[3].label'],
          },
          {
            code: 'COM0002E',
            message: '業種名(フランス語)はリクエスト情報が不正です。',
            keys: ['bussiness_type.item_names[3].label'],
          },
        ],
      },
      {
        request: {
          line_no: '2',
          business_type: {
            id: '1575140',
            block_label: '関東',
            block_label_english: 'Kanto',
            item_names: [
              {
                label: '漁業',
                lang_name: '日本語',
              },
            ],
            update_datetime: '2019-03-19T00:00:00.000Z',
          },
        },
        result_data: {
          business_type: {
            id: '1575139',
            block_id: '2308290',
            block_label: '関東',
            block_label_english: 'Kanto',
            item_names: [
              {
                label: '漁業',
                lang_code: 'jp-JP',
                lang_name: '日本語',
              },
            ],
            update_datetime: '2019-04-19T00:00:00.000Z',
          },
        },
      },
    ],
  };

  // mock.result_data = pickAvailableResponse(result_data, xfields);
  return success(mock);
  // return fail500();
};

function success(data) {
  return {
    status: 207,
    json: data,
    header: {
      'Cache-Control': 'no-cache',
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
          keys: '???',
        },
      ],
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
