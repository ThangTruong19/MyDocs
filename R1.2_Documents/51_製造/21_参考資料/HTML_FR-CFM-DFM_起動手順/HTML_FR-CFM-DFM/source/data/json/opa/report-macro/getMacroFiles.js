var pickAvailableResponse = require('../../common/pickAvailableResponse');

module.exports = function(args) {
  var xfields = args.header['x-fields'].split(',');
  var macroNames = {
    1: '省エネレポート(STEP2.5～STEP4全車種)',
    2: '循環用　中古車レポート',
    3: 'オペレータレポート',
    4: 'ICT建機レポート',
    5: '使われ方',
  };
  var TOTAL = 5;
  var macro_files = [];
  var group_id = args.query.group_id || 1;
  var macro_report_code = args.params.macro_report_code || 1;
  var macro_report_name = macroNames[macro_report_code];
  var mock = {
    result_data: {
      macro_report_code,
      macro_report_name,
      macro_files,
    },
  };
  var data;
  var version = ((group_id * macro_report_code) % 5) + 1;

  for (var i = 1; i <= TOTAL; i++) {
    data = {
      id: '' + (macro_report_code * 10 + i),
      version: '' + i,
      version_label: 'v.' + i,
      size: i * 11200,
      size_label: (i * 11200) / 1000 + ' KB',
      free_memo: macro_report_name + '（v.' + i + '）です。',
      latest_update_datetime: '2017/05/01 22:00:30',
    };

    mock.result_data.macro_files.push(data);
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
