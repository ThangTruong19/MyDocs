var _ = require('lodash');

module.exports = function() {
  var from = 1;
  var count = 1;
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

  mock.result_data.cars = createData(loopEnd);

  return success(mock);
};

function createData(count) {
  const result = [];

  for (var i = 1; i <= count; i++) {
    result.push({
      "car_identification": {
        "id": i.toString(),
        "model": "D85PX",
        "type_rev": "15E0",
        "serial": "A12345",
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
      "customize_usage_definitions": [
        {
          "id": "123456" + i,
          "name": "カスタマイズ定義A",
          "version": "1.00",
          "setting_change_status": "1",
          "setting_change_status_name": "設定中",
          "customize_definitions": [
            {
              "id": "234567" + i,
              "name": "カスタマイズ定義A",
              "version": "1.00",
              "access_level": {
                "id": "1",
                "code": "0",
                "name": "開発者"
              }
            }
          ]
        }
      ]
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
