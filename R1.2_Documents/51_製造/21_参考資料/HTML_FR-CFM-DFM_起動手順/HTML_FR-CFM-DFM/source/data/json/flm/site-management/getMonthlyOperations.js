var moment = require('moment');

module.exports = function(args) {
  var mode = args.query.mode;
  var from = 1;
  var count = 10;
  var sort = 'cars.car_indentification.model';
  var TOTAL = 10;
  var loopEnd = 10;
  var mock = {
    result_header: {
      'X-From': from,
      'X-Count': count,
      'X-Sort': sort,
      'X-TotalCount': TOTAL,
      'Cache-Control': 'no-cache',
    },
    result_data: {},
  };

  switch (mode) {
    case '1':
      mock.result_data.group_area = {
        id: '1',
        label: '平塚市四之宮',
        no: '1',
        group_id: '1',
        group_label: 'コマツ東京C',
        group_label_english: 'KOMATSU Tokyo C',
        description: 'コマツ湘南工場付近',
      };
      mock.result_data.cars = createCars(10);
      break;
    case '2':
      mock.result_data.site = {
        id: '1',
        label: '平塚市四之宮',
        group_id: '1',
        group_label: 'コマツ東京C',
        group_label_english: 'KOMATSU Tokyo C',
        start_datetime: '2019/03/20 00:00:00',
        end_datetime: '2019/03/20 00:00:00',
      };
      mock.result_data.cars = createCars(10);
      break;
    case '0':
      mock.result_data.cars = createCars(100);
      break;
  }

  var fromMonth = moment(args.query.year_month_from, 'YYYY-MM');
  var toMonth = moment(args.query.year_month_to, 'YYYY-MM');
  mock.result_data.cars.forEach(function(car) {
    car.operations = createOperations(
      fromMonth.clone().add(Math.ceil(Math.random() * 4), 'month'),
      toMonth.clone().subtract(Math.ceil(Math.random() * 4), 'month'));
  });

  return success(mock);
  // return fail500();
};

function createCars(num) {
  const cars = [];

  for (var i = 1; i <= num; i++) {
    cars.push({
      car_identification: {
        id: '1',
        maker_id: '1',
        maker_code: '0001',
        maker_name: 'コマツ',
        division_id: '1',
        division_code: '0001',
        division_name: 'スキッドステアローダ',
        model_id: '1',
        model: 'SK714',
        model_type_id: '1',
        type: 'A12345',
        rev: 'M0',
        type_rev: 'A12345M0',
        icon_font_no: '65',
        serial: 'A12345',
        pin: '12345',
        production_date: '2017/05/23',
        initial_smr: '100.5',
        update_datetime: '2017-05-23T23:59:59.999Z',
      },
      customer: {
        id: '601',
        label: '顧客_1',
        label_english: 'customer_1',
        organization_code: 'NU0003',
        business_type_id: '1',
        business_type_name: '建設業',
        phone_no: '0312345678',
        address: '青森県青森市青森町2-10',
      },
      customer_attribute: {
        operator_label1: 'オペレータ１',
        operator_label2: 'オペレータ２',
        operator_label3: 'オペレータ３',
        mainte_in_charge: '保守責任者１',
        remarks: '特記事項です',
        user_memo: '自由記入欄です',
        customer_car_no: '123456',
        customer_management_no: '123456',
      },
      operations: [],
    });
  }

  return cars;
}

function createOperations(fromMonth, toMonth) {
  var result = [];
  var months = toMonth.diff(fromMonth, 'month') + 1;
  var month = moment(fromMonth);
  var type = Math.floor(Math.random() * 4);

  for (var i = 0; i < months; i++) {
    var data = {
      year_month: month.format('YYYY/MM'),
      actual_operation_time: Math.floor(Math.random() * 1000) * 0.1,
      idle_time: null,
      fuel_consumption: null,
      consumed_electric_power: null,
    };

    switch (type) {
      case 0:
        break;
      case 1:
        data.fuel_consumption = Math.floor(Math.random() * 1000) * 0.1;
        break;
      case 2:
        data.idle_time = Math.floor(Math.random() * 1000) * 0.1;
        data.fuel_consumption = Math.floor(Math.random() * 1000) * 0.1;
        break;
      case 3:
        data.idle_time = Math.floor(Math.random() * 1000) * 0.1;
        data.consumed_electric_power = Math.floor(Math.random() * 1000) * 0.1;
        break;
    }

    data.operation_time = +data.actual_operation_time + +data.idle_time;
    if (i !== 1) {
      result.push(data);
    }
    month.add(1, 'month');
  }
  return result;
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
