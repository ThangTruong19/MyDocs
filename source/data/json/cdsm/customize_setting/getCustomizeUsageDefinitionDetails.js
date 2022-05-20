var validation = require('../../common/validation.js');

module.exports = function (args) {
  var systemErrorData = validation(args.query, 'system_error');
  if (systemErrorData.length > 0) {
    return fail500();
  }

  var from = isNaN(args.header['x-from']) ? 1 : parseInt(args.header['x-from']);
  var count = isNaN(args.header['x-count'])
    ? 0
    : parseInt(args.header['x-count']);
  var sort = args.header['x-sort'] || 'customize_usage_definitions.customize_usage_definition.customize_usage_definition_id';
  var TOTAL = isNaN(args.header['x-count']) ? 1 : 5;
  var loopEnd =
    TOTAL > from + count - 1 && count !== 0 ? from + count - 1 : TOTAL;
  var listMock = {
    result_header: {
      'X-From': from,
      'X-Count': count,
      'X-Sort': sort,
      'X-TotalCount': TOTAL,
      'Cache-Control': 'no-cache',
    },
    result_data: {
      customize_usage_definitions: [],
    },
  };
  var data;
  for (var i = from; i <= loopEnd; i++) {
    listMock.result_data.customize_usage_definitions.push(createData(i));
  }

  return success(listMock);
};

function createData(i) {
  var moment = require('moment');

  data = {
    customize_usage_definition: {
      customize_usage_definition_id: String(i),
      customize_usage_definition_name: "KOMTRAX標準" + i,
      customize_usage_definition_version: 1,
      start_date: "2017/12/30",
      end_date: "2017/12/30",
      priority: "1",
      priority_name: "low",
      use_kind: "0",
      use_name: "利用中",
      customize_definitions: [
        {
          customize_definition_id: "1",
          customize_definition_name: "KOMTRAXデータ v1.0",
          customize_definition_version: 1,
          priority: "1",
          priority_name: "low",
          active_kind: "1",
          active_name: "有効",
          latest_operation_code: "1",
          latest_operation_code_name: "追加",
          status: "10",
          status_name: "送信中",
          assumption_data_value: 2022000,
          start_date: "2017/12/30",
          end_date: "2017/12/30",
          first_receive_datetime: "2017/02/01 23:59:59",
          latest_receive_datetime: "2017/05/23 23:59:59",
          aggregation_condition_id: "1",
          aggregation_condition_name: "10分毎",
          send_condition_id: "1",
          send_condition_name: "1時間毎",
          customize_access_level: "1",
          customize_access_level_name: "開発者",
          assumption_data_value_header: 2000,
          aggregation_opportunity_kind: '1',
          aggregation_opportunity_kind_name: 'aggregation01',
          send_opportunity_kind: '1',
          send_opportunity_kind_name: 'send01',
          process_type: '1',
          process_type_name: 'process01'
        },
        {
          customize_definition_id: "2",
          customize_definition_name: "KOMTRAXデータ v2.0",
          customize_definition_version: 2,
          priority: "2",
          priority_name: "low",
          active_kind: "2",
          active_name: "有効",
          latest_operation_code: "2",
          latest_operation_code_name: "追加",
          status: "20",
          status_name: "送信中",
          assumption_data_value: 2022000,
          start_date: "2017/12/30",
          end_date: "2017/12/30",
          first_receive_datetime: "2017/02/01 23:59:59",
          latest_receive_datetime: "2017/05/23 23:59:59",
          aggregation_condition_id: "2",
          aggregation_condition_name: "20分毎",
          send_condition_id: "2",
          send_condition_name: "2時間毎",
          customize_access_level: "2",
          customize_access_level_name: "開発者",
          assumption_data_value_header: 2000,
          aggregation_opportunity_kind: '1',
          aggregation_opportunity_kind_name: 'aggregation01',
          send_opportunity_kind: '1',
          send_opportunity_kind_name: 'send01',
          process_type: '1',
          process_type_name: 'process01'
        },
        {
          customize_definition_id: "3",
          customize_definition_name: "KOMTRAXデータ v3.0",
          customize_definition_version: 3,
          priority: "3",
          priority_name: "low",
          active_kind: "3",
          active_name: "有効",
          latest_operation_code: "3",
          latest_operation_code_name: "追加",
          status: "30",
          status_name: "送信中",
          assumption_data_value: 2022000,
          start_date: "2017/12/30",
          end_date: "2017/12/30",
          first_receive_datetime: "2017/02/01 23:59:59",
          latest_receive_datetime: "2017/05/23 23:59:59",
          aggregation_condition_id: "3",
          aggregation_condition_name: "30分毎",
          send_condition_id: "3",
          send_condition_name: "3時間毎",
          customize_access_level: "3",
          customize_access_level_name: "開発者",
          assumption_data_value_header: 2000,
          aggregation_opportunity_kind: '2',
          aggregation_opportunity_kind_name: 'aggregation02',
          send_opportunity_kind: '1',
          send_opportunity_kind_name: 'send01',
          process_type: '1',
          process_type_name: 'process01'
        },
        {
          customize_definition_id: "4",
          customize_definition_name: "KOMTRAXデータ v4.0",
          customize_definition_version: 3,
          priority: "3",
          priority_name: "low",
          active_kind: "3",
          active_name: "有効",
          latest_operation_code: "3",
          latest_operation_code_name: "追加",
          status: "30",
          status_name: "送信中",
          assumption_data_value: 2022000,
          start_date: "2017/12/30",
          end_date: "2017/12/30",
          first_receive_datetime: "2017/02/01 23:59:59",
          latest_receive_datetime: "2017/05/23 23:59:59",
          aggregation_condition_id: "3",
          aggregation_condition_name: "30分毎",
          send_condition_id: "3",
          send_condition_name: "3時間毎",
          customize_access_level: "3",
          customize_access_level_name: "開発者",
          assumption_data_value_header: 2000,
          aggregation_opportunity_kind: '1',
          aggregation_opportunity_kind_name: 'aggregation01',
          send_opportunity_kind: '2',
          send_opportunity_kind_name: 'send02',
          process_type: '2',
          process_type_name: 'process02'
        }
      ]
    }
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
    status: 400,
    json: {
      error_data: [
        {
          code: 'ERR0001',
          message: msg,
          keys: '???',
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
