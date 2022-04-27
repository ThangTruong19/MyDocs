var validation = require('../../common/validation.js');

module.exports = function(args) {
  var systemErrorData = validation(args.query, 'system_error');
  if (systemErrorData.length > 0) {
    return fail500();
  }

  var from = 1;
  var count = 0;
  var sort = '';
  var TOTAL = 10;
  var loopEnd =
    TOTAL > from + count - 1 && count !== 0 ? from + count - 1 : TOTAL;
  var mock = {
    result_header: {
      'X-From': from,
      'X-Count': count,
      'X-Sort': sort,
      'X-TotalCount': '',
      'Cache-Control': 'no-cache',
    },
    result_data: {
      groups: [],
    },
  };
  var data;

  if (args.query.group_id && args.query.group_id !== '-99') {
    mock.result_data.groups.push(createData(args.query.group_id));
  } else if (args.query.group_id && args.query.group_id === '-99') {
    for (var i = from; i <= loopEnd; i++) {
      mock.result_data.groups.push(createData(String(i)));
    }
  } else {
    mock.result_data.groups.push(createData('3'));
  }

  mock.result_header['X-TotalCount'] = mock.result_data.groups.length;
  return success(mock);
};

function createData(i) {
  var moment = require('moment');
  var group = {
    label: 'ブロック',
    label_english: 'block',
    kind_name: 'グループ種別名称',
  };

  var labelNum = '';
  switch (i) {
    case '1':
    case '4':
    case '7':
    case '10':
      labelNum = ('000' + i).slice(-4);
      break;
    case '2':
    case '5':
    case '8':
      labelNum = ('00000' + i).slice(-6);
      break;
    case '3':
    case '6':
    case '9':
      labelNum = ('00' + i).slice(-2);
  }

  data = {
    user_count: {
      other: {
        count: 300 * i,
        name: 'その他',
      },
      general_role: {
        count: 200 * i,
        name: '一般権限',
      },
      administrator_role: {
        count: 100 * i,
        name: '管理者権限',
      },
    },
    identification: {
      id: String(i),
      label: group.label + labelNum,
      label_english: group.label_english + labelNum,
      organization_code: 'ABBESS',
      kind_id: '1',
      kind_name: group.kind_name,
      update_datetime: moment()
        .subtract(i * 2, 'days')
        .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
    },
  };

  return data;
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

function fail(msg) {
  return {
    status: 400,
    json: {
      error_data: [
        {
          keys: ['group_id'],
          message: 'リクエスト情報が不正です。',
          code: 'COM0002E',
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
