module.exports = function(args) {
  var from = isNaN(args.header['x-from']) ? 1 : parseInt(args.header['x-from']);
  var count = isNaN(args.header['x-count'])
    ? 0
    : parseInt(args.header['x-count']);
  var sort = args.header['x-sort'] || 'user.groups.identification.id';
  var TOTAL = isNaN(args.header['x-count']) ? 1 : 100;
  var loopEnd =
    TOTAL > from + count - 1 && count !== 0 ? from + count - 1 : TOTAL;
  var mock = {
    result_header: {
      'X-From': from,
      'X-Count': count,
      'X-Sort': sort,
      'X-TotalCount': TOTAL,
      'Cache-Control': 'no-cache',
    },
    result_data: {
      user: {},
    },
  };
  var data;
  var authority;

  mock.result_data.user = createData(
    args.params.id,
    args.query.belonging_group_id
  );

  return success(mock);
};

function createData(user_id, b_group_id) {
  var moment = require('moment');
  var user = {
    phone_no: '9876543',
    label_english: 'komatsu tarou jp',
    label: '小松太郎 日本',
    email: 'test-jp',
  };
  var group_label = b_group_id === 'R0007' ? 'グループ1' : 'グループ2';
  var group_id = b_group_id === 'R0007' ? 'G0001' : 'G0002';
  var b_group_label = b_group_id === 'R0007' ? '所属1' : '所属2';
  var role_id = '';
  var role_label = '';
  var create_place = b_group_id === 'R0007' ? '東京' : '島根';

  if (b_group_id === 'R0007') {
    role_id = user_id % 2 === 0 ? 'R1G0001' : 'R1G0002';
    role_label =
      role_id === 'R1G0001' ? '所属1のユーザ権限1' : '所属1のユーザ権限2';
  } else {
    role_id = user_id % 2 === 0 ? 'R2G0001' : 'R2G0002';
    role_label =
      role_id === 'R2G0001' ? '所属2のユーザ権限1' : '所属2のユーザ権限2';
  }

  data = {
    identification: {
      id: String(user_id),
      account: user.email + user_id + '@account.example.com',
      email: user.email + user_id + '@example.com',
      label: user.label + user_id,
      label_english: user.label_english + user_id,
      update_datetime: moment()
        .subtract(user_id * 2, 'days')
        .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
    },
    groups: [],
    attribute: {
      phone_no: user.phone_no + user_id,
      create_place: create_place,
    },
  };

  data.groups.push({
    belonging_group: {
      identification: {
        id: b_group_id,
        label: b_group_label,
        kind_id: '' + ((+user_id % 15) + 1),
      },
    },
    granted_role: {
      id: role_id,
      name: role_label,
    },
    granted_authorities: [],
    represent_administrator_kind: '' + (user_id % 2),
    represent_administrator_kind_name: ['無効', '有効'][user_id % 2],
    configuration_groups: [
      {
        label: group_label,
        id: group_id,
      },
    ],
  });

  if (user_id % 5 !== 0) {
    // granted_authorities生成
    var authority_label = role_label + 'の権限';
    var num = user_id % 9;
    for (var j = 1; j <= num + 1; j = j + 2) {
      var labelNum = '';
      switch (j) {
        case 1:
        case 4:
        case 7:
          labelNum = ('000' + j).slice(-4);
          break;
        case 2:
        case 5:
        case 8:
          labelNum = ('00000' + j).slice(-6);
          break;
        case 3:
        case 6:
        case 9:
          labelNum = ('00' + j).slice(-2);
      }
      authority = {
        id: String(role_id + j),
        name: authority_label + labelNum,
      };
      data.groups[0].granted_authorities.push(authority);
    }
  }

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
