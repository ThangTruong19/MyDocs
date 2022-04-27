var _ = require('lodash');
var validation = require('../../common/validation');
var pickAvailableResponse = require('../../common/pickAvailableResponse');
var successEmpty = require('../../common/successEmpty');

module.exports = function(args) {
  var xfields = args.header['x-fields'] && args.header['x-fields'].split(',');
  var from = isNaN(args.header['x-from']) ? 1 : parseInt(args.header['x-from']);
  var count = isNaN(args.header['x-count'])
    ? 0
    : parseInt(args.header['x-count']);
  var sort = args.header['x-sort'] || 'cars.car_identification.model';
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
    result_data.cars.push(createData(car_id, args.body));
  } else if (!_.isEmpty(car_ids) && count === 0) {
    _.each(car_ids, id => {
      result_data.cars.push(createData(id, args.body));
    });
  } else {
    for (var i = from; i <= loopEnd; i++) {
      result_data.cars.push(createData(i, args.body));
    }
  }

  mock.result_data = pickAvailableResponse(result_data, xfields);
  return success(mock);
};

function createData(i, body = null) {
  var data = {
    car_identification: {
      id: '' + i,
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
      production_date: '2019/05/23',
      initial_smr: '100.5',
      update_datetime: '2019-05-23T23:59:59.999Z',
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
    rental: {
      reservation1: {
        connection_id: '1111',
        customer_id: '1',
        customer_label: 'コマツ建設',
        customer_label_english: 'Komatsu_Construction',
        start_date: '10/01/2019',
        end_date: '10/31/2019',
        viewable_connection_id: '1234',
        viewable_end_date: '10/30/2019',
      },
      reservation2: {
        connection_id: '2222',
        customer_id: '2',
        customer_label: 'コマツ建築',
        customer_label_english: 'Komatsu_Architecture',
        start_date: '04/01/2019',
        end_date: '04/30/2019',
        viewable_connection_id: '4321',
        viewable_end_date: '05/31/2019',
      },
    },
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
