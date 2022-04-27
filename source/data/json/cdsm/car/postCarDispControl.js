var validation = require('../../common/validation.js');
var _ = require('lodash');
var moment = require('moment');

module.exports = function (args) {
  var errorData = validation(args.body);
  if (errorData.length > 0) {
    // return fail(errorData);
    return fail([ { keys: [ 'car.support_distributor_id' ],
    message: '{{car.support_distributor_id}}はリクエスト情報が不正です。',
    code: 'ACOM0002E' } ])
  }

  var registration_car_kind = _.has(
    args.body,
    'car.car_management_attribute.registration_car_kind'
  )
    ? args.body.car.car_management_attribute.registration_car_kind
    : '';
  var mock = {
    result_data: {},
  };

  if (registration_car_kind.length === 0) {
    mock['result_data'] = {
      confirmation_message: {
        code: 'ACAR0021I',
        message:
          '指定車両はKOMTRAX Plus車両として登録済みです。\n KOMTRAX車両として登録しますか？',
      },
    };
    return success(mock);
  }

  // 確認メッセージなし動作確認用 ※ if (registration_car_kind.length === 0 ) をコメントアウトも行う必要あり
  // registration_car_kind = '0';

  var possible_input_items = [
    // 主要情報入力されるリソースは返却しない
    // { resource_path: 'maker_code' },                                               // メーカ
    // { resource_path: 'car.car_identification.model' },                             // 機種
    // { resource_path: 'car.car_identification.type' },                              // 型式
    // { resource_path: 'car.car_identification.serial' },                            // 機番
    { resource_path: 'car.komtrax_unit.terminal_component.part' }, // 端末品番
    { resource_path: 'car.komtrax_unit.terminal_component.serial' }, // 端末シリアル
    { resource_path: 'car.car_identification.initial_smr' }, // 初期SMR(H)
    // { resource_path: 'car.support_distributor_id' },                               // 担当DB
    { resource_path: 'car.car_management_attribute.time_difference' }, // 時差(H)
    { resource_path: 'car.car_management_attribute.time_difference_minute' }, // 時差(M)
    { resource_path: 'car.car_management_attribute.rental_car_kind' }, // レンタル機
    { resource_path: 'car.distributor_attribute.asset_status_kind' }, // 資産状態
    { resource_path: 'car.distributor_attribute.asset_owner_id' }, // 資産所有者
    { resource_path: 'car.distributor_attribute.stock_status_update_date' }, // 在庫状況更新日
    {
      resource_path:
        'car.distributor_attribute.custom_car_attribute_1_detail_id',
    }, // カスタム属性１
    {
      resource_path:
        'car.distributor_attribute.custom_car_attribute_2_detail_id',
    }, // カスタム属性２
    {
      resource_path:
        'car.distributor_attribute.custom_car_attribute_3_detail_id',
    }, // カスタム属性３
    {
      resource_path:
        'car.distributor_attribute.custom_car_attribute_4_detail_id',
    }, // カスタム属性４
    {
      resource_path:
        'car.distributor_attribute.custom_car_attribute_5_detail_id',
    }, // カスタム属性５
    {
      resource_path:
        'car.distributor_attribute.custom_car_attribute_6_detail_id',
    }, // カスタム属性６
    {
      resource_path:
        'car.distributor_attribute.custom_car_attribute_7_detail_id',
    }, // カスタム属性７
    {
      resource_path:
        'car.distributor_attribute.custom_car_attribute_8_detail_id',
    }, // カスタム属性８
    {
      resource_path:
        'car.distributor_attribute.custom_car_attribute_9_detail_id',
    }, // カスタム属性９
    {
      resource_path:
        'car.distributor_attribute.custom_car_attribute_10_detail_id',
    }, // カスタム属性１０
    { resource_path: 'car.distributor_attribute.free_memo' }, // メモ
    { resource_path: 'car.distributor_attribute.note_1' }, // 備考１
    { resource_path: 'car.distributor_attribute.note_2' }, // 備考２
    { resource_path: 'car.distributor_attribute.note_3' }, // 備考３
    { resource_path: 'car.distributor_attribute.note_4' }, // 備考４
    { resource_path: 'car.distributor_attribute.note_5' }, // 備考５
    { resource_path: 'car.distributor_attribute.class_1_id' }, // 分類１
    { resource_path: 'car.distributor_attribute.class_2_id' }, // 分類２
    { resource_path: 'car.distributor_attribute.class_3_id' }, // 分類３
    { resource_path: 'car.distributor_attribute.class_4_id' }, // 分類４
    { resource_path: 'car.distributor_attribute.class_5_id' }, // 分類５
    { resource_path: 'car.distributor_attribute.intended_purpose_code' }, // 使用目的
    { resource_path: 'car.distributor_attribute.debit_kind' }, // 債権
    { resource_path: 'car.customer_id' }, // 顧客
    { resource_path: 'car.user_permission_sub_group_ids' }, // サブグループ
    { resource_path: 'car.bank_id' }, // 銀行
    { resource_path: 'car.insurance_id' }, // 保険
    { resource_path: 'car.finance_id' }, // ファイナンス
    { resource_path: 'car.distributor_attribute.delivery_date' }, // 車両納入日
    { resource_path: 'car.distributor_attribute.new_used_kind' }, // 新車中古車区分
    { resource_path: 'car.distributor_attribute.used_delivery_date' }, // 中古車両納入日
    { resource_path: 'car.distributor_attribute.used_delivery_smr' }, // 中古車納入時SMR
    { resource_path: 'car.distributor_attribute.production_year_month' }, // 製造年月
    { resource_path: 'car.distributor_attribute.data_publish_kind' }, // 顧客へのデータ公開
    { resource_path: 'car.distributor_attribute.spec_pattern_id' }, // 仕様パターン
  ];
  var registration_car_name =
    registration_car_kind === '0' ? '標準搭載車両' : 'レトロフィット車両';
  var maker_code = args.body.car.car_identification.maker_code;
  var model = args.body.car.car_identification.model;
  var type = args.body.car.car_identification.type_rev;
  var serial = args.body.car.car_identification.serial;
  var support_distributor_id = args.body.car.support_distributor_id;
  var eqp_delivery_date = '';
  var eqp_used_delivery_date = '';

  if (registration_car_kind === '0') {
    eqp_delivery_date =
      maker_code !== '0002'
        ? moment()
          .subtract(1, 'years')
          .format('MM-DD-YYYY')
        : '';
    eqp_used_delivery_date =
      maker_code === '0003'
        ? moment()
          .subtract(2, 'years')
          .format('MM-DD-YYYY')
        : '';
  } else {
    eqp_delivery_date =
      maker_code !== '0001'
        ? moment()
          .subtract(1, 'years')
          .format('MM-DD-YYYY')
        : '';
    eqp_used_delivery_date =
      maker_code === '0002'
        ? moment()
          .subtract(2, 'years')
          .format('MM-DD-YYYY')
        : '';
  }

  var data = {
    car_management_attribute: {
      registration_car_kind: registration_car_kind,
      registration_car_name: registration_car_name,
      support_distributor_time_difference: '+0900',
      time_difference_setting_kind: registration_car_kind === '0' ? '0' : '1',
      time_difference_setting_name:
        registration_car_kind === '0' ? '15分' : '30分',
    },
    car_identification: {
      maker_code: maker_code,
      maker_name: 'コマツ' + maker_code,
      model,
      type_rev: type,
      rev: type.slice(0, -2),
      serial,
      update_datetime:
        moment()
          .subtract(1, 'days')
          .format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z',
      initial_smr: '10',
      id: maker_code === '0001' ? '1' : '2',
    },
    komtrax_unit: {
      terminal_component: {
        part: '1234-56-7890',
        serial: '12345678',
      },
    },
    support_distributor: {
      id: support_distributor_id,
      label: '担当DB' + support_distributor_id,
      label_english: 'Support Distributor ' + support_distributor_id,
    },
    distributor_attribute: {
      asset_status_kind: '2',
      asset_status_name: '工場在庫2',
      asset_owner_id: '3',
      asset_owner_name: 'コマツ3',
      eqp_delivery_date: eqp_delivery_date,
      eqp_used_delivery_date: eqp_used_delivery_date,
    },
  };

  if (support_distributor_id && support_distributor_id.length === 0) {
    data = _.omit(data, 'support_distributor');
  }

  if (registration_car_kind === '0') {
    possible_input_items = _.reduce(
      possible_input_items,
      (array, item) => {
        if (
          !_.includes(
            [
              'distributor_attribute.asset_status_kind',
              'distributor_attribute.asset_owner_id',
            ],
            item['resource_path']
          )
        ) {
          array.push(item);
        }
        return array;
      },
      []
    );
  }

  mock['result_data'] = {
    possible_input_items: possible_input_items,
    car: data,
  };

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
