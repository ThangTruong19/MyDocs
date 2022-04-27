var pickAvailableResponse = require('../../common/pickAvailableResponse');

module.exports = function (args) {
  var xFields = args.header['x-fields'];
  var from = parseInt(args.header['x-from']);
  var count = parseInt(args.header['x-count']);
  var sort = args.header['x-sort'] || 'custom_divisions.names.label:lang_code';
  var TOTAL = 100;
  var loopEnd = TOTAL > from + count - 1 ? from + count - 1 : TOTAL;
  var data = {
    custom_divisions: [],
  };

  if (args.query.custom_division_id == null) {
    for (var i = from; i <= loopEnd; i++) {
      data.custom_divisions.push(createData(args, i));
    }
  } else {
    data.custom_divisions.push(createData(args, +args.query.custom_division_id))
  }

  return success({
    result_header: {
      'X-From': from,
      'X-Count': count,
      'X-Sort': sort,
      'X-TotalCount': TOTAL,
      'Cache-Control': 'no-cache',
    },
    result_data: xFields ? pickAvailableResponse(data, xFields) : data,
  });
};

function createData(args, i) {
  var customDivision = {
    update_datetime: '2017-11-14T20:36:23.386Z',
    group_id: '1',
    group_label: 'コマツ' + ((i % 3) + 1),
    group_label_english: 'KOMATSU-KANTO-KENSETSU GROUP',
    group_kind_id: ['3', '5'][+(i % 3 === 0)],
    group_kind_name: ['リージョン', 'ブロック'][+(i % 3 === 0)],
    id: '' + i,
    names: [
      {
        label: '油圧ショベル' + i,
        lang_code: 'en',
        lang_name: '英語',
      },
      {
        label: '油圧ショベル' + i,
        lang_code: 'fa',
        lang_name: 'フランス語',
      },
      {
        label: '油圧ショベル' + i,
        lang_code: 'th',
        lang_name: 'xxxx語',
      },
      {
        label: '油圧ショベル' + i,
        lang_code: 'ja',
        lang_name: '日本語',
      },
    ],
    models: [
      {
        maker_id: '302',
        maker_code: '0302',
        maker_name: 'コマツ',
        division_id: '1',
        division_code: '0001',
        division_name: '油圧ショベル',
        model_id: '1',
        model: 'PC100',
        types: [
          {
            id: '10',
            type_rev: '10M10',
            icon_font: {
              id: '1',
              no: '65',
            },
          },
          {
            id: '11',
            type_rev: '10M11',
            icon_font: {
              id: '1',
              no: '65',
            },
          },
        ],
      },
      {
        maker_id: '302',
        maker_code: '0302',
        maker_name: 'コマツ',
        division_id: '1',
        division_code: '0001',
        division_name: '油圧ショベル',
        model_id: '2',
        model: 'PC300',
        types: [
          {
            id: '20',
            type_rev: '10M20',
            icon_font: {
              id: '1',
              no: '65',
            },
          },
        ],
      },
    ],
  };

  return customDivision;
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
