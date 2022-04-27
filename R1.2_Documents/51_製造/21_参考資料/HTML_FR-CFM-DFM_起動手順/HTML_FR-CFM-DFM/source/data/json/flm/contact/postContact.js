var validation = require('../../common/validation.js');

module.exports = function(args) {
  var errorData = validation(args.body);
  if (errorData.length > 0) {
    return fail(errorData);
  }

  var data = args.body.contact.general_contact
    ? {
        result_data: {
          contact: {
            id: '1',
            kind: '0',
            support_distributor_id: '123456',
            support_distributor_label: 'コマツ',
            support_distributor_label_english: 'komatsu',
            update_datetime: '2017-05-24T00:00:01.000Z',
            represent_contact: null,
            general_contact: {
              label: '小松 太郎',
              email: 'tarou.komatsu@aaaa.co.jp',
              office_phone_no: '03-(1234)-1234',
              cell_phone_no: '090-(1234)-1234',
              photo_exists_kind: '0',
            },
          },
        },
      }
    : {
        result_data: {
          contact: {
            id: '3',
            kind: '1',
            support_distributor_id: '123456',
            support_distributor_label: 'コマツ',
            support_distributor_label_english: 'komatsu',
            update_datetime: '2017-05-24T00:00:01.000Z',
            represent_contact: {
              label: 'コマツ',
              phone_no: '03-(1234)-1234',
            },
            general_contact: null,
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
