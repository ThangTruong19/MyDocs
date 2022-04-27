var pickAvailableResponse = require('../../common/pickAvailableResponse');

module.exports = function(args) {
  var xFields = args.header['x-fields'];
  var model = args.query.model;
  var TOTAL = 5;
  var mock = {
    result_header: {
      'X-From': 1,
      'X-Count': 0,
      'X-Sort':
        'accumulate_fuel_interval_item_links.car_condition.maker_name,accumulate_fuel_interval_item_links.car_condition.model,accumulate_fuel_interval_item_links.car_condition.type_rev',
      'X-TotalCount': TOTAL,
      'Cache-Control': 'no-cache',
    },
    result_data: {},
  };

  var data = {
    accumulate_fuel_interval_item_links: [],
  };
  for (let i = 1; i < TOTAL; i++) {
    data.accumulate_fuel_interval_item_links.push(createData(i, model));
  }

  mock.result_data = pickAvailableResponse(data, xFields);
  return success(mock);
  // return fail500();
};

function createData(i, model) {
  return {
    car_condition: {
      type_rev: `A12345M${i}`,
      model: model,
      division_name: '油圧ショベル',
      division_code: '0001',
      maker_name: 'コマツ',
      maker_code: '0001',
    },
    accumulate_fuel_interval_items: createFuelItems(i),
  };
}

function createFuelItems(i) {
  var data = [];
  for (let j = 0; j < i % 4; j++) {
    data.push(createItem(j));
  }
  return data;
}

function createItem(i) {
  const item = {
    support_distributor_id: '1000017',
    support_distributor_label: 'コマツ東京C',
    support_distributor_label_english: 'KOMATSU Tokyo C',
    id: '11',
    label: 'エンジンOV',
    inspection_start_accumulate_fuel: 30000,
    accumulate_fuel_interval: 20000,
    accumulate_fuel_interval_kind: '1',
    threshold: -1000,
    threshold_kind: '1',
    target_model_kind: '1',
    update_datetime: '2017-05-23T23:59:59.999Z',
  };

  if (i % 2) {
    item.accumulate_fuel_interval_kind = '0';
    delete item.accumulate_fuel_interval;
  }

  if (i % 3) {
    item.threshold_kind = '0';
    delete item.threshold;
  }

  return item;
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
