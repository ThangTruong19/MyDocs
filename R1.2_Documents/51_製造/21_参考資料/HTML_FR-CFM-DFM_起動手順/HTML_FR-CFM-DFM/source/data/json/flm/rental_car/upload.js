module.exports = function(args) {
  var responses = [];
  for (var i = 0; i < 10; i++) {
    var isError = Math.random() < 0.3;
    var data = {
      request: {
        line_no: '1',
        car: {
          car_identification: {
            maker_name: 'コマツ',
            id: '1',
            model: 'SK714',
            type: '15',
            serial: 'A12345',
          },
          rental: {
            reservation1: {
              connection_id: '1111',
              customer_id: '1',
              customer_identification_code: 'A1234567890B',
              customer_label: 'コマツ建設',
              customer_label_english: 'Komatsu_Construction',
              start_date: '2017/02/01',
              end_date: '2017/03/31',
              viewable_connection_id: '1234',
              viewable_end_date: '2017/04/30',
            },
            reservation2: {
              connection_id: null,
              customer_id: null,
              customer_identification_code: null,
              customer_label: null,
              customer_label_english: null,
              start_date: null,
              end_date: null,
              viewable_connection_id: null,
              viewable_end_date: null,
            },
          },
        },
      },
    };

    if (isError) {
      data.error_data = [
        {
          code: 'ACOM0002E',
          message: 'リクエスト情報が不正です。',
          keys: ['car.rental.reservation1.customer_label'],
        },
      ];
    } else {
      data.result_data = {
        car: {
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
            type: '15',
            rev: 'M0',
            type_rev: 'A12345M0',
            icon_font_no: '1',
            serial: 'A12345',
            pin: '12345',
          },
          customer_attribute: {
            customer_management_no: '123456',
            customer_car_no: '123456',
            user_memo: '自由記入欄です',
            remarks: '特記事項です',
            mainte_in_charge: '保守責任者１',
            operator_label3: 'オペレータ３',
            operator_label2: 'オペレータ２',
            operator_label1: 'オペレータ１',
          },
          rental: {
            reservation1: {
              connection_id: '1111',
              customer_id: '1',
              customer_identification_code: 'A1234567890B',
              customer_label: 'コマツ建設',
              date_from: '2017/02/01',
              date_to: '2017/03/31',
              viewable_connection_id: '1234',
              viewable_end_date: '2017/04/30',
            },
            reservation2: {
              connection_id: '2222',
              customer_id: '2',
              customer_identification_code: 'B1234567890A',
              customer_label: 'コマツ建築',
              date_from: '2017/04/01',
              date_to: '2017/04/30',
              viewable_connection_id: '4321',
              viewable_end_date: '2017/05/31',
            },
          },
        },
      };
    }

    responses.push(data);
  }

  return done({ responses });
  // return fail500();
};

function done(json) {
  return {
    status: 207,
    json,
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
