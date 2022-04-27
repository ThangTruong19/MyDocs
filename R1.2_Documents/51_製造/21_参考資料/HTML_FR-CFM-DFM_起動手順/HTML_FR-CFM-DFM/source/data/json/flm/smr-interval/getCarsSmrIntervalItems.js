var _ = require('lodash');
var pickAvailableResponse = require('../../common/pickAvailableResponse');

module.exports = function(args) {
  const xFields = args.header['x-fields'];
  var from = args.header['x-from'] ? parseInt(args.header['x-from']) : 1;
  var count = args.header['x-count'] ? parseInt(args.header['x-count']) : 0;
  var sort = args.header['x-sort'] || '';
  var TOTAL =
    _.get(args.body, 'common.car_identification.car_ids') == null ? 100 : 0;
  var loopEnd = TOTAL > from + count - 1 ? from + count - 1 : TOTAL;

  var data = {
    cars: [],
  };

  for (var i = from; i <= Math.max(loopEnd, 10); i++) {
    var car = {
      car_identification: {
        id: String(i),
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
      komtrax_unit: {
        main_component: {
          id: '1',
          part_id: '1',
          part: '1234-56-7890',
          serial: '012345',
          kind_id: '1',
          kind_name: 'KOMTRAX端末',
          logical_name: 'KMTRX',
          update_datetime: '2017-05-24T00:00:01.000Z',
        },
        modem_component_1: {
          id: '1',
          part_id: '1',
          part: '1234-56-7890',
          serial: '012345',
          kind_id: '1',
          kind_name: 'KOMTRAX端末',
          logical_name: 'KMTRX',
          update_datetime: '2017-05-24T00:00:01.000Z',
        },
        sim_attributes_1: {
          communication_kind_id: '1',
          communication_kind_name: 'ORBCOMM',
        },
        receive_status: '0',
        receive_status_name: '未完了',
      },
      support_distributor: {
        id: '401',
        label: 'コマツ東京C',
        label_english: 'KOMATSU Tokyo C',
        organization_code: 'NU0001',
      },
      service_distributor: {
        id: '402',
        label: 'コマツ東京D',
        label_english: 'KOMATSU Tokyo D',
        organization_code: 'NU0002',
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
      user_permission: {
        management_target_code: '0',
        sub_groups: [
          {
            id: '1001',
            label: 'コマツサブグループA',
            label_english: 'KOMATSU Subgroup A',
          },
          {
            id: '1002',
            label: 'コマツサブグループB',
            label_english: 'KOMATSU Subgroup B',
          },
          {
            id: '1003',
            label: 'コマツサブグループC',
            label_english: 'KOMATSU Subgroup C',
          },
        ],
        sub_groups_label:
          'コマツサブグループA\nコマツサブグループB\nコマツサブグループC',
        sub_groups_label_english:
          'KOMATSU Subgroup A\nKOMATSU Subgroup B\nKOMATSU Subgroup C',
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
        used_delivery_smr: '100.5',
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
      smr_interval_items: [
        {
          support_distributor_id: '17',
          support_distributor_label: 'コマツ東京C',
          support_distributor_label_english: 'KOMATSU Tokyo C',
          id: '11',
          label: '1000時間点検',
          inspection_start_smr: '500',
          last_inspection_smr: 1000,
          smr_interval: '1000',
          smr_interval_kind: '1',
          threshold: '-50',
          threshold_kind: '1',
          management_kind: '1',
          management_name: '管理する',
          management_item_name:
            '1000時間点検(開始：500H 間隔：1000H 閾値：-50H)',
          update_datetime: '2017-05-23T23:59:59.999Z',
        },
        {
          support_distributor_id: '17',
          support_distributor_label: 'コマツ東京C',
          support_distributor_label_english: 'KOMATSU Tokyo C',
          id: '11',
          label: '1000時間点検',
          inspection_start_smr: '500',
          last_inspection_smr: 1000,
          smr_interval: '1000',
          smr_interval_kind: '1',
          threshold: '-50',
          threshold_kind: '1',
          management_kind: '1',
          management_name: '管理する',
          management_item_name:
            '1000時間点検(開始：500H 間隔：1000H 閾値：-50H)',
          update_datetime: '2017-05-23T23:59:59.999Z',
        },
        {
          support_distributor_id: '17',
          support_distributor_label: 'コマツ東京C',
          support_distributor_label_english: 'KOMATSU Tokyo C',
          id: '11',
          label: '1000時間点検',
          inspection_start_smr: '500',
          last_inspection_smr: 1000,
          smr_interval: '1000',
          smr_interval_kind: '1',
          threshold: '-50',
          threshold_kind: '1',
          management_kind: '1',
          management_name: '管理する',
          management_item_name:
            '1000時間点検(開始：500H 間隔：1000H 閾値：-50H)',
          update_datetime: '2017-05-23T23:59:59.999Z',
        },
        {
          support_distributor_id: '17',
          support_distributor_label: 'コマツ東京C',
          support_distributor_label_english: 'KOMATSU Tokyo C',
          id: '11',
          label: '1000時間点検',
          inspection_start_smr: '500',
          last_inspection_smr: 1000,
          smr_interval: '1000',
          smr_interval_kind: '1',
          threshold: '-50',
          threshold_kind: '1',
          management_kind: '1',
          management_name: '管理する',
          management_item_name:
            '1000時間点検(開始：500H 間隔：1000H 閾値：-50H)',
          update_datetime: '2017-05-23T23:59:59.999Z',
        },
      ],
      interval_management: {
        service_target_kind: String(i % 2),
      },
    };

    data.cars.push(car);
  }

  // 変更画面で、car_idが偶数番の場合はサービス管理対象外とする
  if (
    data.cars[0] &&
    _.get(args.body, 'common.car_identification.car_ids') != null
  ) {
    data.cars[0].interval_management.service_target_kind = `${args.body.common
      .car_identification.car_ids % 2}`;
  }

  //成功時のレスポンス
  return success({
    result_header: {
      'X-From': from,
      'X-Count': count,
      'X-Sort': sort,
      'X-TotalCount': TOTAL,
      'Cache-Control': 'no-cache',
    },
    result_data: xFields ? pickAvailableResponse(data, xFields) : data,
  });

  // エラー時のレスポンスの場合は以下のコメントアウトを外す。
  // return fail();
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

function fail() {
  return {
    status: 400,
    json: {
      error_data: [
        {
          code: 'COM0002E',
          message: 'リクエスト情報が不正です。',
          keys: ['car_id'],
        },
      ],
    },
  };
}
