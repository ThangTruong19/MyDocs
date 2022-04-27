var pickAvailableResponse = require('../../common/pickAvailableResponse');
var validation = require('../../common/validation');
var successEmpty = require('../../common/successEmpty');
var _ = require('lodash');

module.exports = function(args) {
  var xFields = args.header['x-fields'];
  var from = isNaN(args.header['x-from']) ? 1 : parseInt(args.header['x-from']);
  var count = isNaN(args.header['x-count'])
    ? 0
    : parseInt(args.header['x-count']);
  var sort = args.header['x-sort'] || 'cars.car_identification.model';
  var TOTAL = isNaN(args.header['x-count']) ? 1 : 100;
  var loopEnd =
    TOTAL > from + count - 1 && count !== 0 ? from + count - 1 : TOTAL;
  var car_ids = _.get(args.body, 'common.car_identification.car_ids', []);
  var mock = {
    result_header: {
      'X-From': from,
      'X-Count': count,
      'X-Sort': sort,
      'X-TotalCount': TOTAL,
      'Cache-Control': 'no-cache',
    },
    result_data: {
      cars: [],
    },
  };

  // 検索項目にemptyという値が入力されていれば、該当車両なしでレスポンスが返る
  if (validation(args.body, 'empty').length > 0) {
    return successEmpty('cars', mock);
  }

  for (var i = from; i <= loopEnd; i++) {
    if (car_ids.length === 0 || car_ids.includes(i.toString())) {
      mock.result_data.cars.push(createData(i));
    }
  }

  mock.result_data = pickAvailableResponse(mock.result_data, xFields);

  return success(mock);
};

function createData(i) {
  var data = {
    car_identification: null,
    support_distributor: null,
    service_distributor: null,
    customer: null,
  };

  data.car_identification = {
    id: '' + i,
    maker_id: '1',
    maker_name: 'コマツ' + 10 ** i,
    division_id: '1',
    division_code: '0001',
    division_name: 'スキッドステアローダ',
    model_id: '1',
    model: 'SK714',
    model_type_id: '1',
    type: 'A12345',
    rev: 'M0',
    type_rev: 'A12345M0',
    icon_font_no: '1',
    serial: 'A12345',
    pin: '12345',
    production_date: '2017/05/23',
    update_datetime: '2017-05-23T23:59:59.999Z',
  };

  data.support_distributor = {
    id: 'A0001',
    label: 'コマツ東京A',
    label_english: 'KOMATSU Tokyo A',
    organization_code: 'NU0001',
    sub_groups: [
      {
        id: '1',
        label: 'コマツ東京C',
        label_english: 'KOMATSU Tokyo C',
      },
      {
        id: '2',
        label: 'コマツ東京D',
        label_english: 'KOMATSU Tokyo D',
      },
    ],
  };

  data.service_distributor = {
    id: 'A000' + ((i % 3) + 1),
    label: 'サービスDB' + ((i % 3) + 1),
    label_english: 'ServiceDB' + ((i % 3) + 1),
    organization_code: 'NU0002',
    sub_groups: [
      {
        id: '3',
        label: 'コマツ東京Y',
        label_english: 'KOMATSU Tokyo Y',
      },
    ],
  };

  data.customer = {
    id: '' + i,
    label: '顧客 ' + 10 ** i,
    label_english: 'customer ' + i,
    organization_code: 'NU0001',
    business_type_id: '1',
    business_type_name: '建設業',
    sub_groups: [
      {
        id: '1',
        label: 'コマツ東京C',
        label_english: 'KOMATSU Tokyo C',
      },
    ],
  };

  return data;
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

function startDownload(data) {
  return {
    status: 202,
    json: {
      result_data: data,
    },
  };
}

function fail(msg) {
  return {
    status: 400,
    json: {
      error_data: [
        {
          code: 'ERR0001',
          message: msg,
          key: '???',
        },
      ],
    },
  };
}
