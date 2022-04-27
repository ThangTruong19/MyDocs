var _ = require('lodash');

module.exports = function(args) {
  var from = isNaN(args.header['x-from']) ? 1 : parseInt(args.header['x-from']);
  var count = isNaN(args.header['x-count'])
    ? 0
    : parseInt(args.header['x-count']);
  var TOTAL = isNaN(args.header['x-count']) ? 1 : 100;
  var loopEnd =
    TOTAL > from + count - 1 && count !== 0 ? from + count - 1 : TOTAL;
  var mock = {
    result_header: {
      'X-From': from,
      'X-Count': count,
      'X-Sort': 'users.identification.id',
      'X-TotalCount': TOTAL,
      'Cache-Control': 'no-cache',
    },
    result_data: {
      users: [],
    },
  };
  // ユーザIDでの検索かどうか
  var nation_code = args.query.nation_code;
  var email = args.query.user_account;
  var isUserIdSearch =
    _.isUndefined(nation_code) && !_.isEmpty(email) ? true : false;

  var users = {
    US: {
      attribute: {
        phone_no: '0123456',
        nation_name: 'アメリカ',
        nation_code: 'US',
        company_label_english: 'Komatsu LA',
        company_label: 'コマツLA',
        company_code: 'KOMATSUUS',
        address: 'KOMATSU CITY',
      },
      identification: {
        label_english: 'komatsu tarou us',
        label: '小松太郎 アメリカ',
        email: 'test-us',
      },
    },
    JP: {
      attribute: {
        phone_no: '9876543',
        nation_name: '日本',
        nation_code: 'JP',
        company_label_english: 'Komatsu Tokyo',
        company_label: 'コマツ東京',
        company_code: 'KOMATSUJP',
        address: '青森県青森市青森町',
      },
      identification: {
        label_english: 'komatsu tarou jp',
        label: '小松太郎 日本',
        email: 'test-jp',
      },
    },
  };

  var user;
  if (isUserIdSearch) {
    var match_str = email.match(/^test-(..)(\d+)@account\.example\.com$/);
    if (match_str) {
      nation_code = _.toUpper(match_str[1]);
      var user_id = parseInt(match_str[2]);

      if (!_.inRange(user_id, 1, 101)) {
        return success(resultEmptyData());
      }
      user = users[nation_code];
      mock.result_data.users.push(createData(user_id, user, nation_code));
    } else {
      return success(resultEmptyData());
    }
  } else {
    user = users[nation_code];
    for (var i = from; i <= loopEnd; i++) {
      mock.result_data.users.push(createData(i, user, nation_code));
    }
  }

  return success(mock);
};

function resultEmptyData() {
  return {
    result_data: {
      users: [],
    },
  };
}

function createData(i, user, nation_code) {
  data = {
    attribute: {
      phone_no: user.attribute.phone_no + i,
      nation_name: user.attribute.nation_name,
      nation_code: user.attribute.nation_code,
      company_label_english: user.attribute.company_label_english + i,
      company_label: user.attribute.company_label + i,
      company_code: user.attribute.company_code + i,
      address: user.attribute.address + i,
    },
    identification: {
      label_english: user.identification.label_english + i,
      label: user.identification.label + i,
      email: user.identification.email + i + '@example.com',
      id: nation_code === 'US' ? String(1000 + i) : String(2000 + i),
      account: user.identification.email + i + '@account.example.com',
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
