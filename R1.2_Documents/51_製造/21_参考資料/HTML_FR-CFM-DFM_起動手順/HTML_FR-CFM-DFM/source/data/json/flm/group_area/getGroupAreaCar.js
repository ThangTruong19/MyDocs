var validation = require('../../common/validation.js');
var pickAvailableResponse = require('../../common/pickAvailableResponse');

module.exports = function (args) {
  var xfields = args.header['x-fields']
    ? args.header['x-fields'].split(',')
    : null;
  var result_data = { car: null };
  var errorData = validation(args.query);
  if (errorData.length > 0) {
    return fail(errorData);
  }

  var mock = {
    result_data: {},
  };

  var result_data = {
    car: {
      car_identification: {
        id: '1',
        maker_id: '1',
        maker_name: 'コマツ',
        maker_code: '0001',
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
        initial_smr: '100.5',
        production_date: '2017/05/23',
        update_datetime: '2017-05-23T23:59:59.999Z',
      },
      car_areas: [
        {
          id: '1',
          no: 1,
          label: '〇〇地区0',
          description: 'エリア説明',
          update_datetime: '2017-05-23T23:59:59.999Z',
          feature: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [139.750149, 35.684891],
                  [139.758303, 35.684891],
                  [139.758432, 35.678215],
                  [139.750214, 35.678163],
                  [139.750149, 35.684891],
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
              coordinates: [139.754462, 35.681353],
            },
            properties: {
              color: '#FFFFFF',
              type_name: '中心点',
              east_west_distance: '1',
              north_south_distance: '1',
            },
          },
        },
        {
          id: '2',
          no: 2,
          label: '〇〇地区1',
          description: 'エリア説明',
          update_datetime: '2017-05-23T23:59:59.999Z',
          feature: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [139.765605, 35.679781],
                  [139.768677, 35.679781],
                  [139.768677, 35.68246],
                  [139.765605, 35.679781],
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
              type: 'Polygon',
              coordinates: [
                [
                  [139.765605, 35.679781],
                  [139.768677, 35.679781],
                  [139.768677, 35.68246],
                  [139.765605, 35.679781],
                ],
              ],
            },
            properties: {
              color: '#FFFFFF',
              type_name: '多角形',
            },
          },
        },
      ],
    },
  };

  mock.result_data = pickAvailableResponse(result_data, xfields);

  return success(mock);
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
