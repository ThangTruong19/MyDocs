var validation = require('../../common/validation.js');

module.exports = function(args) {
  var errorData = validation(args.body, [
    'error',
    '99999999',
    999999999999,
    9999999999999,
  ]);
  if (errorData.length > 0) {
    var coordinateRegexp = /{{.*coordinates.*}}/;
    var errorCoordinate;
    errorData = errorData.reduce((result, error) => {
      if (coordinateRegexp.test(error.message)) {
        if (errorCoordinate) {
          errorCoordinate.keys.push(error.keys[0]);
        } else {
          errorCoordinate = {
            ...error,
            message: error.message.replace(
              coordinateRegexp,
              '{{group_area.feature.geometry.coordinates}}'
            ),
          };
        }
      } else {
        result.push(error);
      }
      return result;
    }, []);
    if (errorCoordinate) errorData.push(errorCoordinate);
    return fail(errorData);
  }
  if (validation(args.body, 'system_error').length > 0) {
    return fail500();
  }

  var data = {
    result_data: {
      group_area: {
        edit_feature: {
          properties: {
            north_south_distance: '10',
            east_west_distance: '10',
            type_name: '中心点',
            color: '#FFFFFF',
          },
          geometry: {
            coordinates: [1, 1],
            type: 'Point',
          },
          type: 'Feature',
        },
        feature: {
          properties: {
            type_name: 'ポリゴン',
            color: 'FFFFFF',
          },
          geometry: {
            coordinates: [[[1, 1], [2, 2], [3, 3], [4, 4], [1, 1]]],
            type: 'Polygon',
          },
          type: 'Feature',
        },
        update_datetime: '2017-05-23T23:59:59.999Z',
        notification_name: '対象',
        notification_kind: '0',
        active_status_name: '有効',
        id: '1',
        no: '1',
        label: '〇〇地区',
        group_id: '1',
        group_label: 'groupA',
        group_label_english: 'groupEn',
        description: 'エリア説明',
        active_status_kind: '1',
      },
    },
  };

  return success(data);
};

function success(data) {
  return {
    status: 200,
    json: {
      result_data: data.result_data,
    },
  };
}

function fail(errorData) {
  return {
    status: 400,
    json: {
      error_data: errorData,
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
