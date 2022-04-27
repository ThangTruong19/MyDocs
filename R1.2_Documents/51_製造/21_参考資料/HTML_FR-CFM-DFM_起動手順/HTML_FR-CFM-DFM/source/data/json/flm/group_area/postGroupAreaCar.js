var validation = require('../../common/validation.js');

module.exports = function(args) {
  var errorData = validation(args.body);
  if (errorData.length > 0) {
    return fail(errorData);
  }

  var data = {
    result_data: {
      car: {
        car_area: {
          edit_feature: {
            properties: {
              north_south_distance: '10.23',
              east_west_distance: '10.12',
              type_name: '中心点',
              color: '#0000FF',
            },
            geometry: {
              coordinates: [139.76560511, 35.67978174],
              type: 'Point',
            },
            type: 'Feature',
          },
          feature: {
            properties: {
              type_name: 'ポリゴン',
              color: '#0000FF',
            },
            geometry: {
              coordinates: [
                [
                  [139.8215963, 35.72588514],
                  [139.70961392, 35.72588514],
                  [139.70967858, 35.63367834],
                  [139.82153164, 35.63367834],
                  [139.8215963, 35.72588514],
                ],
              ],
              type: 'Polygon',
            },
            type: 'Feature',
          },
          update_datetime: '2017-05-23T23:59:59.999Z',
          description: 'エリア説明',
          label: '〇〇地区',
          no: '1',
          id: '1',
        },
        car_identification: {
          update_datetime: '2017-05-23T23:59:59.999Z',
          initial_smr: '100.5',
          production_date: '2017/05/23',
          model_id: '1',
          division_name: 'ブルドーザ',
          division_code: '0001',
          division_id: '1',
          maker_name: 'コマツ',
          maker_code: '0001',
          maker_id: '1',
          id: '1',
          model: 'D85PX',
          model_type_id: '1',
          type: '15',
          rev: 'E0',
          type_rev: '15E0',
          icon_font_no: '1',
          serial: 'A12345',
          pin: 'KMT0D101CJAA12345',
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
