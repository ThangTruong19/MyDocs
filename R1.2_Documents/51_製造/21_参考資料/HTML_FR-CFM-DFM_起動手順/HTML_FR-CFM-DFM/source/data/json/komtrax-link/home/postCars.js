var pickAvailableResponse = require('../../common/pickAvailableResponse');

module.exports = function(args) {
  var from = isNaN(args.header['x-from']) ? 1 : parseInt(args.header['x-from']);
  var count = isNaN(args.header['x-count'])
    ? 0
    : parseInt(args.header['x-count']);
  var sort = args.header['x-sort'] || 'cars.car_identification.model';
  var TOTAL = count == 0 ? 100 : count;
  var mock = {
    result_header: {
      'X-From': from,
      'X-Count': count,
      'X-Sort': sort,
      'X-TotalCount': TOTAL,
      'Cache-Control': 'no-cache',
    },
    result_data: {
      cars: createCars(TOTAL),
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

  // 検索結果0件
  // return {
  //   status: 200,
  //   json: {
  //     result_data: {
  //       cars: []
  //     }
  //   },
  //   header: {
  //     'X-From': 1,
  //     'X-Count': 0,
  //     header: data.result_header
  //   }
  // };
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
