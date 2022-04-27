var _ = require('lodash');
var validation = require('../../common/validation.js');
var pickAvailableResponse = require('../../common/pickAvailableResponse');

module.exports = function (args) {
  var systemErrorData = validation(args.query, 'system_error');
  if (systemErrorData.length > 0) {
    return fail500();
  }
  const xFields = args.header['x-fields'];
  var from = parseInt(args.header['x-from']);
  var count = parseInt(args.header['x-count']);
  var sort = args.header['x-sort'] || '';
  var TOTAL = 100;
  var loopEnd = TOTAL > from + count - 1 ? from + count - 1 : TOTAL;
  var data = {
    accumulate_fuel_interval_items: [],
  };

  /**
   * 変更画面用のデータと一覧画面用のレスポンス用データの作成処置を分ける
   */
  if (args.query.accumulate_fuel_interval_item_id) {
    // 変更画面の場合

    from = 1;
    count = 1;
    const id = args.query.accumulate_fuel_interval_item_id;

    data.accumulate_fuel_interval_items.push(createData(args, id));
    return success({
      result_header: {
        'X-From': from,
        'X-Count': count,
        'X-Sort': sort,
        'X-TotalCount': TOTAL,
        'Cache-Control': 'no-cache',
      },
      result_data: xFields ? pickAvailableResponse(data, xFields) : data,
    });
  } else {
    // 一覧画面の場合
    for (var i = from; i <= loopEnd; i++) {
      data.accumulate_fuel_interval_items.push(createData(args, i));
    }

    return success({
      result_header: {
        'X-From': from,
        'X-Count': count,
        'X-Sort': sort,
        'X-TotalCount': TOTAL,
        'Cache-Control': 'no-cache',
      },
      result_data: xFields ? pickAvailableResponse(data, xFields) : data,
    });
  }
};

function createData(args, i) {
  var data = {
    support_distributor_id: args.query.support_distributor_id
      ? args.query.support_distributor_id
      : 'A0001',
    support_distributor_label: 'コマツ東京C',
    support_distributor_label_english: 'KOMATSU Tokyo C',
    id: '11',
    label: 'エンジンOV',
    inspection_start_accumulate_fuel: 30000,
    accumulate_fuel_interval: 20000,
    accumulate_fuel_interval_kind: '1',
    threshold: null,
    threshold_kind: '0',
    target_model_kind: '1',
    update_datetime: '2017-05-23T23:59:59.999Z',
    car_conditions: [
      {
        division_name: '油圧ショベル',
        division_code: '0001',
        maker_name: 'コマツ',
        maker_code: '0001',
        model: 'SK714',
        type_rev: 'A12345M0',
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

function fail(msgs) {
  return {
    status: 400,
    json: {
      error_data: [
        {
          code: 'COM0002E',
          message: 'リクエスト情報が不正です。',
          keys: ['car_id'],
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
