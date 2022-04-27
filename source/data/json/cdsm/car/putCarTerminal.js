var validation = require('../../common/validation.js');

module.exports = function(args) {
  var errorData = validation(args.body);
  if (errorData.length > 0) {
    return fail(errorData);
  }

  var data = {
    result_data: {
      car: {
        komtrax_unit: {
          reception_status_name: '未完了',
          reception_status: '0',
          sim_attributes_1: {
            communication_kind_id: '1',
            communication_kind_name: 'ORBCOMM',
          },
          modem_component_1: {
            update_datetime: '2017-05-24T00:00:01.000Z',
            logical_name: 'KMTRX',
            kind_name: 'KOMTRAX端末',
            kind_id: '1',
            serial: '012345',
            part: '1234-56-7890',
            part_id: '1',
            id: '1',
          },
          main_component: {
            update_datetime: '2017-05-24T00:00:01.000Z',
            logical_name: 'KMTRX',
            kind_name: 'KOMTRAX端末',
            kind_id: '1',
            serial: '012345',
            part: '1234-56-7890',
            part_id: '1',
            id: '1',
          },
        },
        car_identification: {
          update_datetime: '2017-05-23T23:59:59.999Z',
          initial_smr: '100.5',
          production_date: '2017/05/23',
          model_id: '1',
          division_name: 'スキッドステアローダ',
          division_code: '0001',
          division_id: '1',
          maker_name: 'コマツ',
          maker_code: '0001',
          maker_id: '1',
          id: '1',
          model: 'SK714',
          model_type_id: '1',
          type: 'A12345',
          rev: 'M0',
          type_rev: 'A12345M0',
          icon_font_no: '1',
          serial: 'A12345',
          pin: '12345',
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
