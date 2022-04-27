var _ = require('lodash');
var pickAvailableResponse = require('../../common/pickAvailableResponse');

module.exports = function (args) {
  if (
    args.header.accept ===
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    args.header.accept === 'text/comma-separated-values'
  ) {
    return startDownload({
      id: '0',
      name: '〇〇ファイル作成',
      request_datetime: '2000/01/01 00:00:00',
      complete_datetime: '2000/01/01 00:00:00',
      request_api_id: 'KOM-00100010',
      result_api_id: 'KOM-00000011',
      status_code: '0',
      status_name: '受付',
      content_type: args.header.accept,
    });
  }

  const xFields = args.header['x-fields'];
  var from = parseInt(args.header['x-from']);
  var count = parseInt(args.header['x-count']);
  var sort = args.header['x-sort'] || '';
  var TOTAL = 100;
  var loopEnd = TOTAL > from + count - 1 ? from + count - 1 : TOTAL;
  var data = {
    smr_interval_items: [],
  };

  /**
   * 変更画面用のデータと一覧画面用のレスポンス用データの作成処置を分ける
   */
  if (args.query.smr_interval_item_id) {
    // 変更画面の場合

    from = 1;
    count = 1;
    const id = args.query.smr_interval_item_id;

    data.smr_interval_items.push(createData(args, id));
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
      data.smr_interval_items.push(createData(args, i));
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
  var item;
  if (i % 3 === 0) {
    item = {
      support_distributor_id: args.query.support_distributor_id || 'A0001',
      support_distributor_label: 'コマツ東京C',
      support_distributor_label_english: 'KOMATSU Tokyo C',
      id: '' + i,
      label: `${i}時間点検`,
      inspection_start_smr: '500.0',
      smr_interval_kind: '0',
      smr_interval: null,
      threshold: '-50.0',
      threshold_kind: '1',
      target_model_kind: '1',
      update_datetime: '2017-05-23T23:59:59.999Z',
      car_conditions: [
        {
          type_rev: 'A12345M0',
          model: 'SK714',
          division_name: '油圧ショベル',
          division_code: '0001',
          maker_name: 'コマツ',
          maker_code: '0001',
        },
        {
          type_rev: 'A12345M1',
          model: 'SK100',
          division_name: 'クレーン',
          division_code: '0002',
          maker_name: 'コマツ',
          maker_code: '0002',
        },
        {
          type_rev: 'A12345M2',
          model: 'SK100',
          division_name: 'クレーン',
          division_code: '0003',
          maker_name: 'コマツ',
          maker_code: '0003',
        },
      ],
    };
  } else if (i % 3 === 1) {
    item = {
      support_distributor_id: args.query.support_distributor_id || 'A0002',
      support_distributor_label: 'コマツ東京C',
      support_distributor_label_english: 'KOMATSU Tokyo C',
      id: '' + i,
      label: `${i}時間点検`,
      inspection_start_smr: '500.0',
      smr_interval_kind: '0',
      threshold_kind: '0',
      target_model_kind: '1',
      update_datetime: '2017-05-23T23:59:59.999Z',
      threshold: null,
      smr_interval: null,
      car_conditions: [
        {
          type_rev: 'A12345M0',
          model: 'SK714',
          division_name: '油圧ショベル',
          division_code: '0001',
          maker_name: 'コマツ',
          maker_code: '0001',
        },
      ],
    };
  } else {
    item = {
      support_distributor_id: args.query.support_distributor_id || 'A0001',
      support_distributor_label: 'コマツ東京C',
      support_distributor_label_english: 'KOMATSU Tokyo C',
      id: '' + i,
      label: `${i}時間点検`,
      inspection_start_smr: '500.0',
      smr_interval: '' + i,
      smr_interval_kind: '1',
      threshold: '-50.0',
      threshold_kind: '1',
      target_model_kind: '0',
      update_datetime: '2017-05-23T23:59:59.999Z',
      car_conditions: [],
    };
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
