var pickAvailableResponse = require('../../common/pickAvailableResponse');

module.exports = function(args) {
  var from = 1;
  var count = (TOTAL = 100);
  var sort = 'cars.car_indentification.model';
  var mock = {
    result_header: {
      'X-From': from,
      'X-Count': count,
      'X-Sort': sort,
      'X-TotalCount': TOTAL,
      'Cache-Control': 'no-cache',
    },
    result_data: {
      cars: createCars(count),
    },
  };
  var xfields = args.header['x-fields'] && args.header['x-fields'].split(',');

  mock.result_data = pickAvailableResponse(mock.result_data, xfields);

  return success(mock);
  // return fail500();
};

function createCars(num) {
  const cars = [];

  for (var i = 1; i <= num; i++) {
    cars.push({
      car_identification: {
        id: `${i}`,
        model: `D${i}PX`,
        type_rev: `${i}E0`,
        icon_font_no: `${i % 2 ? 65 : 70}`,
        serial: `A${10000 + i}`,
        update_datetime: '2017-05-23T23:59:59.999Z',
      },
      customer: {
        label: `顧客_${i}`,
      },
      customer_attribute: {
        customer_car_no: `${i}`,
      },
      latest_status: {
        point: {
          coordinates: [130.0 + Math.random() * 10, 30.0 + Math.random() * 10],
        },
      },
    });
  }
  return cars;
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
