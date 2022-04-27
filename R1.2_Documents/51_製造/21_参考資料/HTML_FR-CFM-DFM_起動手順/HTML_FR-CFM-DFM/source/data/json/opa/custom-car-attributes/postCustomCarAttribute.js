var validation = require('../../common/validation');

module.exports = function(args) {
  var errorData = validation(args.body);

  if (errorData.length > 0) {
    return fail(errorData);
  }

  var data = {
    result_data: {
      custom_car_attribute: {
        id: '19829',
        block_id: '938928',
        block_label: 'ブロック0001',
        block_label_english: 'block0001',
        field_no: '3',
        names: [
          {
            label: '情報化施工',
            lang_name: '日本語',
            lang_code: 'ja-JP',
          },
        ],
        details: [
          {
            order: '1',
            id: '1',
            names: [
              {
                label: 'KOMATSU IMC',
                lang_name: '日本語',
                lang_code: 'ja-JP',
              },
            ],
          },
          {
            order: '2',
            id: '2',
            names: [
              {
                label: 'Topcon P&P',
                lang_name: '日本語',
                lang_code: 'ja-JP',
              },
            ],
          },
        ],
        registered_cars_count: 100,
        update_datetime: '2017-06-01T13:54:00.000Z',
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
