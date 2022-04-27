var validation = require('../../common/validation.js');
var pickAvailableResponse = require('../../common/pickAvailableResponse');
var moment = require('moment');

module.exports = function(args) {
  var systemErrorData = validation(args.query, 'system_error');
  if (systemErrorData.length > 0) {
    return fail500();
  }
  var xfields = args.header['x-fields'] ? args.header['x-fields'].split(',') : [];

  var data = createDetailData(parseInt(args.params.id || '1'));

  if (xfields.length > 0) {
    data = pickAvailableResponse(data, xfields);
  }

  return success(data);
};

function createDetailData(i) {
  var data = {
    business_type: {
      update_datetime: moment()
        .subtract(i * 2, 'days')
        .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
      item_names: [
        {
          lang_name: 'English',
          lang_code: 'en',
          label: `Industry ${i}`,
        },
        {
          lang_name: '日本語',
          lang_code: 'ja',
          label: `業種${i}`,
        },
        {
          lang_name: 'フランス語',
          lang_code: 'fr',
          label: `Type d'entreprise ${i}`,
        },
        {
          lang_name: 'yyyy語',
          lang_code: 'yy',
          label: `yyy yyy ${i}`,
        },
      ],
      block_label_english: `group${(i % 5)}`,
      block_label: `公開先グループ${(i % 5)}`,
      block_id: '-99',
      id: String(i),
    },
  };
  return data;
}

function success(data) {
  return {
    status: 200,
    json: {
      result_data: data,
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
