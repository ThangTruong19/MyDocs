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

  mock.result_data.customize_usage_definitions = createData(count);

  return success(mock);
  // return fail500();
};

function createData(count) {
  const result = [];

  for (var i = 1; i <= count; i++) {
    result.push({
        customize_usage_definition : {
            "customize_usage_definition_id": i,
            "customize_usage_definition_name": "KOMTRAX標準 (Item " + i + ")",
            "customize_usage_definition_version": i,
            "start_date": "2017/12/30",
            "end_date": "2017/12/30",
            "priority": "1",
            "priority_name": "low",
            "use_kind": "0",
            "use_name": "利用中",
            "customize_definitions": [
              {
                "customize_definition_id": 1,
                "customize_definition_name": "KOMTRAXデータ v1.0",
                "priority": "1",
                "priority_name": "low",
                "active_kind": "1",
                "active_name": "有効",
                "latest_operation_code": "1",
                "latest_operation_code_name": "追加",
                "status": "10",
                "status_name": "送信中",
                "assumption_data_value": 2022000,
                "start_date": "2017/12/30",
                "end_date": "2017/12/30",
                "first_receive_datetime": "2017/02/01 23:59:59",
                "latest_receive_datetime": "2017/05/23 23:59:59",
                "aggregation_condition_id": 1,
                "aggregation_condition_name": "10分毎",
                "send_condition_id": 1,
                "send_condition_name": "1時間毎",
                "customize_access_level": "1",
                "customize_access_level_name": "開発者"
              },
              {
                "customize_definition_id": 2,
                "customize_definition_name": "KOMTRAXデータ v2.0",
                "priority": "1",
                "priority_name": "low",
                "active_kind": "1",
                "active_name": "有効",
                "latest_operation_code": "1",
                "latest_operation_code_name": "追加",
                "status": "10",
                "status_name": "送信中",
                "assumption_data_value": 2022000,
                "start_date": "2017/12/30",
                "end_date": "2017/12/30",
                "first_receive_datetime": "2017/02/01 23:59:59",
                "latest_receive_datetime": "2017/05/23 23:59:59",
                "aggregation_condition_id": 1,
                "aggregation_condition_name": "10分毎",
                "send_condition_id": 1,
                "send_condition_name": "1時間毎",
                "customize_access_level": "1",
                "customize_access_level_name": "開発者"
              },
              {
                "customize_definition_id": 3,
                "customize_definition_name": "KOMTRAXデータ v3.0",
                "priority": "1",
                "priority_name": "low",
                "active_kind": "1",
                "active_name": "有効",
                "latest_operation_code": "1",
                "latest_operation_code_name": "追加",
                "status": "10",
                "status_name": "送信中",
                "assumption_data_value": 2022000,
                "start_date": "2017/12/30",
                "end_date": "2017/12/30",
                "first_receive_datetime": "2017/02/01 23:59:59",
                "latest_receive_datetime": "2017/05/23 23:59:59",
                "aggregation_condition_id": 1,
                "aggregation_condition_name": "10分毎",
                "send_condition_id": 1,
                "send_condition_name": "1時間毎",
                "customize_access_level": "1",
                "customize_access_level_name": "開発者"
              }
            ]
      },
    });
  }

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
