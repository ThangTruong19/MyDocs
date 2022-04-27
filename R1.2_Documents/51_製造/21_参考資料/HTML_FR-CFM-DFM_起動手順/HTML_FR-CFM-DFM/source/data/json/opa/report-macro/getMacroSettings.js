var pickAvailableResponse = require('../../common/pickAvailableResponse');

module.exports = function(args) {
  var xfields = args.header['x-fields'].split(',');
  var sort = args.header['x-sort'] || 'macro_settings.macro_report_code';
  var TOTAL = 5;
  var macro_settings = [];
  var group_id = args.query.group_id || 1;
  var mock = {
    result_header: {
      'X-From': 1,
      'X-Count': 0,
      'X-Sort': sort,
      'X-TotalCount': TOTAL,
      'Cache-Control': 'no-cache',
    },
    result_data: {
      group_id,
      macro_settings: [],
    },
  };
  var data;
  var macroNames = {
    1: '省エネレポート(STEP2.5～STEP4全車種)',
    2: '循環用　中古車レポート',
    3: 'オペレータレポート',
    4: 'ICT建機レポート',
    5: '使われ方',
  };
  var version;

  for (var i = 1; i <= TOTAL; i++) {
    version = '' + (((group_id * i) % 5) + 1);
    data = {
      publish_kind: '' + (Math.floor((group_id * i) / 3) % 2),
      macro_report_code: '' + i,
      macro_report_name: macroNames[i],
      file: {
        id: '' + (i * 10 + version),
        version: '' + version,
        version_label: 'v.' + version,
        size: version * 11200,
        size_label: (version * 11200) / 1000 + ' KB',
        free_memo: macroNames[i] + '（v.' + version + '）です。',
        latest_update_datetime: '2017/06/01 13:54:22',
      },
      latest_update_datetime: '2017/05/01 22:00:30',
      update_datetime: '2017-06-01T13:54:22.000Z',
    };

    mock.result_data.macro_settings.push(data);
  }

  mock.result_data = pickAvailableResponse(mock.result_data, xfields);

  return success(mock);
};

function success(data) {
  return {
    status: 200,
    json: {
      result_data: data.result_data,
    },
    header: data.result_header,
  };
}

function fail(msg) {
  return {
    status: 500,
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
