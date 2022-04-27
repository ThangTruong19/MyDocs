module.exports = function(args) {
  var data = [];
  var mock;
  var hasError;

  for (var i = 1; i <= 10; i++) {
    hasError = Math.random() < 0.3;
    hasWarning = Math.random() < 0.5;
    if (hasError) {
      mock = {
        error_data: [
          {
            code: 'COM0002E',
            message: '中古車納入日が不正です。',
            keys: ['cars.distributor_attribute.used_delivery_date'],
          },
          {
            code: 'COM0002E',
            message: '機種が不正です。',
            keys: ['cars.car_identification.model'],
          },
        ],
        request: createRequestData(i),
      };
    } else {
      mock = {
        result_data: createResultData(i),
        request: createRequestData(i),
      };

      mock.result_data.warning_data = hasWarning ? [
        {
          "code": "ACAR0427W",
          "message": "車両の登録情報が送信されましたが、時差設定に失敗しました。時差設定更新要求をおこなってください。",
          "keys": [
            "car_id"
          ]
        }
      ] : [];
    }

    // if (Math.random() < 0.5) {
    // }

    data.push(mock);
  }

  return success(data);
};

function createRequestData(i) {
  return {
    car: {
      car_management_attribute: {
        rental_car_kind: '0',
        time_difference: '+0900',
        registration_car_kind: '0',
      },
      finance_id: '901',
      car_identification: {
        initial_smr: '100.5',
        serial: 'A1234' + i,
        type: 'A1234' + i,
        model: 'SK714' + i,
        maker_name: 'コマツ',
      },
      user_permission_sub_group_ids: ['1001'],
      komtrax_unit: {
        main_component: {
          serial: '012345',
          part: '1234-56-7890',
        },
      },
      distributor_attribute: {
        data_publish_kind: '1',
        class_1_id: '11',
        note_5: '備考５です',
        note_4: '備考４です',
        note_3: '備考３です',
        note_2: '備考２です',
        note_1: '備考１です',
        spec_pattern_id: '1',
        asset_owner_id: '1',
        debit_kind: '1',
        free_memo: '自由メモです',
        new_used_kind: '0',
        delivery_date: '2017-05-23',
        used_delivery_date: '2017-05-23',
        used_delivery_smr: '100.5',
        production_year_month: '2017-07',
        asset_status_kind: '1',
        class_2_id: '13',
        class_3_id: '15',
        class_4_id: '17',
        class_5_id: '19',
        custom_car_attribute_1_detail_id: '11',
        custom_car_attribute_2_detail_id: '13',
        custom_car_attribute_3_detail_id: '15',
        custom_car_attribute_4_detail_id: '17',
        custom_car_attribute_5_detail_id: '19',
        custom_car_attribute_6_detail_id: '21',
        custom_car_attribute_7_detail_id: '23',
        custom_car_attribute_8_detail_id: '25',
        custom_car_attribute_9_detail_id: '27',
        custom_car_attribute_10_detail_id: '29',
        stock_status_update_date: '2017-05-23',
        intended_use_code: '1',
      },
      support_distributor_id: '401',
      customer: {
        label: '顧客_1',
        id: '601',
      },
      bank_id: '701',
      insurance_id: '801',
    },
    line_no: String(i + 1),
  };
}

