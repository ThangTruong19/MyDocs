var pickAvailableResponse = require('../../common/pickAvailableResponse');
var validation = require('../../common/validation.js');

module.exports = function(args) {
  var from = parseInt(args.header['x-from']);
  var count = parseInt(args.header['x-count']);
  var sort = args.header['x-sort'] || 'company_name';
  var TOTAL = 100;
  var loopEnd = TOTAL > from + count - 1 ? from + count - 1 : TOTAL;
  var data = {
    contacts: [],
  };
  var kind = args.query.contact_kind;
  var xFields = args.header['x-fields'];

  var errorData = validation(args.query, 'system_error');
  if (errorData.length > 0) {
    return fail500();
  }

  for (var i = from; i <= loopEnd; i++) {
    var rand = Math.floor(2 * Math.random());
    var contact = {
      id: String(i + TOTAL * kind),
      kind: String(kind),
      support_distributor_id: '123456',
      support_distributor_label: 'コマツ',
      support_distributor_label_english: 'KOMATSU',
      update_datetime: '2017-05-24T00:00:01.000Z',
    };
    var representContact = {
      label: 'コマツ',
      phone_no: '03-xxxx-xxxx',
    };
    var generalContact = {
      label: '連絡先' + i,
      email: 'komatsu.t@sample.com',
      office_phone_no: '0166-22-1111',
      cell_phone_no: '090-xxxx-xxxx',
      photo_exists_kind: String(rand),
    };

    switch (kind) {
      case '1':
        contact.represent_contact = representContact;
        break;
      case '0':
        contact.general_contact = generalContact;
        break;
      default:
        break;
    }

    data.contacts.push(contact);
  }

  data = xFields ? pickAvailableResponse(data, xFields) : data;

  return success({
    result_header: {
      'X-From': from,
      'X-Count': count,
      'X-Sort': sort,
      'X-TotalCount': TOTAL,
      'Cache-Control': 'no-cache',
    },
    result_data: data,
  });
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
