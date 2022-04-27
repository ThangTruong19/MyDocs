module.exports = function(args) {
  var mock = {
    result_data: {
      car: {
        car_identification: {
          id: '1',
          maker_id: '1',
          maker_code: '0001',
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
          initial_smr: '100.5',
          update_datetime: '2017-05-23T23:59:59.999Z',
        },
        user_permission: {
          management_target_code: '0',
          sub_groups: [
            {
              id: '1001',
              label: 'コマツサブグループA',
              label_english: 'KOMATSU Subgroup A',
            },
          ],
        },
        distributor_attribute: {
          debit_kind: '1',
          debit_name: '有',
          free_memo: '自由メモです',
          elapsed_months: '48',
          new_used_kind: '0',
          new_used_name: '新車',
          delivery_date: '2017/05/23',
          eqp_delivery_date: '2017/05/23',
          used_delivery_date: '2017/05/23',
          eqp_used_delivery_date: '2017/05/23',
          used_delivery_smr: '100.5',
          production_year_month: '2017/07',
          asset_status_kind: '1',
          asset_status_name: '工場在庫',
          asset_owner_id: '1',
          asset_owner_name: 'コマツ',
          spec_pattern_id: '1',
          spec_pattern_name: '仕様パターン１',
          stock_status_update_date: '2017/05/23',
          intended_purpose_code: '1',
          intended_purpose_name: '土木・建築',
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
            name: '東京統括',
          },
          class_2: {
            kind_name: '分類２',
            id: '13',
            name: '東京支店',
          },
          class_3: {
            kind_name: '分類３',
            id: '15',
            name: 'なし',
          },
          class_4: {
            kind_name: '分類４',
            id: '17',
            name: 'なし',
          },
          class_5: {
            kind_name: '分類５',
            id: '19',
            name: 'なし',
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
        customer: {
          id: '601',
          label: '顧客_1',
          label_english: 'customer_1',
          organization_code: 'NU0003',
          business_type_id: '1',
          business_type_name: '建設業',
          phone_no: '(03)5412-1111',
          address: '青森県青森市青森町2-10',
        },
        bank: {
          id: '701',
          label: '銀行_1',
          label_english: 'bank_1',
        },
        insurance: {
          id: '801',
          label: '保険_1',
          label_english: 'insurance_1',
        },
        finance: {
          id: '901',
          label: 'ファイナンス_1',
          label_english: 'finance_1',
        },
        car_management_attribute: {
          registration_car_kind: '0',
          registration_car_name: '標準搭載車両',
          smr_interval_item_custom_kind: '1',
          smr_interval_item_custom_name: 'カスタム可能',
          accumulate_fuel_interval_item_custom_kind: '1',
          accumulate_fuel_interval_item_custom_name: 'カスタム可能',
          time_difference: '+0900',
          time_difference_setting_change_status: '1',
          time_difference_setting_change_status_name: '変更中',
          time_difference_setting_change_start_date: '2017/05/23',
          change_after_time_difference: '+0700',
          support_distributor_time_difference: '+0900',
          time_difference_setting_request_key: 'f570d731',
          kicsi_kind: '1',
          kicsi_name: 'KICSi',
          communication_kind_id: '1',
          communication_kind_name: 'Orbcomm',
          terminal_use_start_kind: '1',
          terminal_use_start_name: '開始準備中',
          terminal_start_setting_request_key: 'f570d731',
          car_assign_status: '1',
          car_assign_status_name: '申請中',
          orbcomm_request_target_kind: '1',
          orbcomm_request_target_name: '申請対象',
          orbcomm_request_status: '1',
          orbcomm_request_status_name: '申請済',
          nation_id: '1',
          nation_name: 'アメリカ',
          orbcomm_request_datetime: '2017/05/23 23:59:59',
          operator_identification_kind: '1',
          operator_identification_name: 'ID入力（スキップあり）',
          update_datetime: '2017-05-23T23:59:59.999Z',
        },
      },
    },
  };
  var serial = args.body.car.car_identification && args.body.car.car_identification.serial;

  if (serial === 'warning') {
    mock.result_data.warning_data = [
      {
        code: 'ACAR0427W',
        message:
          '車両の登録情報が送信されましたが、時差設定に失敗しました。時差設定更新要求をおこなってください。',
      },
    ];
  }

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
