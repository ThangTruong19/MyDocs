var _ = require('lodash');

module.exports = function() {
  var from = 1;
  var count = 3;
  var sort = 'bond_areas.group_id';
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

  mock.result_data.bond_areas = createData(count);

  return success(mock);
  // return fail500();
};

function createData(count) {
  const result = [];

  for (var i = 1; i <= count; i++) {
    result.push({
      id: '' + i,
      no: '' + i,
      label: 'エリア' + i,
      description: '車両管理',
      group_id: '1',
      group_label: 'ブロック0001',
      group_label_english: 'Block0001',
      feature: createFeature(),
      update_datetime: '2017-05-23T23:59:59.999Z',
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
