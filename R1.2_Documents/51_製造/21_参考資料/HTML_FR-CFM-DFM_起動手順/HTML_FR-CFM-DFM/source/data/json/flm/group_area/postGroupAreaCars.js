var validation = require('../../common/validation.js');
var successEmpty = require('../../common/successEmpty');

module.exports = function(args) {
  var from = parseInt(args.header['x-from']);
  var count = parseInt(args.header['x-count']);
  var sort = args.header['x-sort'] || 'division';
  var TOTAL = 100;
  var loopEnd = TOTAL > from + count - 1 ? from + count - 1 : TOTAL;
  var areaGroupCars = [];
  var mock = {
    result_header: {
      'X-From': from,
      'X-Count': count,
      'X-Sort': sort,
      'X-TotalCount': TOTAL,
      'Cache-Control': 'no-cache',
    },
    result_data: {
      cars: null,
    },
  };
  var data;

  if (validation(args.body, 'system_error').length > 0) {
    return fail500();
  }
  if (validation(args.body, 'empty').length > 0) {
    return successEmpty('cars', mock);
  }

  for (var i = from; i <= loopEnd; i++) {
    data = {
      car_identification: {
        id: i.toString(),
        initial_smr: '100.5',
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
        serial: 'A1234' + i.toString(),
        pin: '12345',
        production_date: '2017/05/23',
        update_datetime: '2017-05-23T23:59:59.999Z',
      },
      support_distributor: {
        id: '1',
        label: 'コマツ東京C',
        label_english: 'KOMATSU Tokyo C',
        organization_code: 'NU0001',
      },
      service_distributor: {
        id: '1',
        label: 'コマツ東京C',
        label_english: 'KOMATSU Tokyo C',
        organization_code: 'NU0001',
      },
      bank: {
        id: '1',
        label: '銀行_1',
        label_english: 'bank_1',
      },
      insurance: {
        id: '1',
        label: '保険_1',
        label_english: 'insurance_1',
      },
      finance: {
        id: '1',
        label: 'ファイナンス_1',
        label_english: 'finance_1',
      },
      customer: {
        id: '1',
        address: '青森県青森市青森町2-10',
        phone_no: '(03)5412-1111',
        label: '顧客_1',
        label_english: 'customer_1',
        organization_code: 'NU0001',
        business_type_id: '1',
        business_type_name: '建設業',
      },
      customer_attribute: {
        customer_management_no: '00000' + i.toString(),
        customer_car_no: '12345' + i.toString(),
        user_memo: '自由記入欄です',
        remarks: '特記事項です',
        mainte_in_charge: '保守責任者１',
        operator_label3: 'オペレータ３',
        operator_label2: 'オペレータ２',
        operator_label1: 'オペレータ１',
      },
      distributor_attribute: {
        debit_kind: '1',
        debit_name: '有',
        free_memo: '自由メモです',
        elapsed_months: 48,
        new_used_kind: '0',
        new_used_name: '新車',
        delivery_date: '2017/05/23',
        eqp_delivery_date: '2017/05/23',
        used_delivery_date: '2017/05/23',
        eqp_used_delivery_date: '2017/05/23',
        used_delivery_smr: '100',
        production_year_month: '2017/07',
        asset_status_kind: '1',
        asset_status_name: '工場在庫',
        asset_owner_id: '1',
        asset_owner_name: 'コマツ',
        spec_pattern_id: '1',
        spec_pattern_name: '仕様パターン１',
        stock_status_update_date: '2017/05/23',
        intended_use_code: '1',
        intended_use_name: '土木・建築',
        data_publish_kind: '1',
        data_publish_name: '納入日以降のみ公開',
        note_1: '備考１です',
        note_2: '備考２です',
        note_3: '備考３です',
        note_4: '備考４です',
        note_5: '備考５です',
        class_1: {
          kind_name: '分類１',
          id: '11',
          label: '東京統括',
        },
        class_2: {
          kind_name: '分類２',
          id: '13',
          label: '東京支店',
        },
        class_3: {
          kind_name: '分類３',
          id: '15',
          label: 'なし',
        },
        class_4: {
          kind_name: '分類４',
          id: '17',
          label: 'なし',
        },
        class_5: {
          kind_name: '分類５',
          id: '19',
          label: 'なし',
        },
        custom_car_attribute_1: {
          name: '情報化施工',
          detail_id: '11',
          detail_name: 'KOMATSU IMC',
        },
        custom_car_attribute_2: {
          name: 'コマツオールサポート',
          detail_id: '13',
          detail_name: 'メンテナンスプラン',
        },
        custom_car_attribute_3: {
          name: 'AAA属性',
          detail_id: '15',
          detail_name: 'なし',
        },
        custom_car_attribute_4: {
          name: 'BBB属性',
          detail_id: '17',
          detail_name: 'なし',
        },
        custom_car_attribute_5: {
          name: 'CCC属性',
          detail_id: '19',
          detail_name: 'なし',
        },
        custom_car_attribute_6: {
          name: 'DDD属性',
          detail_id: '21',
          detail_name: 'なし',
        },
        custom_car_attribute_7: {
          name: 'EEE属性',
          detail_id: '23',
          detail_name: 'なし',
        },
        custom_car_attribute_8: {
          name: 'FFF属性',
          detail_id: '25',
          detail_name: 'なし',
        },
        custom_car_attribute_9: {
          name: 'GGG属性',
          detail_id: '27',
          detail_name: 'なし',
        },
        custom_car_attribute_10: {
          name: 'HHH属性',
          detail_id: '29',
          detail_name: 'なし',
        },
      },
      latest_status: {
        electric_power_saving_configuration_kind: '1',
        electric_power_saving_configuration_name: '省電力',
        smr: 100.5,
        odometer: 100,
        place: '東京都千代田区丸の内1丁目',
        point: {
          type: 'Point',
          coordinates: [35.351325, 139.361711],
        },
        altitude: 333,
        communication_datetime: '2017/05/23 23:59:59',
        event_datetime: '2017/05/23 23:59:59',
        measure_datetime: '2017/05/23 23:59:59',
        place_get_datetime: '2017/05/23 23:59:59',
        altitude_measure_datetime: '2017/05/23 23:59:59',
        latest_operation_date: '2017/05/23',
        no_operation_days: 2,
        operator_identification_status: '0',
        operator_identification_status_name: '無効',
        icon_font_color: 'FFFFFF',
      },
      site_current_entry: {
        id: '1',
        name: '現場名',
        start_datetime: '2017/05/23 23:59:59',
        end_datetime: '2017/05/23 23:59:59',
      },
      areas: createAreas(i),
    };
    areaGroupCars.push(data);
  }

  mock.result_data.cars = areaGroupCars;

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

function createAreas(j) {
  var areas = [];

  if (j === 5) {
    label = '〇〇地区あああああああああああああああああああ';
  } else {
    label = '〇〇地区';
  }

  if (j === 3) return areas;

  for (i = 0; i < 3; i++) {
    areas.push({
      id: i.toString(),
      no: i + 1,
      label: label + i.toString(),
      description: 'エリア説明',
    });
  }

  return areas;
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
