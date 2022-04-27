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

  var fromDate = moment(args.query.date_from, 'YYYY-MM-DD');
  var toDate = moment(args.query.date_to, 'YYYY-MM-DD');
  mock.result_data.cars.forEach(function(car) {
    car.operations = createOperations(fromDate, toDate);
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

function createOperations(fromDate, toDate) {
  var result = [];
  var days = toDate.diff(fromDate, 'day') + 1;
  var date = moment(fromDate);
  var type = Math.floor(Math.random() * 4);

  for (var i = 0; i < days; i++) {
    var data = {
      date: date.format('YYYY/MM/DD'),
      actual_operation_time: Math.floor(Math.random() * 100),
      idle_time: null,
      fuel_consumption: null,
      consumed_electric_power: null,
    };

    switch (type) {
      case 0:
        break;
      case 1:
        data.fuel_consumption = Math.floor(Math.random() * 100) * 0.1;
        break;
      case 2:
        data.idle_time = Math.floor(Math.random() * 100) * 0.1;
        data.fuel_consumption = Math.floor(Math.random() * 100) * 0.1;
        break;
      case 3:
        data.idle_time = Math.floor(Math.random() * 100) * 0.1;
        data.consumed_electric_power = Math.floor(Math.random() * 100) * 0.1;
        break;
    }

    data.operation_time = +data.actual_operation_time + +data.idle_time;
    result.push(data);

    date.add(1, 'day');
  }
  return result;
}

function success(data) {
  return {
    status: 200,
    json: {
      "result_data": {
        "group_area": {
          "id": null,
          "label": null,
          "no": null,
          "group_id": null,
          "group_label": null,
          "group_label_english": null,
          "description": null
        },
        "site": {
          "id": "448",
          "label": "機械センター",
          "group_id": "12421",
          "group_label": "前田道路（株）機械部",
          "group_label_english": null,
          "start_datetime": "2014/05/30 09:00:00",
          "end_datetime": null
        },
        "cars": [
          {
            "car_identification": {
              "id": "135038",
              "maker_id": "1",
              "maker_code": "0001",
              "maker_name": "コマツ",
              "division_id": "12",
              "division_code": "0010",
              "division_name": "モータグレーダ",
              "model_id": "936",
              "model": "GD655",
              "model_type_id": "554",
              "type": "3",
              "rev": "E0",
              "type_rev": "3E0",
              "icon_font_no": "72",
              "serial": "51919",
              "pin": "KMTGD022L01051919",
              "production_date": null,
              "initial_smr": "0.0",
              "update_datetime": "2020-04-02T06:52:53.500Z"
            },
            "customer": {
              "id": "12421",
              "label": "前田道路（株）機械部",
              "organization_code": "E1100373",
              "business_type_id": null,
              "business_type_name": null,
              "phone_no": null,
              "address": null
            },
            "customer_attribute": {
              "operator_label1": null,
              "operator_label2": null,
              "operator_label3": null,
              "mainte_in_charge": null,
              "remarks": null,
              "user_memo": null,
              "customer_car_no": null,
              "customer_management_no": "308-00196"
            },
            "operations": [
              {
                "date": "2019/07/01",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/02",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/03",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/04",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/05",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/06",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/07",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/08",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/09",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/10",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/11",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/12",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/13",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/14",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/15",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/16",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/17",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/18",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/19",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/20",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/21",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/22",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/23",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/24",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/25",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/26",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/27",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/28",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/29",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/30",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/31",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              }
            ]
          },
          {
            "car_identification": {
              "id": "229061",
              "maker_id": "1",
              "maker_code": "0001",
              "maker_name": "コマツ",
              "division_id": "4",
              "division_code": "0002",
              "division_name": "ブルドーザ",
              "model_id": "308",
              "model": "D31PX",
              "model_type_id": "246",
              "type": "22",
              "rev": null,
              "type_rev": "22",
              "icon_font_no": "67",
              "serial": "61100",
              "pin": "KMT0D111T01061100",
              "production_date": null,
              "initial_smr": "0.0",
              "update_datetime": "2020-04-02T16:07:54.909Z"
            },
            "customer": {
              "id": "12421",
              "label": "前田道路（株）機械部",
              "organization_code": "E1100373",
              "business_type_id": null,
              "business_type_name": null,
              "phone_no": null,
              "address": null
            },
            "customer_attribute": {
              "operator_label1": null,
              "operator_label2": null,
              "operator_label3": null,
              "mainte_in_charge": null,
              "remarks": null,
              "user_memo": null,
              "customer_car_no": null,
              "customer_management_no": "311-00051"
            },
            "operations": [
              {
                "date": "2019/07/01",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/02",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/03",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/04",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/05",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/06",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/07",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/08",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/09",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/10",
                "operation_time": 0.6,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/11",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/12",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/13",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/14",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/15",
                "operation_time": 6,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/16",
                "operation_time": 7.7,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/17",
                "operation_time": 6.3,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/18",
                "operation_time": 0.2,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/19",
                "operation_time": 0.2,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/20",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/21",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/22",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/23",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/24",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/25",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/26",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/27",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/28",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/29",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/30",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/31",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              }
            ]
          },
          {
            "car_identification": {
              "id": "119672",
              "maker_id": "1",
              "maker_code": "0001",
              "maker_name": "コマツ",
              "division_id": "4",
              "division_code": "0002",
              "division_name": "ブルドーザ",
              "model_id": "308",
              "model": "D31PX",
              "model_type_id": "246",
              "type": "22",
              "rev": null,
              "type_rev": "22",
              "icon_font_no": "67",
              "serial": "60495",
              "pin": "KMT0D111T01060495",
              "production_date": null,
              "initial_smr": "0.0",
              "update_datetime": "2020-02-21T08:46:18.739Z"
            },
            "customer": {
              "id": "12421",
              "label": "前田道路（株）機械部",
              "organization_code": "E1100373",
              "business_type_id": null,
              "business_type_name": null,
              "phone_no": null,
              "address": null
            },
            "customer_attribute": {
              "operator_label1": null,
              "operator_label2": null,
              "operator_label3": null,
              "mainte_in_charge": null,
              "remarks": null,
              "user_memo": null,
              "customer_car_no": null,
              "customer_management_no": "311-00044"
            },
            "operations": [
              {
                "date": "2019/07/01",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/02",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/03",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/04",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/05",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/06",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/07",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/08",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/09",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/10",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/11",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/12",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/13",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/14",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/15",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/16",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/17",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/18",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/19",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/20",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/21",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/22",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/23",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/24",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/25",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/26",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/27",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/28",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/29",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/30",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/31",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              }
            ]
          },
          {
            "car_identification": {
              "id": "135006",
              "maker_id": "1",
              "maker_code": "0001",
              "maker_name": "コマツ",
              "division_id": "4",
              "division_code": "0002",
              "division_name": "ブルドーザ",
              "model_id": "308",
              "model": "D31PX",
              "model_type_id": "246",
              "type": "22",
              "rev": null,
              "type_rev": "22",
              "icon_font_no": "67",
              "serial": "60494",
              "pin": "KMT0D111C01060494",
              "production_date": null,
              "initial_smr": "0.0",
              "update_datetime": "2020-02-21T08:46:18.739Z"
            },
            "customer": {
              "id": "12421",
              "label": "前田道路（株）機械部",
              "organization_code": "E1100373",
              "business_type_id": null,
              "business_type_name": null,
              "phone_no": null,
              "address": null
            },
            "customer_attribute": {
              "operator_label1": null,
              "operator_label2": null,
              "operator_label3": null,
              "mainte_in_charge": null,
              "remarks": null,
              "user_memo": null,
              "customer_car_no": null,
              "customer_management_no": "311-00043"
            },
            "operations": [
              {
                "date": "2019/07/01",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/02",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/03",
                "operation_time": 0.9,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/04",
                "operation_time": 3.1,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/05",
                "operation_time": 0.1,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/06",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/07",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/08",
                "operation_time": 0.7,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/09",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/10",
                "operation_time": 7.2,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/11",
                "operation_time": 7,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/12",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/13",
                "operation_time": 4.9,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/14",
                "operation_time": 0,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/15",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/16",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/17",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/18",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/19",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/20",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/21",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/22",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/23",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/24",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/25",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/26",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/27",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/28",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/29",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/30",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              },
              {
                "date": "2019/07/31",
                "operation_time": null,
                "actual_operation_time": null,
                "idle_time": null,
                "fuel_consumption": null,
                "consumed_electric_power": null
              }
            ]
          }
        ]
      }
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
