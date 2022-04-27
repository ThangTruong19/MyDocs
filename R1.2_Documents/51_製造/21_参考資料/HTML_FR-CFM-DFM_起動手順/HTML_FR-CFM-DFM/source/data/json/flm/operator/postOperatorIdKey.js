var _ = require('lodash');
var moment = require('moment');
var validation = require('../../common/validation');
var pickAvailableResponse = require('../../common/pickAvailableResponse');
var successEmpty = require('../../common/successEmpty');

module.exports = function (args) {
  var xfields = args.header['x-fields'] && args.header['x-fields'].split(',');
  var from = isNaN(args.header['x-from']) ? 1 : parseInt(args.header['x-from']);
  var count = isNaN(args.header['x-count'])
    ? 0
    : parseInt(args.header['x-count']);
  var sort = args.header['x-sort'] || 'id_key_code';
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
      result_data.cars.push(createData(i));
    }
  }

  mock.result_data = pickAvailableResponse(result_data, xfields);
  return success(mock);
};

function createData(i) {
  var data;
  var type;
  var rev;
  var type_rev;
  var division_array = [
    { id: '1', name: 'ショベル' },
    { id: '2', name: '油圧ショベル' },
    { id: '3', name: 'スキッドステアローダ' },
  ];
  var division;
  var division_id;
  var division_name;

  type = 'A' + ('0000' + i * 1000 + i).slice(-5);
  rev = 'M' + ('000' + (i * 100 + i)).slice(-4);
  division = division_array[Math.floor(Math.random() * division_array.length)];
  division_id = division['id'];
  division_name = division['name'];

  if (i % 3 != 0) {
    type_rev = type + rev;
  } else {
    type_rev = type;
  }

  data = {
    car_identification: {
      id: i.toString(),
      maker_id: ('000' + i).slice(-4),
      maker_code: '0001',
      maker_name: 'コマツ' + ('000' + i).slice(-4),
      division_id: division_id,
      division_code: '0001',
      division_name: division_name,
      model_id: (i * 100 + i).toString(),
      model: 'SK' + ('000' + (i * 100 + i)).slice(-4),
      model_type_id: (i * 100 + i + 1).toString(),
      type: type,
      rev: rev,
      type_rev: type_rev,
      icon_font_no: (i * 1000 + i).toString(),
      serial: 'S' + ('000' + (i * 10 + i)).slice(-4),
      pin: '#' + ('000' + (i * 10 + i)).slice(-4),
      production_date: moment()
        .subtract(i, 'days')
        .format('YYYY/MM/DD'),
      initial_smr: '100.5',
      update_datetime: moment().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
    },
    customer: {
      id: i.toString(),
      label: '顧客_' + ('00' + i).slice(-3),
      label_english: 'customer_' + ('00' + i).slice(-3),
      organization_code: 'NU' + ('000' + i).slice(-4),
      business_type_id: (i * 10 + i).toString(),
      business_type_name: '建設業' + ('00' + i).slice(-3),
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
      customer_car_no: 'car' + ('000' + i).slice(-4),
      customer_management_no: 'cast_no' + ('000' + i).slice(-4),
    },
    car_operator: createCarOperator(i),
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

function createCarOperator(i) {
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
    '2': 'ID入力',
    '99': '設定不可',
  };
  registration_status_kind = Math.floor(2 * Math.random()).toString();
  // 登録ステータスが設定準備中、設定不可なら他は全て不可
  progress_kind = Math.floor(3 * Math.random()).toString();
  operator_identification_kind = i % 2 === 0 ? '3' : '0';

  return {
    registration_status_kind: registration_status_kind,
    registration_status_name: registration_status[registration_status_kind],
    progress_kind: progress_kind,
    progress_name: progress[progress_kind],
    operator_identification_kind: operator_identification_kind,
    operator_identification_name:
      operator_identification[operator_identification_kind],
  };
}
