var validation = require('../../common/validation.js');

module.exports = function(args) {
  var errorData = validation(args.body);
  if (errorData.length > 0) {
    return fail(errorData);
  }

  return success();
};

function success() {
  return {
    status: 200,
    json: {
      result_data: {
        car: {
          car_identification: {
            id: '1',
            maker_id: '1',
            maker_code: '0001',
            maker_name: 'コマツ',
            division_id: '1',
            division_code: '0001',
            division_name: 'ブルドーザ',
            model_id: '1',
            model: 'D85PX',
            model_type_id: '1',
            type: '15',
            rev: 'E0',
            type_rev: '15E0',
            icon_font_no: '1',
            serial: 'A12345',
            pin: 'KMT0D101CJAA12345',
            production_date: '2017/05/23',
            initial_smr: '100.5',
            update_datetime: '2017-05-23T23:59:59.999Z',
          },
          customer_attribute: {
            operator_label1: 'オペレータ１',
            operator_label2: 'オペレータ２',
            operator_label3: 'オペレータ３',
            mainte_in_charge: '保守責任者１',
            remarks: '特記事項です',
            user_memo: '自由記入欄です',
            customer_car_no: '123456',
            customer_management_no: '123456',
          },
          rental: {
            reservation1: {
              connection_id: '1111',
              customer_id: '1',
              customer_label: 'コマツ建設',
              customer_label_english: 'Komatsu_Construction',
              start_date: '2017/02/01',
              end_date: '2017/03/31',
              viewable_connection_id: '1234',
              viewable_end_date: '2017/04/30',
            },
            reservation2: {
              connection_id: '2222',
              customer_id: '2',
              customer_label: 'コマツ建築',
              customer_label_english: 'Komatsu_Architecture',
              start_date: '2017/04/01',
              end_date: '2017/04/30',
              viewable_connection_id: '4321',
              viewable_end_date: '2017/05/31',
            },
          },
        },
      },
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
