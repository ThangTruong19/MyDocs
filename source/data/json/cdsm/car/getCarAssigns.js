var pickAvailableResponse = require('../../common/pickAvailableResponse');

module.exports = function(args) {
  var xFields = args.header['x-fields'];
  var from = isNaN(args.header['x-from']) ? 1 : parseInt(args.header['x-from']);
  var count = isNaN(args.header['x-count'])
    ? 0
    : parseInt(args.header['x-count']);
  var sort = args.header['x-sort'] || '';
  var TOTAL = isNaN(args.header['x-count']) ? 1 : 100;
  var loopEnd =
    TOTAL > from + count - 1 && count !== 0 ? from + count - 1 : TOTAL;

  var data = {
    car_assigns: [],
  };

  for (var i = from; i <= loopEnd; i++) {
    data.car_assigns.push(createData(i));
  }
  data = pickAvailableResponse(data, xFields);
  return success({
    result_header: {
      'X-From': from,
      'X-Count': count,
      'X-Sort': sort,
      'X-TotalCount': TOTAL,
      'Cache-Control': 'no-cache',
    },
    result_data: data,
  });
};

function success(data) {
  return {
    status: 200,
    json: {
      result_data: data.result_data,
    },
    header: data.result_header,
  };
}

function fail() {
  return {
    status: 400,
    json: {
      error_data: [
        {
          keys: ['car_id'],
          message: 'リクエスト情報が不正です。',
          code: 'COM0002E',
        },
      ],
    },
  };
}

function createData(number) {
  return {
    car: {
      change_support_distributor: {
        label_english: 'KOMATSU Tokyo C',
        label: 'コマツ東京C',
        id: '3',
      },
      assigned_group: {
        label_english: 'group1',
        label: 'グループ1',
        id: '2',
      },
      car_identification: {
        update_datetime: '2017-05-23T23:59:59.999Z',
        initial_smr: '100.5',
        production_date: '2017/05/23',
        model_id: '1',
        division_name: 'ブルドーザ',
        division_code: '0001',
        division_id: '1',
        maker_name: 'コマツ',
        maker_code: '0001',
        maker_id: '1',
        id: '1',
        model: 'D85PX',
        model_type_id: '1',
        type: '15',
        rev: 'E0',
        type_rev: '15E0',
        icon_font_no: '1',
        serial: 'A1234' + number,
        pin: 'KMT0D101CJAA12345',
      },
    },
    update_datetime: '2017-05-23T23:59:59.999Z',
    status_name: '申請中',
    status: '1',
    id: String(number),
  };
}
