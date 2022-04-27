var _ = require('lodash');
var moment = require('moment');
var validation = require('../../common/validation');
var pickAvailableResponse = require('../../common/pickAvailableResponse');
var successEmpty = require('../../common/successEmpty');

module.exports = function (args) {
  if (
    args.header.accept ===
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ) {
    return startDownload({
      id: '0',
      name: '〇〇ファイル作成',
      request_datetime: '2000/01/01 00:00:00',
      complete_datetime: '2000/01/01 00:00:00',
      request_api_id: 'KOM-00100010',
      result_api_id: 'KOM-00000011',
      status_code: '0',
      status_name: '受付',
    });
  }

  var xfields = args.header['x-fields'] && args.header['x-fields'].split(',');
  var from = isNaN(args.header['x-from']) ? 1 : parseInt(args.header['x-from']);
  var count = isNaN(args.header['x-count'])
    ? 0
    : parseInt(args.header['x-count']);
  var sort = args.header['x-sort'] || 'cars.car_identification.model';
  var car_id = '';
  var car_ids = [];
  if (_.has(args.body, 'common.car_identification.car_ids')) {
    var TOTAL = args.body.common.car_identification.car_ids.length;
    var loopEnd = TOTAL;
    if (TOTAL === 1) {
      car_id = args.body.common.car_identification.car_ids[0];
    } else {
      car_ids = args.body.common.car_identification.car_ids;
    }
  } else {
    var TOTAL = isNaN(args.header['x-count']) ? 1 : 100;
    var loopEnd =
      TOTAL > from + count - 1 && count !== 0 ? from + count - 1 : TOTAL;
  }
  var mock = {
    result_header: {
      'X-From': from,
      'X-Count': count,
      'X-Sort': sort,
      'X-TotalCount': TOTAL,
      'Cache-Control': 'no-cache',
    },
    result_data: {
      cars: [],
    },
  };
  var result_data = { cars: [] };

  if (validation(args.body, 'system_error').length > 0) {
    return fail500();
  }
  // 検索項目にemptyという値が入力されていれば、該当車両なしでレスポンスが返る
  if (validation(args.body, 'empty').length > 0) {
    return successEmpty('cars', mock);
  }

  if (!_.isEmpty(car_id) && count === 0) {
    result_data.cars.push(createData(car_id, args.body));
  } else if (!_.isEmpty(car_ids) && count === 0) {
    _.each(car_ids, id => {
      result_data.cars.push(createData(id, args.body));
    });
  } else if (validation(args.body, '0001').length > 0) {
    result_data.cars.push(createData(0, args.body));
  } else {
    for (var i = from; i <= loopEnd; i++) {
      result_data.cars.push(createData(i, args.body));
    }
  }

  mock.result_data = pickAvailableResponse(result_data, xfields);
  return success(mock);
};

