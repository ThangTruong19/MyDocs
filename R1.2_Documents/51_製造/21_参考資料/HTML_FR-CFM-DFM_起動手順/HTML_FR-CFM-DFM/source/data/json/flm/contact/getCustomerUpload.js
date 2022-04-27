module.exports = function(args) {
  // デバッグ用・trueの場合エラーが発生しなくなる = ダウンロードなし
  var forceNoError = false;

  var result_data, error_data;

  var summary = {
    added_count: 1,
    modified_count: 3,
    unmodified_count: 3,
    error_count: 5,
  };
  var responses = [];
  var response;
  var errors;
  var fileId = null;

  for (var i = 0; i < 10; i++) {
    response = {};
    errors = [1, 2, 3, 4, 5, 6].filter(function() {
      return !forceNoError && Math.random() < 0.15;
    });

    if (errors.length > 0) {
      response.error_data = errors.map(function(e) {
        return {
          code: 'ACOM0009E',
          message: '形式に誤りがあります',
          keys: ['customer_contact_links[' + e + '].contact_kind_code'],
        };
      });
      fileId = '0';
    } else {
      response.result_data = {
        contact_link: {
          customer_id: '' + i,
          customer_label: '顧客名' + i,
          customer_label_english: 'customer ' + i,
          update_datetime: '2017-05-23T23:59:59.999Z',
          customer_contact_links: [
            {
              contact_kind_code: '1',
              contact_kind_name: '代表電話',
              contact_id: '' + (i % 5),
              contact_label: '代表電話' + (((i - 1) % 5) + 1),
            },
            {
              contact_kind_code: '2',
              contact_kind_name: 'セールス',
              contact_id: '' + (i % 5),
              contact_label: 'セールス' + (((i - 1) % 5) + 1),
            },
            {
              contact_kind_code: '3',
              contact_kind_name: 'PSSR',
              contact_id: '' + (i % 5),
              contact_label: 'PSSR' + (((i - 1) % 5) + 1),
            },
            {
              contact_kind_code: '4',
              contact_kind_name: 'サービス',
              contact_id: '' + (i % 5),
              contact_label: 'サービス' + (((i - 1) % 5) + 1),
            },
            {
              contact_kind_code: '5',
              contact_kind_name: 'パーツ',
              contact_id: '' + (i % 5),
              contact_label: 'パーツ' + (((i - 1) % 5) + 1),
            },
            {
              contact_kind_code: '6',
              contact_kind_name: 'ICT',
              contact_id: '' + (i % 5),
              contact_label: 'ICT' + (((i - 1) % 5) + 1),
            },
          ],
        },
      };
    }

    response.request = {
      line_no: '' + (i + 1),
      contact_link: {
        customer_id: '' + i,
        customer_label: '顧客名' + i,
        customer_label_english: 'customer ' + i,
        update_datetime: '2017-05-23T23:59:59.999Z',
        customer_contact_links: [
          {
            contact_kind_code: '1',
            contact_kind_name: '代表電話',
            contact_id: '' + (i % 5),
            contact_label: '代表電話' + (((i - 1) % 5) + 1),
          },
          {
            contact_kind_code: '2',
            contact_kind_name: 'セールス',
            contact_id: '' + (i % 5),
            contact_label: 'セールス' + (((i - 1) % 5) + 1),
          },
          {
            contact_kind_code: '3',
            contact_kind_name: 'PSSR',
            contact_id: '' + (i % 5),
            contact_label: 'PSSR' + (((i - 1) % 5) + 1),
          },
          {
            contact_kind_code: '4',
            contact_kind_name: 'サービス',
            contact_id: '' + (i % 5),
            contact_label: 'サービス' + (((i - 1) % 5) + 1),
          },
          {
            contact_kind_code: '5',
            contact_kind_name: 'パーツ',
            contact_id: '' + (i % 5),
            contact_label: 'パーツ' + (((i - 1) % 5) + 1),
          },
          {
            contact_kind_code: '6',
            contact_kind_name: 'ICT',
            contact_id: '' + (i % 5),
            contact_label: 'ICT' + (((i - 1) % 5) + 1),
          },
        ],
      },
    };

    responses.push(response);
  }

  var result = {
    summary,
    responses,
  };

  if (fileId) {
    result.file_id = fileId;
  }

  return done(result);
  // return fail500();
};

function done(data) {
  return {
    status: 207,
    json: data,
    header: {
      'Cache-Control': 'no-cache',
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
