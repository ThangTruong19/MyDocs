var validation = require('../../common/validation');
var pickAvailableResponse = require('../../common/pickAvailableResponse');

module.exports = function(args) {
  if (validation(args.body, 'system_error').length > 0) {
    return fail500();
  }

  var xfields = args.header['x-fields'] && args.header['x-fields'].split(',');
  var sort = 'car.rental_histories.start_date';
  var mock = {
    result_header: {
      'X-Sort': sort,
      'Cache-Control': 'no-cache',
    },
    result_data: {
      car: {
        car_identification: {
          id: '1',
          maker_id: '1',
          maker_code: '0001',
          maker_name: 'コマツ',
          division_id: '1',
          division_code: '0001',
          division_name: 'ブルドーザ',
          model_id: '1',
          model: 'D85PX',
          model_type_id: '1',
          type: '15',
          rev: 'E0',
          type_rev: '15E0',
          icon_font_no: '1',
          serial: 'A12345',
          pin: 'KMT0D101CJAA12345',
          production_date: '2017/05/23',
          initial_smr: '100.5',
          update_datetime: '2017-05-23T23:59:59.999Z',
        },
        rental_histories: [],
      },
    },
  };

  for (var i = 0; i < 5; i++) {
    mock.result_data.car.rental_histories.push({
      connection_id: '1111',
      customer_id: '1',
      customer_label: 'コマツ建設',
      customer_label_english: 'Komatsu_Construction',
      start_date: '2017/02/01',
      end_date: '2017/03/31',
      viewable_connection_id: '1234',
      viewable_end_date: '2017/04/30',
    });
  }

  mock.result_data = pickAvailableResponse(mock.result_data, xfields);
  return success(mock);
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
