var _ = require('lodash');
var pickAvailableResponse = require('../../common/pickAvailableResponse');
var validation = require('../../common/validation.js');

module.exports = function (args) {
  var TOTAL = 100;
  var from = args.header['x-from'] ? parseInt(args.header['x-from']) : 1;
  var count = args.header['x-count'] ? parseInt(args.header['x-count']) : TOTAL;
  var sort = args.header['x-sort'] || 'customer_name';
  var xFields = args.header['x-fields'];
  var loopEnd = TOTAL > from + count - 1 ? from + count - 1 : TOTAL;
  var contactLinks = [];
  var mock = {
    result_header: {
      'X-From': from,
      'X-Count': count,
      'X-Sort': sort,
      'X-TotalCount': TOTAL,
      'Cache-Control': 'no-cache',
    },
    result_data: {
      contact_links: null,
    },
  };

  var errorData = validation(args.body, 'system_error');
  if (errorData.length > 0) {
    return fail500();
  }

  var data;
  if (
    args.body.customer_ids.length === 1 &&
    args.body.customer_ids[0] === '-99'
  ) {
    for (var i = from; i <= loopEnd; i++) {
      data = createData(i);
      contactLinks.push(data);
    }
  } else {
    var result_count = args.body.customer_ids.length;
    mock.result_header['X-Count'] = result_count;
    mock.result_header['X-TotalCount'] = result_count;
    contactLinks = _.chain(args.body.customer_ids)
      .orderBy()
      .map(function (i) {
        return createData(i);
      })
      .value();
  }

  mock.result_data.contact_links = contactLinks;

  mock.result_data = pickAvailableResponse(mock.result_data, xFields);

  return success(mock);
};

function createData(i) {
  return {
    customer_id: '' + i,
    customer_label: '顧客名' + i,
    customer_label_english: 'KOMATSU' + i,
    update_datetime: '2017-05-24T00:00:01.000Z',
    customer_contact_links: [
      {
        contact_kind_code: '0',
        contact_kind_name: '代表電話',
        contact_id: '' + ((i - 1) % 5),
        contact_label: '代表電話' + (((i - 1) % 5) + 1),
      },
      {
        contact_kind_code: '1',
        contact_kind_name: 'セールス',
        contact_id: '' + ((i - 1) % 5),
        contact_label: 'セールス' + (((i - 1) % 5) + 1),
      },
      {
        contact_kind_code: '2',
        contact_kind_name: 'PSSR',
        contact_id: '' + ((i - 1) % 5),
        contact_label: 'PSSR' + (((i - 1) % 5) + 1),
      },
      {
        contact_kind_code: '3',
        contact_kind_name: 'サービス',
        contact_id: '' + ((i - 1) % 5),
        contact_label: 'サービス' + (((i - 1) % 5) + 1),
      },
      {
        contact_kind_code: '4',
        contact_kind_name: 'パーツ',
        contact_id: '' + ((i - 1) % 5),
        contact_label: 'パーツ' + (((i - 1) % 5) + 1),
      },
      {
        contact_kind_code: '5',
        contact_kind_name: 'ICT',
        contact_id: '' + ((i - 1) % 5),
        contact_label: 'ICT' + (((i - 1) % 5) + 1),
      },
    ],
  };
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
