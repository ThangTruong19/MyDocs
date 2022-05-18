var _ = require('lodash');

module.exports = function() {
  var from = 1;
  var count = 3;
  var sort = 'customize_definition.customize_definition_id';
  var TOTAL = 3;
  var loopEnd = 3;
  var mock = {
    result_header: {
      'X-From': from,
      'X-Count': count,
      'X-Sort': sort,
      'X-TotalCount': TOTAL,
      'Cache-Control': 'no-cache',
    },
    result_data: {},
  };

  mock.result_data.customize_definitions = createData(count);

  return success(mock);
  // return fail500();
};

function createData(count) {
  const result = [];

  result.push({
    customize_definition : {
      "customize_definition_id": 1,
      "customize_definition_name": "KOMTRAXデータ 1" ,
      "customize_definition_version": 1.01,
      "assumption_data_value": 2022000,
      "priority": "1",
      "priority_name": "low",
      "active_kind": "1",
      "active_name": "有効",
      "customize_access_level": 1,
      "customize_access_level_name": "開発者",
      "aggregation_condition_id": 1,
      "aggregation_condition_name": "10分毎",
      "aggregation_opportunity_kind": 1,
      "send_opportunity_kind": 1,
      "send_condition_id": 1,
      "send_condition_name": "1時間毎",
      "status": "10",
      "status_name": "送信中",
      "latest_operation_code": "1",
      "latest_operation_code_name": "追加",
      "start_date": "2017/12/30",
      "end_date": "2017/12/30",
      "first_receive_datetime": "2017/02/01 23:59:59",
      "last_receive_datetime": "2017/05/23 23:59:59",
      "assumption_data_value_header" : 1000,
      "process_type" : "1"
    },
  });

  result.push({
    customize_definition : {
      "customize_definition_id": 2,
      "customize_definition_name": "KOMTRAXデータ 2" ,
      "customize_definition_version": 2.01,
      "assumption_data_value": 3022000,
      "priority": "1",
      "priority_name": "low",
      "active_kind": "1",
      "active_name": "有効",
      "customize_access_level": 1,
      "customize_access_level_name": "開発者",
      "aggregation_condition_id": 2,
      "aggregation_condition_name": "20分毎",
      "aggregation_opportunity_kind": 1,
      "send_opportunity_kind": 1,
      "send_condition_id": 2,
      "send_condition_name": "2時間毎",
      "status": "10",
      "status_name": "送信中",
      "latest_operation_code": "1",
      "latest_operation_code_name": "追加",
      "start_date": "2017/12/30",
      "end_date": "2017/12/30",
      "first_receive_datetime": "2017/02/01 23:59:59",
      "last_receive_datetime": "2017/05/23 23:59:59",
      "assumption_data_value_header" : 1000,
      "process_type" : "3"
    },
  });

  result.push({
    customize_definition : {
      "customize_definition_id": 3,
      "customize_definition_name": "KOMTRAXデータ 3" ,
      "customize_definition_version": 3.01,
      "assumption_data_value": 4022000,
      "priority": "1",
      "priority_name": "low",
      "active_kind": "1",
      "active_name": "有効",
      "customize_access_level": 1,
      "customize_access_level_name": "開発者",
      "aggregation_condition_id": 1,
      "aggregation_condition_name": "30分毎",
      "aggregation_opportunity_kind": 1,
      "send_opportunity_kind": 0,
      "send_condition_id": 3,
      "send_condition_name": "3時間毎",
      "status": "10",
      "status_name": "送信中",
      "latest_operation_code": "1",
      "latest_operation_code_name": "追加",
      "start_date": "2017/12/30",
      "end_date": "2017/12/30",
      "first_receive_datetime": "2017/02/01 23:59:59",
      "last_receive_datetime": "2017/05/23 23:59:59",
      "assumption_data_value_header" : 1000,
      "process_type" : "2"
    },
  });

  result.push({
    customize_definition : {
      "customize_definition_id": 4,
      "customize_definition_name": "KOMTRAXデータ 4" ,
      "customize_definition_version": 3.01,
      "assumption_data_value": 5022000,
      "priority": "1",
      "priority_name": "low",
      "active_kind": "1",
      "active_name": "有効",
      "customize_access_level": 1,
      "customize_access_level_name": "開発者",
      "aggregation_condition_id": 1,
      "aggregation_condition_name": "40分毎",
      "aggregation_opportunity_kind": 0,
      "send_opportunity_kind": 0,
      "send_condition_id": 4,
      "send_condition_name": "4時間毎",
      "status": "10",
      "status_name": "送信中",
      "latest_operation_code": "1",
      "latest_operation_code_name": "追加",
      "start_date": "2017/12/30",
      "end_date": "2017/12/30",
      "first_receive_datetime": "2017/02/01 23:59:59",
      "last_receive_datetime": "2017/05/23 23:59:59",
      "assumption_data_value_header" : 1000,
      "process_type" : "4"
    },
  });

  return result;
}

function createFeature() {
  var pointNum = _.random(3, 5);
  var points = [];
  _.times(pointNum, () => {
    points.push([
      _.random(139.000001, 140.299999),
      _.random(35.300001, 36.299999),
    ]);
  });

  return {
    properties: {
      type_name: 'ポリゴン',
      color: '#FFFF00',
    },
    geometry: {
      coordinates: [_.concat(points, [points[0]])],
      type: 'Polygon',
    },
    type: 'Feature',
  };
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
