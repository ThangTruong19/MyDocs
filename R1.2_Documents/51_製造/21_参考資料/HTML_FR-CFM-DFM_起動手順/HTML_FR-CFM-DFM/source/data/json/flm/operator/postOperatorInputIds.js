var _ = require('lodash');
var validation = require('../../common/validation');
var pickAvailableResponse = require('../../common/pickAvailableResponse');
var successEmpty = require('../../common/successEmpty');

module.exports = function (args) {
  var xfields = args.header['x-fields'] && args.header['x-fields'].split(',');
  var from = isNaN(args.header['x-from']) ? 1 : parseInt(args.header['x-from']);
  var count = isNaN(args.header['x-count'])
    ? 0
    : parseInt(args.header['x-count']);
  var sort = args.header['x-sort'] || 'division';
  var car_id = '';
  var car_ids = [];

  if (_.has(args.body, 'common.car_identification.car_ids')) {
    var TOTAL = args.body.common.car_identification.car_ids.length;
    var loopEnd = TOTAL;
    if (TOTAL === 1) {
      car_id = args.body.common.car_identification.car_ids[0];
    } else {
      car_ids = args.body.common.car_identification.car_ids;
    }
  } else {
    var TOTAL = isNaN(args.header['x-count']) ? 1 : 100;
    var loopEnd =
      TOTAL > from + count - 1 && count !== 0 ? from + count - 1 : TOTAL;
  }

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
  var result_data = { cars: [] };
  const kind = Math.random() < 0.5 ? '1' : '99';

  if (validation(args.body, 'system_error').length > 0) {
    return fail500();
  }
  // 検索項目にemptyという値が入力されていれば、該当車両なしでレスポンスが返る
  if (validation(args.body, 'empty').length > 0) {
    return successEmpty('cars', mock);
  }

  if (!_.isEmpty(car_id) && count === 0) {
    result_data.cars.push(createData(Number(car_id)));
  } else if (!_.isEmpty(car_ids) && count === 0) {
    _.each(car_ids, id => {
      result_data.cars.push(createData(Number(id)));
    });
  } else {
    for (var i = from; i <= loopEnd; i++) {
      result_data.cars.push(createData(i, kind));
    }
  }

  mock.result_data = pickAvailableResponse(result_data, xfields);
  return success(mock);
};

function createData(i, kind) {
  var data = {
    registration_id_count: 100 + i,
    car_identification: {
      id: i.toString(),
      maker_id: '1',
      maker_name: 'コマツ',
      maker_code: '0001',
      division_id: '1',
      division_name: 'スキッドステアローダ',
      division_code: '0001',
      model_id: '1',
      model: 'SK714',
      model_type_id: '1',
      type: 'A12',
      rev: 'M0',
      type_rev: 'A12345M0',
      icon_font_no: '1',
      serial: 'A1234' + i,
      pin: '12345',
      initial_smr: '100.5',
      production_date: '2017/05/23',
      update_datetime: '2017-05-23T23:59:59.999Z',
    },
    customer: {
      id: '1',
      label: '顧客_' + i,
      label_english: 'customer_' + i,
      organization_code: 'NU000' + i,
      business_type_id: '1',
      business_type_name: '建設業',
      address: '青森県青森市青森町2-10',
      phone_no: '(03)5412-1111',
    },
    customer_attribute: {
      operator_label1: 'オペレータ１',
      operator_label2: 'オペレータ２',
      operator_label3: 'オペレータ３',
      mainte_in_charge: '保守責任者',
      remarks: '特記事項です',
      user_memo: '自由記入欄です',
      customer_car_no: '12345' + i,
      customer_management_no: '12345' + i,
    },
    car_operator: createCarOperator(i, kind),
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

function createCarOperator(i, kind) {
  var registration_status_kind;
  var registration_status = {
    '0': '設定可能',
    '1': '送信中',
  };
  var progress_kind;
  var progress = {
    '0': '未設定',
    '1': '送信中',
    '2': '完了',
    '99': '設定不可',
  };
  var operator_identification_kind;
  var operator_identification = {
    '0': 'OFF',
    '2': 'ID入力（スキップあり）',
    '99': '設定不可',
  };
  registration_status_kind = Math.floor(2 * Math.random()).toString();
  progress_kind = Math.floor(3 * Math.random()).toString();
  operator_identification_kind = i % 2 ? '1' : '0';

  return {
    registration_status_kind: registration_status_kind,
    registration_status_name: registration_status[registration_status_kind],
    progress_kind: progress_kind,
    progress_name: progress[progress_kind],
    operator_identification_kind: operator_identification_kind,
    operator_identification_name:
      operator_identification[operator_identification_kind],
    id_hold_time: _.sample([10, 20, 30, 40]) * 60,
  };
}

function fail(msg) {
  return {
    status: 500,
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
