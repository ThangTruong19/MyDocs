var _ = require('lodash');
var validation = require('../../common/validation.js');
var pickAvailableResponse = require('../../common/pickAvailableResponse');
var successEmpty = require('../../common/successEmpty');

module.exports = function(args) {
  var xfields = args.header['x-fields'].split(',');
  var from = isNaN(args.header['x-from']) ? 1 : parseInt(args.header['x-from']);
  var count = isNaN(args.header['x-count'])
    ? 0
    : parseInt(args.header['x-count']);
  var sort = args.header['x-sort'] || 'users.identification.id';
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
    result_data: {},
  };
  var result_data = { users: [] };

  if (validation(args.query, 'system_error').length > 0) {
    return fail500();
  }
  if (validation(args.query, 'empty').length > 0) {
    return successEmpty('users', mock);
  }

  if (args.query.user_id) {
    result_data.users.push(createData(args.query.user_id));
  } else {
    for (var i = from; i <= loopEnd; i++) {
      result_data.users.push(createData(i));
    }
  }

  mock.result_data = pickAvailableResponse(result_data, xfields);
  return success(mock);
};

function createData(i) {
  var moment = require('moment');
  var user = {
    phone_no: '9876543',
    label_english: 'komatsu tarou jp',
    label: '小松太郎 日本',
    email: 'test-jp',
  };
  var b_group_id = i % 2 === 0 ? 'R0007' : 'R0008';
  var b_group_label = b_group_id === 'R0007' ? '所属1' : '所属2';
  var b_group_label_en = b_group_id === 'R0007' ? 'belonging1' : 'belonging2';
  var group_id = i % 2 === 0 ? 'G0001' : 'G0002';
  var group_label = group_id === 'G0001' ? 'グループ1' : 'グループ2';
  var create_place = group_id === 'G0001' ? '東京' : '島根';
  var role_id = '';
  var role_label = '';

  if (group_id === 'R0007') {
    role_id = i % 2 === 0 ? 'R1G0001' : 'R1G0002';
    role_label = role_id === 'R1G0001' ? '所属1の権限1' : '所属1の権限2';
  } else {
    role_id = i % 2 === 0 ? 'R2G0001' : 'R2G0002';
    role_label = role_id === 'R2G0001' ? '所属2の権限1' : '所属2の権限2';
  }

  data = {
    identification: {
      id: String(i),
      account: user.email + i + '@account.example.com',
      email: user.email + i + '@example.com',
      label: user.label + i,
      label_english: user.label_english + i,
      update_datetime: moment()
        .subtract(i * 2, 'days')
        .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
    },
    group: {
      belonging_group: {
        identification: {
          id: 'R0007',
          label: b_group_label,
          label_english: b_group_label_en,
          kind_id: '' + ((i % 15) + 1),
        },
      },
      granted_role: {
        id: role_id,
        name: role_label,
      },
      configuration_groups: [
        {
          label: 'グループ',
        },
      ],
      granted_authorities: [],
    },
    attribute: {
      phone_no: user.phone_no + i,
      create_place: create_place,
    },
  };

  if (i === 1) {
    data.identification.account = 'kmt_fr_it002@devazuread.onmicrosoft.com';
  }

  if (i % 5 !== 0) {
    // granted_authorities生成
    var authority_label = role_label + 'の権限';
    var num = i % 9;
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
      data['group']['granted_authorities'].push(authority);
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
    status: 400,
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
