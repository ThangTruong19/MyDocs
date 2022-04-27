var _ = require('lodash');

module.exports = function(args) {
  var responses = [];

  if (_.isArray(args.body.cars)) {
    args.body.cars.forEach((operator, index) => {
      responses.push(responseBody(index));
    });
  } else {
    responses.push(responseBody(1));
  }

  return success(responses);
};

function responseBody(index) {
  var type = _.random(0, 1);
  if (type === 0) {
    return {
      result_data: {
        car: {
          car_management_attribute: {
            update_datetime: '2017-05-23T23:59:59.999Z',
            operator_identification_name: 'ID入力（スキップあり）',
            operator_identification_kind: '1',
            orbcomm_request_datetime: '2017/05/23 23:59:59',
            nation_name: 'アメリカ',
            nation_id: '1',
            orbcomm_request_status_name: '申請済',
            orbcomm_request_status: '1',
            orbcomm_request_target_name: '申請対象外',
            orbcomm_request_target_kind: '0',
            car_assign_status_name: '未申請/完了',
            car_assign_status: '0',
            terminal_start_setting_request_key: 'f570d731',
            terminal_use_start_name: '開始準備中',
            time_difference_setting_change_status: '1',
            time_difference: '+0900',
            accumulate_fuel_interval_item_custom_name: 'カスタム不可',
            accumulate_fuel_interval_item_custom_kind: '0',
            smr_interval_item_custom_name: 'カスタム不可',
            smr_interval_item_custom_kind: '0',
            registration_car_name: '標準搭載車両',
            registration_car_kind: '0',
            time_difference_setting_change_status_name: '変更中',
            time_difference_setting_change_start_date: '2017/05/23',
            change_after_time_difference: '+0700',
            support_distributor_time_difference: '+0900',
            time_difference_setting_request_key: 'f570d731',
            time_difference_setting_kind: '1',
            time_difference_setting_name: '30分',
            terminal_use_start_kind: '1',
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
  } else {
    return {
      error_data: [
        {
          keys: [],
          message: '機種の入力が不正です。',
          code: 'COM0002E',
        },
        {
          keys: ['car_management.time_difference'],
          message: '{{car_management.time_difference}}の入力が不正です。',
          code: 'COM0002E',
        },
      ],
    };
  }
}

function success(data) {
  return {
    status: 207,
    json: {
      responses: data,
    },
  };
}
