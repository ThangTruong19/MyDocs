var validation = require('../../common/validation.js');

module.exports = function(args) {
  var errorData = validation(args.body);
  if (errorData.length > 0) {
    return fail(errorData);
  }

  var data = {
    result_data: {
      contact_link: {
        customer_id: '1',
        customer_label: 'コマツ',
        customer_label_english: 'KOMATSU',
        update_datetime: '2017-05-24T00:00:01.000Z',
        customer_contact_links: [
          {
            contact_kind_code: '0',
            contact_kind_name: '代表電話',
            contact_id: '1',
            contact_label: 'コマツ',
          },
        ],
      },
    },
  };

  return success(data);
};

function success(data) {
  return {
    status: 200,
    json: {
      result_data: data.result_data,
    },
  };
}

function fail(errorData) {
  return {
    status: 400,
    json: {
      error_data: errorData,
    },
  };
}
