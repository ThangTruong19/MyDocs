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
              '{{car_area.feature.geometry.coordinates}}'
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

  var data = {
    result_data: {
      car: {
        car_identification: {
          id: '1',
          maker_id: '1',
          maker_name: 'コマツ',
          division_id: '1',
          division_code: '0001',
          division_name: 'スキッドステアローダ',
          model_id: '1',
          model: 'SK714',
          model_type_id: '1',
          type: 'A12345',
          rev: 'M0',
          type_rev: 'A12345M0',
          icon_font_no: '1',
          serial: 'A12345',
          pin: '12345',
          production_date: '2017/05/23',
          update_datetime: '2017-05-23T23:59:59.999Z',
        },
        car_area: {
          id: '1',
          no: '1',
          label: '〇〇地区',
          description: 'エリア説明',
          update_datetime: '2017-05-23T23:59:59.999Z',
          feature: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [139.8215963, 35.72588514],
                  [139.70961392, 35.72588514],
                  [139.70967858, 35.63367834],
                  [139.82153164, 35.63367834],
                  [139.8215963, 35.72588514],
                ],
              ],
            },
            properties: {
              color: 'FFFFFF',
              type_name: 'ポリゴン',
            },
          },
          edit_feature: {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [139.76560511, 35.67978174],
            },
            properties: {
              color: '#FFFFFF',
              type_name: '中心点',
              east_west_distance: '10.12',
              north_south_distance: '10.23',
            },
          },
        },
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