function createData(i, body = null) {
  var divisions = {
    '0001': {
      division_id: '1',
      division_code: '0001',
      division_name: '油圧ショベル',
      models: ['PD200', 'PD300', 'SPD200', 'SPD300'],
      types: ['21', '22'],
    },
    '0002': {
      division_id: '2',
      division_code: '0002',
      division_name: 'ホイールローダ',
      models: ['PO200', 'PO300', 'SPO200', 'SPO300'],
      types: ['31', '32', '33', '34', '131', '132', '133', '231'],
    },
    '0003': {
      division_id: '3',
      division_code: '0003',
      division_name: 'クレーン',
      models: ['PC200', 'PC300', 'PC400'],
      types: ['41', '42', '43'],
    },
  };
  var rev = 'M0';
  var maker_code = '0002';
  var division = divisions[maker_code];
  var management_target_code;
  if (i % 7 === 0) {
    management_target_code = '2';
  } else if (i % 5 === 0) {
    management_target_code = '1';
  } else {
    management_target_code = '0';
  }
  var newUsedKind = i % 2 === 0 ? '0' : '1';
  var isRental = Math.random() < 0.5;
  var terminalUseStartValues = createKindValues(
    body,
    'car_management.terminal_use_start_kinds',
    [1]
  );
  var terminalUseStart = _.sample(terminalUseStartValues);
  var orbcommRequestStatus = _.sample([0, 1]);
  var timeDifferenceSettingChangeStatus = _.sample([0, 1, 2]);
  var carAssignStatus = _.sample([0]);
  var timeDifferenceSettingKind = _.sample([0]);
  var terminalUseStartName = [
    '未開局',
    '未開始',
    '開始準備中',
    'リトライオーバ',
    '完了',
  ];
  var orbcommRequestStatusName = ['未申請', '申請済'];
  var timeDifferenceSettingChangeStatusName = [
    '未/完了',
    '変更中',
    'リトライオーバ',
  ];
  var carAssignStatusName = ['未申請/完了', '申請中'];
  var timeDifferenceSettingName = ['15分', '30分'];
  var orbcommRequestTargetKind = _.sample(['0', '1']);

  var data = {
    car_identification: {
      id: '' + i,
      maker_id: String((i % 3) + 1),
      maker_code: maker_code,
      maker_name: 'コマツ',
      division_id: division.division_id,
      division_code: division.division_code,
      division_name: division.division_name,
      model_id: '2',
      model: division.models[2],
      model_type_id: '1',
      type: division.types[1],
      rev: rev,
      type_rev: division.types[1] + '21' + rev,
      icon_font_no: '1',
      serial: _.get(body, 'common.car_identification.serials') ? body.common.car_identification.serials[0] : 'TEST',
      pin: '12345',
      production_date: '2017-05-23T23:59:59.999Z',
      update_datetime: '2017-05-23T23:59:59.999Z',
      initial_smr: '10',
    },
    car_management_attribute: {
      update_datetime: '2017-05-23T23:59:59.999Z',
      rental_car_name: isRental ? '対応' : '非対応',
      rental_car_kind: isRental ? '0' : '1',
      operator_identification_name: 'ID入力（スキップあり）',
      operator_identification_kind: '1',
      orbcomm_request_datetime: '2017/05/23 23:59:59',
      nation_name: 'アメリカ',
      nation_id: '1',
      orbcomm_request_status_name:
        orbcommRequestStatusName[orbcommRequestStatus],
      orbcomm_request_status: String(orbcommRequestStatus),
      orbcomm_request_target_name: orbcommRequestTargetKind === '1' ? "申請対象" : "",
      orbcomm_request_target_kind: orbcommRequestTargetKind,
      car_assign_status_name: carAssignStatusName[carAssignStatus],
      car_assign_status: String(carAssignStatus),
      terminal_start_setting_request_key: 'f570d731',
      terminal_use_start_name: terminalUseStartName[terminalUseStart],
      time_difference_setting_change_status: String(
        timeDifferenceSettingChangeStatus
      ),
      time_difference: '+0900',
      accumulate_fuel_interval_item_custom_name: 'カスタム可能',
      accumulate_fuel_interval_item_custom_kind: '1',
      smr_interval_item_custom_name: 'カスタム可能',
      smr_interval_item_custom_kind: '1',
      registration_car_name: '標準搭載車両',
      registration_car_kind: '0',
      time_difference_setting_change_status_name:
        timeDifferenceSettingChangeStatusName[
        timeDifferenceSettingChangeStatus
        ],
      time_difference_setting_change_start_date: '2017/05/23',
      change_after_time_difference:
        timeDifferenceSettingChangeStatus === 0 ? '' : '+0700',
      support_distributor_time_difference: '+0900',
      time_difference_setting_request_key: 'f570d731',
      time_difference_setting_kind: String(timeDifferenceSettingKind),
      time_difference_setting_name:
        timeDifferenceSettingName[timeDifferenceSettingKind],
      terminal_use_start_kind: String(terminalUseStart),
    },
    change_support_distributor: {
      label_english: carAssignStatus === 1 ? 'KOMATSU Tokyo E' : null,
      label: carAssignStatus === 1 ? 'コマツ東京E' : null,
      id: carAssignStatus === 1 ? '403' : null,
    },
    user_permission: {
      sub_groups_label_english: 'Subgroup A\nSubgroup B\nSubgroup C',
      sub_groups_label: 'サブグループA\nサブグループB\nサブグループC',
      management_target_code: management_target_code,
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
    komtrax_unit: {
      receive_status_name: '未完了',
      receive_status: '0',
      sim_attributes_1: {
        communication_kind_id: '1',
        communication_kind_name: 'ORBCOMM',
      },
      modem_component_1: {
        update_datetime: '2017-05-23T23:59:59.999Z',
        logical_name: 'KMTRX',
        kind_name: 'KOMTRAX端末',
        kind_id: '1',
        serial: '012345',
        part: '1234-56-7890',
        part_id: '1',
        id: '1',
      },
      main_component: {
        update_datetime: '2017-05-23T23:59:59.999Z',
        logical_name: 'KMTRX',
        kind_name: 'KOMTRAX端末',
        kind_id: '1',
        serial: '012345',
        part: '1234-56-7890',
        part_id: '1',
        id: '1',
      },
      terminal_component: {
        update_datetime: "2017-05-23T23:59:59.999Z",
        logical_name: "KMTRX",
        kind_name: "KOMTRAX端末",
        kind_id: "1",
        serial: "012345",
        part: "1234-56-7890",
        part_id: "1",
        id: "1"
      },
      main_component: {
        update_datetime: "2017-05-23T23:59:59.999Z",
        logical_name: "KMTRX",
        kind_name: "KOMTRAX端末",
        kind_id: "1",
        serial: "012345",
        part: "1234-56-7890",
        part_id: "1",
        id: "1"
      }
    },
    support_distributor: {
      id: 'N0001',
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
      label: '顧客1',
      label_english: 'customer_1',
      address: '青森県青森市青森町2-10',
      phone_no: '(03)5412-1111',
      organization_code: 'NU0001',
      business_type_id: '1',
      business_type_name: '建設業',
    },
    distributor_attribute: {
      debit_kind: '1',
      debit_name: '不明',
      free_memo: '自由メモです',
      elapsed_months: 48,
      new_used_kind: newUsedKind,
      new_used_name: newUsedKind === '0' ? '新車' : '中古車',
      delivery_date: '05/21/2017',
      eqp_delivery_date: '05/22/2017',
      used_delivery_date: newUsedKind === '0' ? '' : '05/24/2017',
      eqp_used_delivery_date: '05/25/2017',
      stock_status_update_date: '05/26/2017',
      used_delivery_smr: newUsedKind === '0' ? '' : '100',
      production_year_month: '07/2017',
      asset_status_kind: '1',
      asset_status_name: '資産状態1',
      asset_owner_id: '1',
      asset_owner_name: '資産所有者1',
      spec_pattern_id: '1',
      spec_pattern_name: '仕様パターン1',
      note_1: '備考１です' + 10 ** i,
      note_2: '備考２です',
      note_3: '備考３です',
      note_4: '備考４です',
      note_5: '備考５です',
      class_1: {
        kind_name: '分類１１',
        id: '11',
        label: '東京統括',
      },
      class_2: {
        kind_name: '分類２１',
        id: '21',
        label: '東京支店',
      },
      class_3: {
        kind_name: '分類３１',
        id: '31',
        label: 'なし',
      },
      class_4: {
        kind_name: '分類４１',
        id: '41',
        label: 'なし',
      },
      class_5: {
        kind_name: '分類５１',
        id: '51',
        label: 'なし',
      },
      custom_car_attribute_1: {
        name: 'カスタム属性１１',
        detail_id: '11',
        detail_name: 'KOMATSU IMC',
      },
      custom_car_attribute_2: {
        name: 'カスタム属性２１',
        detail_id: '21',
        detail_name: 'メンテナンスプラン',
      },
      custom_car_attribute_3: {
        name: 'カスタム属性３１',
        detail_id: '31',
        detail_name: 'なし',
      },
      custom_car_attribute_4: {
        name: 'カスタム属性４１',
        detail_id: '41',
        detail_name: 'なし',
      },
      custom_car_attribute_5: {
        name: 'カスタム属性５１',
        detail_id: '51',
        detail_name: 'なし',
      },
      custom_car_attribute_6: {
        name: 'カスタム属性６１',
        detail_id: '61',
        detail_name: 'なし',
      },
      custom_car_attribute_7: {
        name: 'カスタム属性７１',
        detail_id: '71',
        detail_name: 'なし',
      },
      custom_car_attribute_8: {
        name: 'カスタム属性８１',
        detail_id: '81',
        detail_name: 'なし',
      },
      custom_car_attribute_9: {
        name: 'カスタム属性９１',
        detail_id: '91',
        detail_name: 'なし',
      },
      custom_car_attribute_10: {
        name: 'カスタム属性１０１',
        detail_id: '101',
        detail_name: 'なし',
      },
      data_publish_kind: '1',
      data_publish_name: '公開',
      intended_use_code: '1',
      intended_use_name: '使用目的1',
    },
    current_site: {
      id: '1',
      label: '現場名',
      start_datetime: '2017/05/23 23:59:59',
      end_datetime: '2017/05/23 23:59:59',
    },
    latest_status: {
      icon_font_color: '#FFFFFF',
      no_operation_days: 2,
      operator_identification_status_name: '無効',
      operator_identification_status: '0',
      latest_operation_date: '2017/05/23',
      altitude_measure_datetime: '2017/05/23 23:59:59',
      place_get_datetime: '2017/05/23 23:59:59',
      measure_datetime: '2017/05/23 23:59:59',
      event_datetime: '2017/05/23 23:59:59',
      electric_power_saving_configuration_kind: '4',
      electric_power_saving_configuration_name: '省電力',
      smr: 100,
      odometer: 100,
      place: '東京都千代田区丸の内1丁目',
      point: {
        coordinates: [35.351325, 139.361711],
        type: 'Point',
      },
      altitude: 333,
      communication_datetime: '2017/05/23 23:59:59',
    },
  };

  return data;
}

function success(data) {
  return {
    status: 200,
    json: {
      result_data: data.result_data,
    },
    header: data.result_header,
  };
}

function startDownload(data) {
  return {
    status: 202,
    json: {
      result_data: data,
    },
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

function createKindValues(body, path, defaultValues) {
  var values = _.get(body, path);

  if (values && values !== ['-99']) {
    return _.map(values, Number);
  } else {
    return defaultValues || [];
  }
}
