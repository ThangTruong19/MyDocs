var _ = require('lodash');

module.exports = function (args) {
  var from = isNaN(args.header['x-from']) ? 1 : parseInt(args.header['x-from']);
  var count = isNaN(args.header['x-count'])
    ? 0
    : parseInt(args.header['x-count']);
  var sort =
    args.header['x-sort'] ||
    'applications_system_notifications.registration_datetime';
  var TOTAL = isNaN(args.header['x-count']) ? 1 : 100;
  var loopEnd =
    TOTAL > from + count - 1 && count !== 0 ? from + count - 1 : TOTAL;
  var isBlockAdministrator = false;
  var mock = {
    result_header: {
      'X-From': from,
      'X-Count': count,
      'X-Sort': sort,
      'X-TotalCount': TOTAL,
      'Cache-Control': 'no-cache',
    },
    result_data: {
      applications_system_notifications: [],
    },
  };
  var data;
  var block;

  if (args.query.system_notification_id) {
    mock.result_data.applications_system_notifications.push(createData(args.query.system_notification_id, isBlockAdministrator));
  } else {
    isBlockAdministrator = args.query.block_id ? false : true;
    for (var i = from; i <= loopEnd; i++) {
      mock.result_data.applications_system_notifications.push(
        createData(i, isBlockAdministrator)
      );
    }
  }

  return success(mock);
};

function createData(i, isBlockAdministrator) {
  var moment = require('moment');
  var contentSt = moment()
    .subtract(i * 10, 'days')
    .format('YYYY/MM/DD HH:mm:ss');
  var contentEd = moment()
    .subtract(i, 'days')
    .format('YYYY/MM/DD HH:mm:ss');
  var publish_applications = [];
  var kind_id = i % 2 === 0 ? '3' : '5';

  switch (true) {
    case i % 2 === 0:
      publish_applications.push({
        code: 'JPAA1',
        name: 'DFM',
      });
      break;
    case i % 3 === 0:
      publish_applications.push(
        {
          code: 'JPAA1',
          name: 'DFM',
        },
        {
          code: 'JPAA2',
          name: 'CFM',
        }
      );
      break;
    default:
      publish_applications.push({
        code: 'JPAA2',
        name: 'CFM',
      });
  }

  var label = kind_id === '3' ? 'リージョン' : 'ブロック';
  var label_english = kind_id === '3' ? 'Region' : 'Block';
  var ownerRegion = i % 3 === 0;
  data = {
    id: i.toString(),
    publish_applications: publish_applications,
    publish_group: {
      kind_id: kind_id,
      kind_name: label,
      blocks: [],
    },
    notification: {
      content:
        '新規お知らせがあります。\n ○○○○年 ○○月 ○○日にアップデートが行われます。' +
        ('0000' + (i * 1000 + i)).slice(-5),
      start_datetime: contentSt,
      end_datetime: contentEd,
    },
    owner_group: ownerRegion
      ? {
        kind_name: 'リージョン',
        kind_id: '3',
        label_english: 'JapanRegion',
        label: '日本リージョン',
        id: '53648',
      }
      : {
        kind_name: 'ブロック',
        kind_id: '5',
        label_english: 'KUJBlock',
        label: 'KUJシステムブロック',
        id: '53525',
      },
    update_datetime: moment()
      .subtract(i * 2, 'days')
      .format('YYYY/MM/DDTHH:mm:ss.SSS[Z]'),
    registration_datetime: moment()
      .subtract(i * 3, 'days')
      .format('YYYY/MM/DDTHH:mm:ss.SSS[Z]'),
  };

  // blocks生成
  if (kind_id === '5') {
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
      block = {
        id: j.toString(),
        label: label + labelNum,
        label_english: label_english + labelNum,
      };
      data['publish_group']['blocks'].push(block);
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
