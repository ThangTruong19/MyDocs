var _ = require('lodash');

module.exports = function(data) {
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

  var customizeDefinitionId = data.query.customize_usage_definition_id;
  var customize_definition_version = data.query.customize_usage_definition_version;

  mock.result_data.customize_definitions = createData(customizeDefinitionId, customize_definition_version);

  return success(mock);
  // return fail500();
};

function createData(definitionId, definitionVersion) {
  const initResult = [];
  let result = [];

  initResult.push({
    customize_definition : {
      "customize_definition_id": 1,
      "customize_definition_name": "KOMTRAXデータ1",
      "customize_definition_version": 1,
      "assumption_data_value": 2022000,
      "assumption_data_value_header": 1234567890,
      "customize_access_level": 1,
      "customize_access_level_name": "開発者",
      "aggregation_condition_id": 1,
      "aggregation_condition_name": "10分毎",
      "aggregation_opportunity_kind": "1",
      "aggregation_opportunity_kind_name": "定期集計",
      "send_condition_id": 1,
      "send_condition_name": "1時間毎",
      "send_opportunity_kind": "1",
      "send_opportunity_kind_name": "定期送信",
      "process_type": "4",
      "process_type_name": "スナップショット"
    },
  });

  initResult.push({
    customize_definition : {
      "customize_definition_id": 2,
      "customize_definition_name": "KOMTRAXデータ2",
      "customize_definition_version": 1,
      "assumption_data_value": 3022000,
      "assumption_data_value_header": 1234567890,
      "customize_access_level": 1,
      "customize_access_level_name": "開発者",
      "aggregation_condition_id": 1,
      "aggregation_condition_name": "20分毎",
      "aggregation_opportunity_kind": "1",
      "aggregation_opportunity_kind_name": "定期集計",
      "send_condition_id": 1,
      "send_condition_name": "2時間毎",
      "send_opportunity_kind": "1",
      "send_opportunity_kind_name": "定期送信",
      "process_type": "4",
      "process_type_name": "スナップショット"
    },
  });

  initResult.push({
    customize_definition : {
      "customize_definition_id": 3,
      "customize_definition_name": "KOMTRAXデータ3",
      "customize_definition_version": 1,
      "assumption_data_value": 4022000,
      "assumption_data_value_header": 1234567890,
      "customize_access_level": 1,
      "customize_access_level_name": "開発者",
      "aggregation_condition_id": 1,
      "aggregation_condition_name": "30分毎",
      "aggregation_opportunity_kind": "1",
      "aggregation_opportunity_kind_name": "定期集計",
      "send_condition_id": 1,
      "send_condition_name": "3時間毎",
      "send_opportunity_kind": "1",
      "send_opportunity_kind_name": "定期送信",
      "process_type": "4",
      "process_type_name": "スナップショット"
    },
  });

  initResult.push({
    customize_definition : {
      "customize_definition_id": 4,
      "customize_definition_name": "KOMTRAXデータ4",
      "customize_definition_version": 1,
      "assumption_data_value": 2022000,
      "assumption_data_value_header": 1234567890,
      "customize_access_level": 1,
      "customize_access_level_name": "開発者",
      "aggregation_condition_id": 1,
      "aggregation_condition_name": "10分毎",
      "aggregation_opportunity_kind": "1",
      "aggregation_opportunity_kind_name": "定期集計",
      "send_condition_id": 1,
      "send_condition_name": "1時間毎",
      "send_opportunity_kind": "1",
      "send_opportunity_kind_name": "定期送信",
      "process_type": "4",
      "process_type_name": "スナップショット"
    },
  });

  initResult.push({
    customize_definition : {
      "customize_definition_id": 5,
      "customize_definition_name": "KOMTRAXデータ5",
      "customize_definition_version": 1,
      "assumption_data_value": 3022000,
      "assumption_data_value_header": 1234567890,
      "customize_access_level": 1,
      "customize_access_level_name": "開発者",
      "aggregation_condition_id": 1,
      "aggregation_condition_name": "20分毎",
      "aggregation_opportunity_kind": "1",
      "aggregation_opportunity_kind_name": "定期集計",
      "send_condition_id": 1,
      "send_condition_name": "2時間毎",
      "send_opportunity_kind": "1",
      "send_opportunity_kind_name": "定期送信",
      "process_type": "4",
      "process_type_name": "スナップショット"
    },
  });

  initResult.push({
    customize_definition : {
      "customize_definition_id": 6,
      "customize_definition_name": "KOMTRAXデータ6",
      "customize_definition_version": 1,
      "assumption_data_value": 3022000,
      "assumption_data_value_header": 1234567890,
      "customize_access_level": 1,
      "customize_access_level_name": "開発者",
      "aggregation_condition_id": 1,
      "aggregation_condition_name": "20分毎",
      "aggregation_opportunity_kind": "1",
      "aggregation_opportunity_kind_name": "定期集計",
      "send_condition_id": 1,
      "send_condition_name": "2時間毎",
      "send_opportunity_kind": "1",
      "send_opportunity_kind_name": "定期送信",
      "process_type": "4",
      "process_type_name": "スナップショット"
    },
  });

  initResult.push({
    customize_definition : {
      "customize_definition_id": 7,
      "customize_definition_name": "KOMTRAXデータ7",
      "customize_definition_version": 1,
      "assumption_data_value": 4022000,
      "assumption_data_value_header": 1234567890,
      "customize_access_level": 1,
      "customize_access_level_name": "開発者",
      "aggregation_condition_id": 1,
      "aggregation_condition_name": "50分毎",
      "aggregation_opportunity_kind": "1",
      "aggregation_opportunity_kind_name": "定期集計",
      "send_condition_id": 1,
      "send_condition_name": "5時間毎",
      "send_opportunity_kind": "1",
      "send_opportunity_kind_name": "定期送信",
      "process_type": "4",
      "process_type_name": "スナップショット"
    },
  });

  // Return dummy data based on the value of [カスタマイズ用途定義名], [バージョン]
  switch(definitionId){
    case "101":
      switch(definitionVersion){
        case "1":
          result.push(initResult[0]);
          result.push(initResult[1]);
          result.push(initResult[2]);
          break;
        case "2":
          result.push(initResult[3]);
          result.push(initResult[4]);
          result.push(initResult[5]);
          break;
        case "3":
          result.push(initResult[6]);
          result.push(initResult[0]);
          result.push(initResult[1]);
          break;
        case "4":
          result.push(initResult[2]);
          result.push(initResult[4]);
          result.push(initResult[6]);
          break;
        case "5":
          result.push(initResult[1]);
          result.push(initResult[3]);
          result.push(initResult[5]);
          break;
      }
      break;
    case "102":
      switch(definitionVersion){
        case "1":
          result.push(initResult[0]);
          result.push(initResult[3]);
          result.push(initResult[5]);
          break;
        case "2":
          result.push(initResult[1]);
          result.push(initResult[2]);
          result.push(initResult[4]);
          break;
        case "3":
          result.push(initResult[6]);
          result.push(initResult[2]);
          result.push(initResult[3]);
          break;
        case "4":
          result.push(initResult[1]);
          result.push(initResult[5]);
          result.push(initResult[4]);
          break;
        case "5":
          result.push(initResult[0]);
          result.push(initResult[6]);
          result.push(initResult[3]);
          break;
      }
      break;
    case "103":
      switch(definitionVersion){
        case "1":
          result.push(initResult[1]);
          result.push(initResult[6]);
          result.push(initResult[4]);
          break;
        case "2":
          result.push(initResult[0]);
          result.push(initResult[3]);
          result.push(initResult[2]);
          break;
        case "3":
          result.push(initResult[2]);
          result.push(initResult[4]);
          result.push(initResult[6]);
          break;
        case "4":
          result.push(initResult[3]);
          result.push(initResult[5]);
          result.push(initResult[1]);
          break;
        case "5":
          result.push(initResult[4]);
          result.push(initResult[5]);
          result.push(initResult[2]);
          break;
      }
      break;
    default:
      result.push(initResult[0]);
      result.push(initResult[1]);
      result.push(initResult[2]);
      break;
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