function createResultData(i) {
  return {
    car: {
      customer: {
        address: '青森県青森市青森町2-10',
        phone_no: '(03)5412-1111',
        business_type_name: '建設業',
        business_type_id: '1',
        organization_code: 'NU0003',
        label_english: 'customer_1',
        label: '顧客_1',
        id: '601',
      },
      bank: {
        label_english: 'bank_1',
        label: '銀行_1',
        id: '701',
      },
      user_permission: {
        sub_groups_label_english:
          'KOMATSU Subgroup A\\nKOMATSU Subgroup B\\nKOMATSU Subgroup C',
        sub_groups_label:
          'コマツサブグループA\\nコマツサブグループB\\nコマツサブグループC',
        sub_groups: [
          {
            label_english: 'KOMATSU Subgroup A',
            label: 'コマツサブグループA',
            id: '1001',
          },
          {
            label_english: 'KOMATSU Subgroup B',
            label: 'コマツサブグループB',
            id: '1002',
          },
          {
            label_english: 'KOMATSU Subgroup C',
            label: 'コマツサブグループC',
            id: '1003',
          },
        ],
        management_target_code: '0',
      },
      distributor_attribute: {
        custom_car_attribute_10: {
          detail_label: 'なし',
          detail_id: '29',
          label: 'HHH属性',
        },
        custom_car_attribute_9: {
          detail_label: 'なし',
          detail_id: '27',
          label: 'GGG属性',
        },
        custom_car_attribute_8: {
          detail_label: 'なし',
          detail_id: '25',
          label: 'FFF属性',
        },
        custom_car_attribute_7: {
          detail_label: 'なし',
          detail_id: '23',
          label: 'EEE属性',
        },
        custom_car_attribute_6: {
          detail_label: 'なし',
          detail_id: '21',
          label: 'DDD属性',
        },
        custom_car_attribute_5: {
          detail_label: 'なし',
          detail_id: '19',
          label: 'CCC属性',
        },
        custom_car_attribute_4: {
          detail_label: 'なし',
          detail_id: '17',
          label: 'BBB属性',
        },
        custom_car_attribute_3: {
          detail_label: 'なし',
          detail_id: '15',
          label: 'AAA属性',
        },
        custom_car_attribute_2: {
          detail_label: 'メンテナンスプラン',
          detail_id: '13',
          label: 'コマツオールサポート',
        },
        custom_car_attribute_1: {
          detail_label: 'KOMATSU IMC',
          detail_id: '11',
          label: '情報化施工',
        },
        class_5: {
          label: 'なし',
          id: '19',
          kind_label: '分類５',
        },
        asset_owner_name: 'コマツ',
        asset_owner_id: '1',
        asset_status_name: '工場在庫',
        asset_status_kind: '1',
        production_year_month: '2017-07',
        used_delivery_smr: '100.5',
        eqp_used_delivery_date: '2017-05-24',
        used_delivery_date: '2017-05-24',
        debit_kind: '1',
        debit_name: '有',
        free_memo: '自由メモです',
        elapsed_months: '48',
        new_used_kind: '0',
        new_used_name: '新車',
        delivery_date: '2017-05-24',
        eqp_delivery_date: '2017-05-24',
        spec_pattern_id: '1',
        spec_pattern_label: '仕様パターン１',
        stock_status_update_date: '2017-05-24',
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
          label: '東京統括',
          id: '11',
          kind_label: '分類１',
        },
        class_2: {
          label: '東京支店',
          id: '13',
          kind_label: '分類２',
        },
        class_3: {
          label: 'なし',
          id: '15',
          kind_label: '分類３',
        },
        class_4: {
          label: 'なし',
          id: '17',
          kind_label: '分類４',
        },
      },
      komtrax_unit: {
        reception_status_name: '未完了',
        reception_status: '0',
        sim_attributes_1: {
          communication_kind_id: '1',
          communication_kind_name: 'ORBCOMM',
        },
        modem_component_1: {
          update_datetime: '2017-05-23T23:59:59.999Z',
          logical_name: 'KMTRX',
          component_kind_name: 'KOMTRAX端末',
          component_kind_id: '1',
          serial: '012345',
          part: '1234-56-7890',
          part_id: '1',
          id: '1',
        },
        main_component: {
          update_datetime: '2017-05-23T23:59:59.999Z',
          logical_name: 'KMTRX',
          component_kind_name: 'KOMTRAX端末',
          component_kind_id: '1',
          serial: '012345',
          part: '1234-56-7890',
          part_id: '1',
          id: '1',
        },
      },
      car_management_attribute: {
        update_datetime: '2017-05-24T23:59:59.999Z',
        rental_car_name: '対応',
        rental_car_kind: '0',
        operator_identification_name: 'ID入力（スキップあり）',
        operator_identification_kind: '1',
        orbcomm_request_datetime: '2017/05/23 23:59:59',
        nation_name: 'アメリカ',
        nation_id: '1',
        orbcomm_request_status_name: '申請済',
        orbcomm_request_status: '1',
        orbcomm_request_target_name: '申請対象',
        orbcomm_request_target_kind: '1',
        car_assign_status_name: '申請中',
        car_assign_status: '1',
        terminal_start_setting_request_key: 'f570d731',
        terminal_use_start_name: '開始準備中',
        time_difference_setting_change_status: '1',
        time_difference: '+0900',
        accumulate_fuel_interval_item_custom_name: 'カスタム可能',
        accumulate_fuel_interval_item_custom_kind: '1',
        smr_interval_item_custom_name: 'カスタム可能',
        smr_interval_item_custom_kind: '1',
        registration_car_name: '標準搭載車両',
        registration_car_kind: '0',
        time_difference_setting_change_status_name: '変更中',
        time_difference_setting_change_start_date: '2017/05/24',
        change_after_time_difference: '+0700',
        support_distributor_time_difference: '+0900',
        time_difference_setting_request_key: 'f570d731',
        time_difference_setting_kind: '1',
        time_difference_setting_name: '30分',
        terminal_use_start_kind: '1',
      },
      support_distributor: {
        organization_code: 'NU0001',
        label_english: 'KOMATSU Tokyo C',
        label: 'コマツ東京C',
        id: '401',
      },
      car_identification: {
        update_datetime: '2017-05-24T23:59:59.999Z',
        initial_smr: '100.5',
        production_date: '2017-05-23',
        model_id: '1',
        division_name: 'スキッドステアローダ',
        division_code: '0001',
        division_id: '1',
        maker_name: 'コマツ',
        maker_code: '0001',
        maker_id: '1',
        id: '1',
        model: 'SK714' + i,
        model_type_id: '1',
        type: 'A1234' + i,
        rev: 'M0',
        type_rev: 'A12345M0',
        icon_font_no: '1',
        serial: 'A1234' + i,
        pin: '12345',
      },
      insurance: {
        label_english: 'insurance_1',
        label: '保険_1',
        id: '801',
      },
      finance: {
        label_english: 'finance_1',
        label: 'ファイナンス_1',
        id: '901',
      },
    },
  };
}

