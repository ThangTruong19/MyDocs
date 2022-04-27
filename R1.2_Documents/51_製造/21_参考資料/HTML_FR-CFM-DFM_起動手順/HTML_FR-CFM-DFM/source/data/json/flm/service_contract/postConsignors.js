var _ = require('lodash');
var moment = require('moment');
var validation = require('../../common/validation');
var pickAvailableResponse = require('../../common/pickAvailableResponse');
var successEmpty = require('../../common/successEmpty');

module.exports = function(args) {
  var xfields = args.header['x-fields'].split(',');
  var from = isNaN(args.header['x-from']) ? 1 : parseInt(args.header['x-from']);
  var count = isNaN(args.header['x-count'])
    ? 0
    : parseInt(args.header['x-count']);
  var sort =
    args.header['x-sort'] ||
    'cars.car_identification.model,cars.car_identification.type_rev,cars.car_identification.serial';
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
  var data;

  // 検索項目にemptyという値が入力されていれば、該当車両なしでレスポンスが返る
  if (validation(args.body, 'system_error').length > 0) {
    return fail500();
  }
  if (validation(args.body, 'empty').length > 0) {
    return successEmpty('cars', mock);
  }

  if (!_.isEmpty(car_id) && count === 0) {
    result_data.cars.push(createData(car_id));
  } else if (!_.isEmpty(car_ids) && count !== 0) {
    _.each(car_ids, id => {
      result_data.cars.push(createData(id));
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
  var divisions = {
    '0001': {
      division_id: '1',
      division_code: '0001',
      division_name: '油圧ショベル',
      models: ['PD200', 'PD300', 'SPD200', 'SPD300'],
      types: ['21', '22'],
    },
    '0002': {
      division_id: '2',
      division_code: '0002',
      division_name: 'ホイールローダ',
      models: ['PO200', 'PO300', 'SPO200', 'SPO300'],
      types: ['31', '32', '33', '34', '131', '132', '133', '231'],
    },
    '0003': {
      division_id: '3',
      division_code: '0003',
      division_name: 'クレーン',
      models: ['PC200', 'PC300', 'PC400'],
      types: ['41', '42', '43'],
    },
  };
  var rev = 'M0';
  var maker_code = ('000' + ((i % 3) + 1)).slice(-4);
  var division = divisions[maker_code];
  var support_distributor_id = ('000' + ((i % 2) + 1)).slice(-4);
  var support_distributor_label = 'コマツ東京C' + support_distributor_id;
  var support_distributor_label_english =
    'KOMATSU Tokyo C' + support_distributor_id;
  var service_distributor_id = ('000' + ((i % 2) + 1)).slice(-4);
  var customer_id = support_distributor_id + ('0' + ((i % 4) + 1)).slice(-2);
  var customer_label =
    support_distributor_label + 'の顧客' + ('0' + ((i % 4) + 1)).slice(-2);
  var customer_label_english =
    support_distributor_label_english +
    ' of Customer' +
    ('0' + ((i % 4) + 1)).slice(-2);
  var applyStatus = i % 3 === 0 ? 1 : 0;
  var applyStatusName = ['未申請/完了', '申請中'];

  data = {
    car_identification: {
      id: String(i),
      maker_id: String((i % 3) + 1),
      maker_code: maker_code,
      maker_name: 'コマツ' + maker_code,
      division_id: division.division_id,
      division_code: division.division_code,
      division_name: division.division_name,
      model_id: '2',
      model: division.models[2],
      model_type_id: '1',
      type: division.types[1],
      rev: rev,
      type_rev: division.types[1] + '21' + rev,
      icon_font_no: '1',
      serial: 'A1234' + i,
      pin: '12345',
      production_date: moment()
        .subtract(1, 'years')
        .format('YYYY-MM-DD HH:mm:ss'),
      initial_smr: '100.5',
      update_datetime:
        moment()
          .subtract(1, 'days')
          .format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z',
    },
    support_distributor: {
      id: 'A' + support_distributor_id,
      label: support_distributor_label,
      label_english: [support_distributor_label_english, null][i % 2],
      organization_code: 'NU0001',
    },
    service_distributor: {
      id: 'D' + service_distributor_id,
      label: 'コマツ東京D' + service_distributor_id,
      label_english: 'KOMATSU Tokyo D' + service_distributor_id,
      organization_code: 'NU0002',
    },
    customer: {
      id: 'A' + customer_id,
      label: customer_label,
      label_english: customer_label_english,
      organization_code: 'NU0003',
      business_type_id: '1',
      business_type_name: '建設業',
      phone_no: '(03)5412-1111',
      address: '青森県青森市青森町2-10',
    },
    service_contract: {
      status: String(applyStatus),
      status_name: applyStatusName[applyStatus],
    },
    service_contract_request: 'null',
  };

  if (applyStatus === 1) {
    data.service_contract_request = {
      free_memo: '自由メモです' + i,
      update_datetime: moment().format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z',
      status: '0',
      receive_datetime: moment()
        .subtract(1, 'months')
        .format('YYYY-MM-DD HH:mm:ss'),
      applicant_label: '小松太郎',
      status_name: '未承認',
      id: String(i),
      service_distributor: {
        id: 'D' + service_distributor_id,
        label: 'コマツ東京D' + service_distributor_id,
        label_english: 'KOMATSU Tokyo D' + service_distributor_id,
      },
      applicant_email: 'tarou.komatsu@example.com',
    };
  }

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
