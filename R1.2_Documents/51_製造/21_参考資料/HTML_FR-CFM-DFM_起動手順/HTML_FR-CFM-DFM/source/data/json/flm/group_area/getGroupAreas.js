var _ = require('lodash');
var moment = require('moment');
var pickAvailableResponse = require('../../common/pickAvailableResponse');

module.exports = function (args) {
  var groupAreas = [];

  var xfields = args.header['x-fields']
    ? args.header['x-fields'].split(',')
    : null;
  var result_data = { group_areas: [] };

  if (_.has(args, 'query.area_id')) {
    result_data.group_areas.push(createData(1));
    return success({
      result_header: createHeader(1, 1, 'group_areas.no', 1),
      result_data: pickAvailableResponse(result_data, xfields),
    });
  }

  var from = parseInt(args.header['x-from'] || '1');
  var count = parseInt(args.header['x-count'] || '10');
  var sort = args.header['x-sort'] || 'group_areas.no';
  var TOTAL = 10;
  var loopEnd =
    TOTAL > from + count - 1 && count !== 0 ? from + count - 1 : TOTAL;
  var mock = {
    result_header: createHeader(from, count, sort, TOTAL),
    result_data: {},
  };

  for (var i = 2; i <= loopEnd; i++) {
    result_data.group_areas.push(createData(i));
  }

  mock.result_data = pickAvailableResponse(result_data, xfields);

  return success(mock);
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

function createHeader(from, count, sort, total) {
  return {
    'X-From': from,
    'X-Count': count,
    'X-Sort': sort,
    'X-TotalCount': total,
    'Cache-Control': 'no-cache',
  };
}

function createData(index) {
  return {
    id: index.toString(),
    no: index.toString(),
    label: '〇〇地区' + index,
    group_id: '1',
    group_label: 'groupA',
    group_label_english: 'groupEn',
    description: 'エリア説明エリア説明\nエリア説明エリア説明' + index,
    notification_name: '対象',
    notification_kind: Math.random() < 0.5 ? '0' : '1',
    active_status_name: '有効',
    active_status_kind: Math.random() < 0.5 ? '0' : '1',
    update_datetime: moment()
      .subtract(index * 2, 'days')
      .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
    edit_feature: createEditFeature(),
    feature: createFeature(),
  };
}

function createEditFeature() {
  if (Math.random() < 0.5) {
    return createPointEditFeature();
  } else {
    return createPolygonEditFeature();
  }
}

function createPointEditFeature() {
  return {
    properties: {
      north_south_distance: '44.32',
      east_west_distance: '58.94',
      type_name: '中心点',
      color: '#FFFFFF',
    },
    geometry: {
      coordinates: [139.000001, 35.300001],
      type: 'Point',
    },
    type: 'Feature',
  };
}

function createPolygonEditFeature() {
  return {
    properties: {
      type_name: '多角形',
      color: '#FFFFFF',
    },
    geometry: {
      coordinates: [
        [
          [139.3003, 35.8971],
          [139.4321, 35.9213],
          [139.38219, 35.7711],
          [139.3003, 35.8971],
        ],
      ],
      type: 'Polygon',
    },
    type: 'Feature',
  };
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
      color: 'FFFFFF',
    },
    geometry: {
      coordinates: [_.concat(points, [points[0]])],
      type: 'Polygon',
    },
    type: 'Feature',
  };
}
