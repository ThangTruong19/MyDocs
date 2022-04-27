var validation = require('../../common/validation.js');
var _ = require('lodash');
var moment = require('moment');

module.exports = function (args) {
  var errorData = validation(args.body);
  if (errorData.length > 0) {
    return fail(errorData);
  }
  var mock = {
    result_data: {},
  };
  var maker_code = args.body.car.car_identification.maker_code;
  var model = args.body.car.car_identification.model;
  var type = args.body.car.car_identification.type_rev;
  var serial = args.body.car.car_identification.serial;
  var support_distributor_id = _.isUndefined(
    args.body.car.support_distributor_id
  )
    ? ''
    : args.body.car.support_distributor_id;
  var update_datetime = args.body.car.car_identification.update_datetime;
  var komtrax_unit_part = _.isUndefined(args.body.car.komtrax_unit)
    ? '1234-56-7890'
    : args.body.car.komtrax_unit.terminal_component.part;
  var komtrax_unit_serial = _.isUndefined(args.body.car.komtrax_unit)
    ? '012345'
    : args.body.car.komtrax_unit.terminal_component.serial;
  var registration_car_kind =
    args.body.car.car_management_attribute.registration_car_kind;
  // SMRインターバル管理項目カスタム区分 [ 0:カスタム不可, 1:カスタム可能 ]
  var smr_interval_item_custom_kind = registration_car_kind === '0' ? '1' : '0';
  // 累積燃料消費量管理項目カスタム区分 [ 0:カスタム不可, 1:カスタム可能 ]
  var accumulate_fuel_interval_item_custom_kind =
    registration_car_kind === '0' ? '1' : '0';
  // Orbcomm申請対象区分 [ 0:申請対象外, 1:申請対象 ]
  var orbcomm_request_target_kind = registration_car_kind === '0' ? '1' : '0';
  var nation_id = '';
  var nation_name = '';

  switch (support_distributor_id) {
    case 'N0001':
      nation_id = '3';
      nation_name = '担当DB1の使用国003';
      break;
    case 'N0002':
      nation_id = '2002';
      nation_name = '担当DB2の使用国003';
      break;
    default:
      nation_id = '3003';
      nation_name = '代理店ユーザの使用国003';
      break;
  }

  // Orbcom申請対象区分 申請対象外かつ「累積燃料消費量管理項目」, 「SMRインターバル管理項目」カスタム可能のテストデータ
  // // Orbcomm申請対象区分 [ 0:申請対象外, 1:申請対象 ]
  // var orbcomm_request_target_kind = '0';
  var data = {
    car_identification: {
      update_datetime: update_datetime,
      model: model,
      type_rev: type,
      serial: serial,
      maker_name: 'コマツ' + maker_code,
      maker_code: maker_code,
      id: 1,
    },
    komtrax_unit: {
      terminal_component: {
        serial: komtrax_unit_serial,
        part: komtrax_unit_part,
      },
      main_component: {
        serial: '0000-00-0000',
        part: '00000000',
      },
    },
    support_distributor: {
      id: support_distributor_id,
    },
    car_management_attribute: {
      smr_interval_item_custom_kind: smr_interval_item_custom_kind,
      accumulate_fuel_interval_item_custom_kind: accumulate_fuel_interval_item_custom_kind,
      orbcomm_request_target_kind: orbcomm_request_target_kind,
      nation_id: nation_id,
      nation_name: nation_name,
    },
  };

  if (support_distributor_id.length === 0) {
    data = _.omit(data, 'support_distributor');
  }

  mock['result_data'] = {
    car: data,
  };

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