function success(data) {
  return {
    status: 207,
    // json: {
    //   responses: data,
    // },
    json: '{"responses":[{"result_data":{"car":{"user_permission":{"management_target_code":"0","sub_groups_label":null,"sub_groups_label_english":null,"sub_groups":[]},"distributor_attribute":{"debit_kind":"0","debit_name":"無","free_memo":null,"elapsed_months":1,"new_used_kind":"0","new_used_name":"新車","delivery_date":"2021/01/13","eqp_delivery_date":null,"used_delivery_date":null,"eqp_used_delivery_date":null,"used_delivery_smr":"0.0","production_year_month":null,"asset_status_kind":"9","asset_status_name":"なし","asset_owner_id":"0","asset_owner_name":"なし","spec_pattern_id":"10012","spec_pattern_name":"なし","stock_status_update_date":"2021/01/13","intended_use_code":"99","intended_use_name":"未選択","data_publish_kind":"1","data_publish_name":"納入日以降のみ公開","note_1":null,"note_2":null,"note_3":null,"note_4":null,"note_5":null,"class_1":{"kind_name":null,"id":null,"label":null},"class_2":{"kind_name":null,"id":null,"label":null},"class_3":{"kind_name":null,"id":null,"label":null},"class_4":{"kind_name":null,"id":null,"label":null},"class_5":{"kind_name":null,"id":null,"label":null},"custom_car_attribute_1":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_2":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_3":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_4":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_5":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_6":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_7":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_8":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_9":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_10":{"name":null,"detail_id":null,"detail_name":null}},"komtrax_unit":{"receive_status":"0","receive_status_name":"未完了","sim_attributes_1":{"communication_kind_id":"1","communication_kind_name":"ORBCOMM"},"main_component":{"id":"13","part_id":"84","part":"7826-12-2500","serial":"011014","kind_id":"1","kind":"0001","update_datetime":"2021-01-20T02:04:15.773Z","kind_name":"KOMTRAX端末"},"modem_component_1":{"id":null,"part_id":null,"part":null,"serial":null,"kind_id":null,"kind":null,"update_datetime":null,"kind_name":null},"terminal_component":{"part":"7826-12-2500","serial":"011014"},"monitor_component":{"part":null,"serial":null},"controller_component":{"part":null,"serial":null}},"car_management_attribute":{"smr_interval_item_custom_kind":"0","smr_interval_item_custom_name":"カスタム不可","accumulate_fuel_interval_item_custom_kind":"0","accumulate_fuel_interval_item_custom_name":"カスタム不可","time_difference":"+0800","time_difference_setting_change_status":"0","time_difference_setting_change_status_name":"未/完了","time_difference_setting_change_start_date":"2021/02/24","change_after_time_difference":null,"support_distributor_time_difference":"+0900","time_difference_setting_kind":"1","time_difference_setting_name":"30分","terminal_use_start_kind":"0","terminal_use_start_name":"未開局","car_assign_status":"0","car_assign_status_name":"未申請/完了","orbcomm_request_target_kind":"0","orbcomm_request_target_name":"申請対象外","orbcomm_request_status":"1","orbcomm_request_status_name":"申請済","nation_id":"199","nation_name":"日本","orbcomm_request_datetime":null,"operator_identification_kind":"99","operator_identification_name":"設定不可","rental_car_kind":"1","rental_car_name":"未対応","update_datetime":"2021-03-01T10:15:45.362Z"},"car_identification":{"id":"522059","maker_id":"1","maker_code":"0001","maker_name":"コマツ","division_id":"4","division_code":"0002","division_name":"ブルドーザ","model_id":"311","model":"D61EXI","model_type_id":"353","type":"24","rev":null,"type_rev":"24","icon_font_no":"68","serial":"40796","pin":"KMT0D129HJA040796","production_date":null,"initial_smr":"100.0","update_datetime":"2021-03-01T10:15:45.362Z"},"insurance":{"id":null,"label":null,"label_english":null},"finance":{"id":null,"label":null,"label_english":null},"bank":{"id":null,"label":null,"label_english":null},"customer":{"id":null,"label":null,"label_english":null,"organization_code":null,"business_type_id":null,"business_type_name":null,"phone_no":null,"address":null}},"warning_data":[]},"request":{"line_no":"1","car":{"insurance_id":null,"finance_id":null,"support_distributor_id":"10000004343","distributor_attribute":{"stock_status_update_date":"2021-01-13","custom_car_attribute_2_detail_id":null,"custom_car_attribute_3_detail_id":null,"custom_car_attribute_4_detail_id":null,"custom_car_attribute_5_detail_id":null,"custom_car_attribute_6_detail_id":null,"note_1":null,"production_year_month":null,"custom_car_attribute_10_detail_id":null,"note_2":null,"custom_car_attribute_7_detail_id":null,"custom_car_attribute_8_detail_id":null,"note_3":null,"custom_car_attribute_9_detail_id":null,"debit_kind":"0","note_4":null,"note_5":null,"class_5_id":null,"free_memo":null,"class_4_id":null,"class_3_id":null,"spec_pattern_id":"10012","class_2_id":null,"used_delivery_smr":null,"class_1_id":null,"asset_status_kind":"9","asset_owner_id":"0","used_delivery_date":null,"new_used_kind":"0","delivery_date":"2021-01-13","intended_use_code":"99","data_publish_kind":"1","custom_car_attribute_1_detail_id":null},"komtrax_unit":{"terminal_component":{"serial":null,"part":null}},"car_management_attribute":{"rental_car_kind":"1","time_difference":"+0800"},"car_identification":{"initial_smr":"0","serial":"40796","type_rev":"24","model":"D61EXI","maker_name":"コマツ"},"user_permission_sub_group_ids":[null,null,null,null,null,null,null,null,null,null],"bank_id":null,"customer":{"label":null,"id":null}}}},{"result_data":{"car":{"user_permission":{"management_target_code":"0","sub_groups_label":null,"sub_groups_label_english":null,"sub_groups":[]},"distributor_attribute":{"debit_kind":"0","debit_name":"無","free_memo":null,"elapsed_months":1,"new_used_kind":"0","new_used_name":"新車","delivery_date":"2021/01/21","eqp_delivery_date":null,"used_delivery_date":null,"eqp_used_delivery_date":null,"used_delivery_smr":"0.0","production_year_month":null,"asset_status_kind":"9","asset_status_name":"なし","asset_owner_id":"0","asset_owner_name":"なし","spec_pattern_id":"10012","spec_pattern_name":"なし","stock_status_update_date":"2021/01/21","intended_use_code":"99","intended_use_name":"未選択","data_publish_kind":"1","data_publish_name":"納入日以降のみ公開","note_1":null,"note_2":null,"note_3":null,"note_4":null,"note_5":null,"class_1":{"kind_name":null,"id":null,"label":null},"class_2":{"kind_name":null,"id":null,"label":null},"class_3":{"kind_name":null,"id":null,"label":null},"class_4":{"kind_name":null,"id":null,"label":null},"class_5":{"kind_name":null,"id":null,"label":null},"custom_car_attribute_1":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_2":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_3":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_4":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_5":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_6":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_7":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_8":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_9":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_10":{"name":null,"detail_id":null,"detail_name":null}},"komtrax_unit":{"receive_status":"1","receive_status_name":"完了","sim_attributes_1":{"communication_kind_id":"5","communication_kind_name":"GPRSMS"},"main_component":{"id":"376795","part_id":"319","part":"7826-25-6006","serial":"041751","kind_id":"1","kind":"0001","update_datetime":"2020-09-30T15:06:49.453Z","kind_name":"KOMTRAX端末"},"modem_component_1":{"id":null,"part_id":null,"part":null,"serial":null,"kind_id":null,"kind":null,"update_datetime":null,"kind_name":null},"terminal_component":{"part":"7826-25-6006","serial":"041751"},"monitor_component":{"part":null,"serial":null},"controller_component":{"part":null,"serial":null}},"car_management_attribute":{"smr_interval_item_custom_kind":"0","smr_interval_item_custom_name":"カスタム不可","accumulate_fuel_interval_item_custom_kind":"0","accumulate_fuel_interval_item_custom_name":"カスタム不可","time_difference":"+0900","time_difference_setting_change_status":"1","time_difference_setting_change_status_name":"変更中","time_difference_setting_change_start_date":"2021/03/01","change_after_time_difference":"+0400","support_distributor_time_difference":"+0900","time_difference_setting_kind":"1","time_difference_setting_name":"30分","terminal_use_start_kind":"4","terminal_use_start_name":"完了","car_assign_status":"0","car_assign_status_name":"未申請/完了","orbcomm_request_target_kind":"0","orbcomm_request_target_name":"申請対象外","orbcomm_request_status":null,"orbcomm_request_status_name":null,"nation_id":"199","nation_name":"日本","orbcomm_request_datetime":null,"operator_identification_kind":"99","operator_identification_name":"設定不可","rental_car_kind":"1","rental_car_name":"未対応","update_datetime":"2021-03-01T10:15:45.355Z"},"car_identification":{"id":"491391","maker_id":"1","maker_code":"0001","maker_name":"コマツ","division_id":"3","division_code":"0001","division_name":"油圧ショベル","model_id":"113","model":"PC200","model_type_id":"1004","type":"11","rev":null,"type_rev":"11","icon_font_no":"65","serial":"500655","pin":"KMTPC257CHC500655","production_date":null,"initial_smr":"0.0","update_datetime":"2021-03-01T10:15:45.355Z"},"insurance":{"id":null,"label":null,"label_english":null},"finance":{"id":null,"label":null,"label_english":null},"bank":{"id":null,"label":null,"label_english":null},"customer":{"id":null,"label":null,"label_english":null,"organization_code":null,"business_type_id":null,"business_type_name":null,"phone_no":null,"address":null}},"warning_data":[{"code":"ACAR0428W","message":"車両情報の変更が完了しましたが、時差設定更新に失敗しました。時差設定更新要求をおこなってください。"}]},"request":{"line_no":"2","car":{"insurance_id":null,"finance_id":null,"support_distributor_id":"10000004343","distributor_attribute":{"stock_status_update_date":"2021-01-21","custom_car_attribute_2_detail_id":null,"custom_car_attribute_3_detail_id":null,"custom_car_attribute_4_detail_id":null,"custom_car_attribute_5_detail_id":null,"custom_car_attribute_6_detail_id":null,"note_1":null,"production_year_month":null,"custom_car_attribute_10_detail_id":null,"note_2":null,"custom_car_attribute_7_detail_id":null,"custom_car_attribute_8_detail_id":null,"note_3":null,"custom_car_attribute_9_detail_id":null,"debit_kind":"0","note_4":null,"note_5":null,"class_5_id":null,"free_memo":null,"class_4_id":null,"class_3_id":null,"spec_pattern_id":"10012","class_2_id":null,"used_delivery_smr":null,"class_1_id":null,"asset_status_kind":"9","asset_owner_id":"0","used_delivery_date":null,"new_used_kind":"0","delivery_date":"2021-01-21","intended_use_code":"99","data_publish_kind":"1","custom_car_attribute_1_detail_id":null},"komtrax_unit":{"terminal_component":{"serial":null,"part":null}},"car_management_attribute":{"rental_car_kind":"1","time_difference":"+0900"},"car_identification":{"initial_smr":"0","serial":"500655","type_rev":"11","model":"PC200","maker_name":"コマツ"},"user_permission_sub_group_ids":[null,null,null,null,null,null,null,null,null,null],"bank_id":null,"customer":{"label":null,"id":null}}}},{"result_data":{"car":{"user_permission":{"management_target_code":"0","sub_groups_label":null,"sub_groups_label_english":null,"sub_groups":[]},"distributor_attribute":{"debit_kind":"0","debit_name":"無","free_memo":null,"elapsed_months":1,"new_used_kind":"0","new_used_name":"新車","delivery_date":"2021/01/21","eqp_delivery_date":null,"used_delivery_date":null,"eqp_used_delivery_date":null,"used_delivery_smr":"0.0","production_year_month":"2019/10","asset_status_kind":"9","asset_status_name":"なし","asset_owner_id":"0","asset_owner_name":"なし","spec_pattern_id":"10012","spec_pattern_name":"なし","stock_status_update_date":"2021/01/21","intended_use_code":"99","intended_use_name":"未選択","data_publish_kind":"1","data_publish_name":"納入日以降のみ公開","note_1":null,"note_2":null,"note_3":null,"note_4":null,"note_5":null,"class_1":{"kind_name":null,"id":null,"label":null},"class_2":{"kind_name":null,"id":null,"label":null},"class_3":{"kind_name":null,"id":null,"label":null},"class_4":{"kind_name":null,"id":null,"label":null},"class_5":{"kind_name":null,"id":null,"label":null},"custom_car_attribute_1":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_2":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_3":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_4":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_5":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_6":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_7":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_8":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_9":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_10":{"name":null,"detail_id":null,"detail_name":null}},"komtrax_unit":{"receive_status":"1","receive_status_name":"完了","sim_attributes_1":{"communication_kind_id":"7","communication_kind_name":"4G"},"main_component":{"id":"524622","part_id":"465","part":"7826-60-3002","serial":"007209","kind_id":"4","kind":"0004","update_datetime":"2020-09-30T15:06:49.453Z","kind_name":"GWコントローラ"},"modem_component_1":{"id":"791671","part_id":"72","part":"7826-26-1003","serial":"006500","kind_id":"7","kind":"0104","update_datetime":"2020-09-30T15:06:49.453Z","kind_name":"通信端末(GW)"},"terminal_component":{"part":"7826-26-1003","serial":"006500"},"monitor_component":{"part":null,"serial":null},"controller_component":{"part":"7826-60-3002","serial":"007209"}},"car_management_attribute":{"smr_interval_item_custom_kind":"0","smr_interval_item_custom_name":"カスタム不可","accumulate_fuel_interval_item_custom_kind":"0","accumulate_fuel_interval_item_custom_name":"カスタム不可","time_difference":"+0900","time_difference_setting_change_status":"1","time_difference_setting_change_status_name":"変更中","time_difference_setting_change_start_date":"2021/03/01","change_after_time_difference":"+0400","support_distributor_time_difference":"+0900","time_difference_setting_kind":"1","time_difference_setting_name":"30分","terminal_use_start_kind":"4","terminal_use_start_name":"完了","car_assign_status":"0","car_assign_status_name":"未申請/完了","orbcomm_request_target_kind":"0","orbcomm_request_target_name":"申請対象外","orbcomm_request_status":null,"orbcomm_request_status_name":null,"nation_id":"199","nation_name":"日本","orbcomm_request_datetime":null,"operator_identification_kind":"99","operator_identification_name":"設定不可","rental_car_kind":"1","rental_car_name":"未対応","update_datetime":"2021-03-01T10:15:45.338Z"},"car_identification":{"id":"597118","maker_id":"1","maker_code":"0001","maker_name":"コマツ","division_id":"3","division_code":"0001","division_name":"油圧ショベル","model_id":"113","model":"PC200","model_type_id":"1004","type":"11","rev":null,"type_rev":"11","icon_font_no":"65","serial":"503369","pin":"KMTPC257PKC503369","production_date":"2019/10/01","initial_smr":"0.0","update_datetime":"2021-03-01T10:15:45.338Z"},"insurance":{"id":null,"label":null,"label_english":null},"finance":{"id":null,"label":null,"label_english":null},"bank":{"id":null,"label":null,"label_english":null},"customer":{"id":null,"label":null,"label_english":null,"organization_code":null,"business_type_id":null,"business_type_name":null,"phone_no":null,"address":null}},"warning_data":[]},"request":{"line_no":"3","car":{"insurance_id":null,"finance_id":null,"support_distributor_id":"10000004343","distributor_attribute":{"stock_status_update_date":"2021-01-21","custom_car_attribute_2_detail_id":null,"custom_car_attribute_3_detail_id":null,"custom_car_attribute_4_detail_id":null,"custom_car_attribute_5_detail_id":null,"custom_car_attribute_6_detail_id":null,"note_1":null,"production_year_month":"2019-10","custom_car_attribute_10_detail_id":null,"note_2":null,"custom_car_attribute_7_detail_id":null,"custom_car_attribute_8_detail_id":null,"note_3":null,"custom_car_attribute_9_detail_id":null,"debit_kind":"0","note_4":null,"note_5":null,"class_5_id":null,"free_memo":null,"class_4_id":null,"class_3_id":null,"spec_pattern_id":"10012","class_2_id":null,"used_delivery_smr":null,"class_1_id":null,"asset_status_kind":"9","asset_owner_id":"0","used_delivery_date":null,"new_used_kind":"0","delivery_date":"2021-01-21","intended_use_code":"99","data_publish_kind":"1","custom_car_attribute_1_detail_id":null},"komtrax_unit":{"terminal_component":{"serial":null,"part":null}},"car_management_attribute":{"rental_car_kind":"1","time_difference":"+0900"},"car_identification":{"initial_smr":"0","serial":"503369","type_rev":"11","model":"PC200","maker_name":"コマツ"},"user_permission_sub_group_ids":[null,null,null,null,null,null,null,null,null,null],"bank_id":null,"customer":{"label":null,"id":null}}}},{"error_data":[{"code":"ACOM0344E","message":"該当の車両に搭載されているモデムに通信に関わる情報が設定されていません。","keys":[""]}],"request":{"line_no":"4","car":{"insurance_id":null,"finance_id":null,"support_distributor_id":"10000004343","distributor_attribute":{"stock_status_update_date":"2021-02-12","custom_car_attribute_2_detail_id":null,"custom_car_attribute_3_detail_id":null,"custom_car_attribute_4_detail_id":null,"custom_car_attribute_5_detail_id":null,"custom_car_attribute_6_detail_id":null,"note_1":null,"production_year_month":null,"custom_car_attribute_10_detail_id":null,"note_2":null,"custom_car_attribute_7_detail_id":null,"custom_car_attribute_8_detail_id":null,"note_3":null,"custom_car_attribute_9_detail_id":null,"debit_kind":"0","note_4":null,"note_5":null,"class_5_id":null,"free_memo":null,"class_4_id":null,"class_3_id":null,"spec_pattern_id":"10012","class_2_id":null,"used_delivery_smr":null,"class_1_id":null,"asset_status_kind":"7","asset_owner_id":"3","used_delivery_date":null,"new_used_kind":"0","delivery_date":"2021-02-12","intended_use_code":"99","data_publish_kind":"1","custom_car_attribute_1_detail_id":null},"komtrax_unit":{"terminal_component":{"serial":null,"part":null}},"car_management_attribute":{"rental_car_kind":"1","time_difference":"+1000"},"car_identification":{"initial_smr":"0","serial":"311177","type_rev":"8","model":"PC200","maker_name":"コマツ"},"user_permission_sub_group_ids":[null,null,null,null,null,null,null,null,null,null],"bank_id":null,"customer":{"label":"KOMTRAX教育顧客_A01","id":"10000004355"}}}},{"result_data":{"car":{"user_permission":{"management_target_code":"0","sub_groups_label":null,"sub_groups_label_english":null,"sub_groups":[]},"distributor_attribute":{"debit_kind":"0","debit_name":"無","free_memo":null,"elapsed_months":0,"new_used_kind":"1","new_used_name":"中古車","delivery_date":"2021/02/08","eqp_delivery_date":null,"used_delivery_date":"2021/02/07","eqp_used_delivery_date":null,"used_delivery_smr":"0.0","production_year_month":null,"asset_status_kind":"9","asset_status_name":"なし","asset_owner_id":"0","asset_owner_name":"なし","spec_pattern_id":"10012","spec_pattern_name":"なし","stock_status_update_date":"2021/02/08","intended_use_code":"1","intended_use_name":"土木・建築","data_publish_kind":"0","data_publish_name":"過去データすべて公開","note_1":null,"note_2":null,"note_3":null,"note_4":null,"note_5":null,"class_1":{"kind_name":null,"id":null,"label":null},"class_2":{"kind_name":null,"id":null,"label":null},"class_3":{"kind_name":null,"id":null,"label":null},"class_4":{"kind_name":null,"id":null,"label":null},"class_5":{"kind_name":null,"id":null,"label":null},"custom_car_attribute_1":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_2":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_3":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_4":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_5":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_6":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_7":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_8":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_9":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_10":{"name":null,"detail_id":null,"detail_name":null}},"komtrax_unit":{"receive_status":"1","receive_status_name":"完了","sim_attributes_1":{"communication_kind_id":"5","communication_kind_name":"GPRSMS"},"main_component":{"id":"471550","part_id":"345","part":"7826-25-7005","serial":"022732","kind_id":"1","kind":"0001","update_datetime":"2020-09-30T15:06:49.453Z","kind_name":"KOMTRAX端末"},"modem_component_1":{"id":null,"part_id":null,"part":null,"serial":null,"kind_id":null,"kind":null,"update_datetime":null,"kind_name":null},"terminal_component":{"part":"7826-25-7005","serial":"022732"},"monitor_component":{"part":null,"serial":null},"controller_component":{"part":null,"serial":null}},"car_management_attribute":{"smr_interval_item_custom_kind":"0","smr_interval_item_custom_name":"カスタム不可","accumulate_fuel_interval_item_custom_kind":"0","accumulate_fuel_interval_item_custom_name":"カスタム不可","time_difference":"-0600","time_difference_setting_change_status":"1","time_difference_setting_change_status_name":"変更中","time_difference_setting_change_start_date":"2021/03/01","change_after_time_difference":"+0900","support_distributor_time_difference":"+0900","time_difference_setting_kind":"1","time_difference_setting_name":"30分","terminal_use_start_kind":"4","terminal_use_start_name":"完了","car_assign_status":"0","car_assign_status_name":"未申請/完了","orbcomm_request_target_kind":"0","orbcomm_request_target_name":"申請対象外","orbcomm_request_status":null,"orbcomm_request_status_name":null,"nation_id":"199","nation_name":"日本","orbcomm_request_datetime":null,"operator_identification_kind":"1","operator_identification_name":"ID入力(スキップあり)","rental_car_kind":"1","rental_car_name":"未対応","update_datetime":"2021-03-01T10:15:45.364Z"},"car_identification":{"id":"503308","maker_id":"1","maker_code":"0001","maker_name":"コマツ","division_id":"3","division_code":"0001","division_name":"油圧ショベル","model_id":"142","model":"PC238USLC","model_type_id":"1148","type":"11","rev":null,"type_rev":"11","icon_font_no":"65","serial":"5368","pin":"KMTPC276KJC005368","production_date":null,"initial_smr":"0.0","update_datetime":"2021-03-01T10:15:45.364Z"},"insurance":{"id":null,"label":null,"label_english":null},"finance":{"id":null,"label":null,"label_english":null},"bank":{"id":null,"label":null,"label_english":null},"customer":{"id":"10000004355","label":"KOMTRAX教育顧客_A01","label_english":null,"organization_code":null,"business_type_id":"10000000612","business_type_name":"建設業","phone_no":null,"address":null}},"warning_data":[{"code":"ACAR0428W","message":"車両情報の変更が完了しましたが、時差設定更新に失敗しました。時差設定更新要求をおこなってください。"}]},"request":{"line_no":"5","car":{"insurance_id":null,"finance_id":null,"support_distributor_id":"10000004343","distributor_attribute":{"stock_status_update_date":"2021-02-08","custom_car_attribute_2_detail_id":null,"custom_car_attribute_3_detail_id":null,"custom_car_attribute_4_detail_id":null,"custom_car_attribute_5_detail_id":null,"custom_car_attribute_6_detail_id":null,"note_1":null,"production_year_month":null,"custom_car_attribute_10_detail_id":null,"note_2":null,"custom_car_attribute_7_detail_id":null,"custom_car_attribute_8_detail_id":null,"note_3":null,"custom_car_attribute_9_detail_id":null,"debit_kind":"0","note_4":null,"note_5":null,"class_5_id":null,"free_memo":null,"class_4_id":null,"class_3_id":null,"spec_pattern_id":"10012","class_2_id":null,"used_delivery_smr":null,"class_1_id":null,"asset_status_kind":"9","asset_owner_id":"0","used_delivery_date":"2021-02-07","new_used_kind":"1","delivery_date":"2021-02-08","intended_use_code":"1","data_publish_kind":"0","custom_car_attribute_1_detail_id":null},"komtrax_unit":{"terminal_component":{"serial":null,"part":null}},"car_management_attribute":{"rental_car_kind":"1","time_difference":"-0600"},"car_identification":{"initial_smr":"0","serial":"5368","type_rev":"11","model":"PC238USLC","maker_name":"コマツ"},"user_permission_sub_group_ids":[null,null,null,null,null,null,null,null,null,null],"bank_id":null,"customer":{"label":"KOMTRAX教育顧客_A01","id":"10000004355"}}}},{"result_data":{"car":{"user_permission":{"management_target_code":"0","sub_groups_label":null,"sub_groups_label_english":null,"sub_groups":[]},"distributor_attribute":{"debit_kind":"0","debit_name":"無","free_memo":null,"elapsed_months":0,"new_used_kind":"0","new_used_name":"新車","delivery_date":"2021/02/15","eqp_delivery_date":"2019/08/27","used_delivery_date":null,"eqp_used_delivery_date":null,"used_delivery_smr":"0.0","production_year_month":null,"asset_status_kind":"9","asset_status_name":"なし","asset_owner_id":"0","asset_owner_name":"なし","spec_pattern_id":"10012","spec_pattern_name":"なし","stock_status_update_date":"2021/02/15","intended_use_code":"99","intended_use_name":"未選択","data_publish_kind":"1","data_publish_name":"納入日以降のみ公開","note_1":null,"note_2":null,"note_3":null,"note_4":null,"note_5":null,"class_1":{"kind_name":null,"id":null,"label":null},"class_2":{"kind_name":null,"id":null,"label":null},"class_3":{"kind_name":null,"id":null,"label":null},"class_4":{"kind_name":null,"id":null,"label":null},"class_5":{"kind_name":null,"id":null,"label":null},"custom_car_attribute_1":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_2":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_3":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_4":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_5":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_6":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_7":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_8":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_9":{"name":null,"detail_id":null,"detail_name":null},"custom_car_attribute_10":{"name":null,"detail_id":null,"detail_name":null}},"komtrax_unit":{"receive_status":"0","receive_status_name":"未完了","sim_attributes_1":{"communication_kind_id":"1","communication_kind_name":"ORBCOMM"},"main_component":{"id":"517226","part_id":"450","part":"7826-54-1104","serial":"001556","kind_id":"3","kind":"0003","update_datetime":"2021-02-15T00:58:00.874Z","kind_name":"K-Plus2コントローラ"},"modem_component_1":{"id":"886563","part_id":"43","part":"7826-25-4303","serial":"044098","kind_id":"6","kind":"0103","update_datetime":"2021-02-15T01:58:10.233Z","kind_name":"通信端末(K-Plus2)"},"terminal_component":{"part":"7826-25-4303","serial":"044098"},"monitor_component":{"part":null,"serial":null},"controller_component":{"part":"7826-54-1104","serial":"001556"}},"car_management_attribute":{"smr_interval_item_custom_kind":"0","smr_interval_item_custom_name":"カスタム不可","accumulate_fuel_interval_item_custom_kind":"0","accumulate_fuel_interval_item_custom_name":"カスタム不可","time_difference":"+0900","time_difference_setting_change_status":"0","time_difference_setting_change_status_name":"未/完了","time_difference_setting_change_start_date":"2021/02/24","change_after_time_difference":null,"support_distributor_time_difference":"+0900","time_difference_setting_kind":"1","time_difference_setting_name":"30分","terminal_use_start_kind":"3","terminal_use_start_name":"リトライオーバ","car_assign_status":"0","car_assign_status_name":"未申請/完了","orbcomm_request_target_kind":"0","orbcomm_request_target_name":"申請対象外","orbcomm_request_status":"1","orbcomm_request_status_name":"申請済","nation_id":"199","nation_name":"日本","orbcomm_request_datetime":null,"operator_identification_kind":"0","operator_identification_name":"OFF","rental_car_kind":"1","rental_car_name":"未対応","update_datetime":"2021-03-01T10:15:45.368Z"},"car_identification":{"id":"505433","maker_id":"1","maker_code":"0001","maker_name":"コマツ","division_id":"5","division_code":"0003","division_name":"ホイールローダ","model_id":"467","model":"WA600","model_type_id":"1912","type":"8","rev":null,"type_rev":"8","icon_font_no":"69","serial":"80169","pin":"KMTWA132CJD080169","production_date":null,"initial_smr":"0.0","update_datetime":"2021-03-01T10:15:45.368Z"},"insurance":{"id":null,"label":null,"label_english":null},"finance":{"id":null,"label":null,"label_english":null},"bank":{"id":null,"label":null,"label_english":null},"customer":{"id":null,"label":null,"label_english":null,"organization_code":null,"business_type_id":null,"business_type_name":null,"phone_no":null,"address":null}},"warning_data":[]},"request":{"line_no":"6","car":{"insurance_id":null,"finance_id":null,"support_distributor_id":"10000004343","distributor_attribute":{"stock_status_update_date":"2021-02-15","custom_car_attribute_2_detail_id":null,"custom_car_attribute_3_detail_id":null,"custom_car_attribute_4_detail_id":null,"custom_car_attribute_5_detail_id":null,"custom_car_attribute_6_detail_id":null,"note_1":null,"production_year_month":null,"custom_car_attribute_10_detail_id":null,"note_2":null,"custom_car_attribute_7_detail_id":null,"custom_car_attribute_8_detail_id":null,"note_3":null,"custom_car_attribute_9_detail_id":null,"debit_kind":"0","note_4":null,"note_5":null,"class_5_id":null,"free_memo":null,"class_4_id":null,"class_3_id":null,"spec_pattern_id":"10012","class_2_id":null,"used_delivery_smr":null,"class_1_id":null,"asset_status_kind":"9","asset_owner_id":"0","used_delivery_date":null,"new_used_kind":"0","delivery_date":"2021-02-15","intended_use_code":"99","data_publish_kind":"1","custom_car_attribute_1_detail_id":null},"komtrax_unit":{"terminal_component":{"serial":null,"part":null}},"car_management_attribute":{"rental_car_kind":"1","time_difference":"+0900"},"car_identification":{"initial_smr":"0","serial":"80169","type_rev":"8","model":"WA600","maker_name":"コマツ"},"user_permission_sub_group_ids":[null,null,null,null,null,null,null,null,null,null],"bank_id":null,"customer":{"label":null,"id":null}}}}]}'
  };
}

function fail(msg) {
  return {
    status: 400,
    json: {
      error_data: [
        {
          code: 'ERR0001',
          message: msg,
          key: '???',
        },
      ],
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
