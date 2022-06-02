var _ = require('lodash');
var validation = require('../../common/validation.js');

module.exports = function(data) {
  var systemErrorData = validation(data.query, 'system_error');
  if (systemErrorData.length > 0) {
      return fail500();
  }
  var from = isNaN(data.header['x-from']) ? 1 : parseInt(data.header['x-from']);
  var count = isNaN(data.header['x-count'])
      ? 0
      : parseInt(data.header['x-count']);
  var sort = data.header['x-sort'] || 'car_customized_definition.customize_definition_id';
  var TOTAL = isNaN(data.header['x-count']) ? 1 : 14;
  var loopEnd =
  TOTAL > from + count - 1 && count !== 0 ? from + count - 1 : TOTAL;

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

  mock.result_data.cars = createData(from, loopEnd);

  return success(mock);
};

function createData(from, count) {
  const result = [];

  const customize_usage_definitions = ['カスタマイズ定義A', 'カスタマイズ定義B'];
  const customize_definition = ['生産詳細データ', '作業分類別集計データ'];

  for (var i = from; i <= count; i++) {

    const customize_usage_definitions_list = [];
    for (var j = 0; j < customize_usage_definitions.length; j++) {
      let item = {};
      item.id = "123456" + j,
      item.name = customize_usage_definitions[j];
      item.version = "1.00";
      item.setting_change_status = "1";
      item.setting_change_status_name = "設定中";

      const customize_definition_list = [];
      for (var k = 0; k < customize_definition.length; k++) {
        let itemCustomize = {};
        itemCustomize.id = k + 1;
        itemCustomize.name = customize_definition[k];
        itemCustomize.version = "1.00";
        itemCustomize.access_level = {
          "id": "1",
          "code": "0",
          "name": "開発者"
        };
        customize_definition_list.push(itemCustomize);
      }
      item.customize_definitions = customize_definition_list;
      customize_usage_definitions_list.push(item);
    }

    let row = {
      "car_identification": {
        "id": i.toString(),
        "model": "D85PX",
        "type_rev": "15E0",
        "serial": "A1234" + i,
        "division_code": "0001"
      },
      "communication_channel": {
        "id": i.toString(),
        "code": "0",
        "name": "ORBCOMM"
      },
      "terminal_mode": {
        "kind": "1",
        "name": "次世代"
      },
      "customer": {
        "id": "12345",
        "label": "顧客A",
        "label_english": "Customer A"
      },
      "support_distributor": {
        "id": "401",
        "label": "コマツ東京C",
        "label_english": "KOMATSU Tokyo C"
      },
      "customize_usage_definitions": customize_usage_definitions_list
    };
    result.push(row);
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
