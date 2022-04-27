var Promise = require('bluebird');
var fs = require('fs');
var _ = require('lodash');

var Promise = require('bluebird');
var fail = require('./fail');
var readFile = require('./readFile');

var PATH_BASE = './data/json/common/resource/';

module.exports = function (data) {
  return new Promise(function (resolve) {
    var target = null;
    var screenCode = data.body.screen_code;

    // 条件指定あり
    if (data.body.search_parameters) {
      var params = data.body.search_parameters[0];
      if (_.has(params, 'resource_path')) {
        target = _.map(data.body.search_parameters, p => p.resource_path);
      }

      // condition_sets による条件指定
      if (_.has(params, 'condition_sets')) {
        resolveConditionSets(
          resolve,
          params.condition_sets,
          screenCode,
          target
        );
        return;
        // kinds による条件指定（kind指定付きの画面初期表示用）
      } else if (_.has(params, 'kinds') && !_.has(params, 'resource_path')) {
        resolveFile(
          resolve,
          PATH_BASE + 'screen_code/' + screenCode + '.json',
          screenCode,
          target
        );
        return;
        // kinds + resource_path による条件指定
      } else if (_.has(params, 'kinds') && _.has(params, 'resource_path')) {
        if (target[0] === 'division_code' && params.kinds[0] === 'D') {
          readFile(
            PATH_BASE + 'resource_path/' + target[0] + '.json',
            target
          ).then(function (json) {
            resolve(success(json, screenCode));
          });
          return;
        }

        // screen_code + search_parameters(resorce_pathのみ指定)で見る
        var path = PATH_BASE + 'resource_path/';
        var resource_paths = _.map(
          data.body.search_parameters,
          'resource_path'
        );

        // 返却されたリソースパスに応じて参照するファイルを変更する
        switch (screenCode) {
          case 'flm_car_mgt_regist': // 車両管理 登録画面
            // 使用国リソース取得の場合
            if (_.includes(resource_paths, 'orbcomm_request.nation_id')) {
              path = path + 'nation/';
            } else if (
              !_.includes(
                resource_paths,
                'car.distributor_attribute.asset_status_kind'
              )
            ) {
              // 資産情報参照のみの場合
              path = path + 'asset/';
            }
            break;
        }

        resolveFile(resolve, path + screenCode + '.json', screenCode, null);
        return;
      }
    }

    // 条件指定なし（画面初期表示用）
    if (data.body.screen_code) {
      resolveFile(
        resolve,
        PATH_BASE + 'screen_code/' + screenCode + '.json',
        screenCode,
        target
      );
      return;
    }

    // 画面コード（必須）の指定がない
    resolve(fail('パラメータが誤っています。'));
  });
};

function resolveConditionSets(resolve, conditionSets, screenCode, target) {
  const cond = conditionSets[0];
  // 以降の実装においては画面コードによる切り分けを行う
  switch (screenCode) {
    case 'flm_service_contract_mgt_consignor_list':
      var path = 'screen_code/flm_service_contract_mgt_consignor_list/';
      var type = '';
      switch (cond.condition) {
        // 車両の検索条件設定にて担当DBが変更された時に使用する
        case 'common.support_distributor.ids':
          type = 'support_distributor_id';
      }

      responseCorrespondingData(path + type, cond.values[0], target).then(
        jsonData => {
          resolve(success(jsonData, screenCode));
        }
      );
      return;
    case 'opa_service_contract_mgt_list':
      var path = 'screen_code/opa_service_contract_mgt_list/';
      responseCorrespondingData(
        path + cond.condition,
        cond.values[0],
        target
      ).then(jsonData => {
        resolve(success(jsonData, screenCode));
      });
      return;
    case 'flm_contact_mgt_customer_edit':
      var path = 'screen_code/' + screenCode + '/' + cond.condition;
      responseCorrespondingData(path, cond.values[0], target)
        .then(jsonData => {
          resolve(success(jsonData, screenCode));
        })
        .catch(_e => resolve(success([], screenCode)));
      return;

    case 'flm_user_mgt_regist':
      var path = 'screen_code/' + screenCode + '/' + cond.condition;
      responseCorrespondingData(path, 'default', target)
        .then(jsonData => {
          resolve(success(jsonData, screenCode));
        })
        .catch(_e => resolve(success([], screenCode)));
      return;

    case 'flm_car_mgt_terminal_start_setting':
      var path = 'screen_code/' + screenCode + '/' + cond.condition;
      responseCorrespondingData(path, '1', target)
        .then(jsonData => {
          resolve(success(jsonData, screenCode));
        })
        .catch(_e => resolve(success([], screenCode)));
      return;
    case 'flm_car_mgt_edit':
      var path = 'screen_code/' + screenCode + '/' + cond.condition;
      const value = cond.condition === 'car_id' ? `${+cond.values % 2 + 1}` : cond.values[0] ;
      responseCorrespondingData(path, value, target)
        .then(jsonData => {
          resolve(success(jsonData, screenCode));
        })
        .catch(_e => {
          console.log(_e);
          resolve(success([], screenCode));
        });
      return;
    case 'opa_group_mgt_edit':
      var path = 'screen_code/' + screenCode + '/' + cond.condition;
      responseCorrespondingData(path, cond.condition === 'group.configuration_group_id' ? '1' : cond.values[0], target)
        .then(jsonData => {
          resolve(success(jsonData, screenCode));
        })
        .catch(_e => resolve(success([], screenCode)));
      return;

    case 'flm_history_mgt_list':
    case 'opa_history_mgt_list':
    case 'flm_rental_car_mgt_edit':
    case 'flm_flag_condition_mgt_regist':
    case 'flm_flag_condition_mgt_edit':
    case 'opa_flag_condition_mgt_regist':
    case 'opa_flag_condition_mgt_edit':
    case 'opa_custom_car_attribute_mgt_regist':
    case 'opa_custom_car_attribute_mgt_edit':
    case 'flm_contact_mgt_customer_edit':
    case 'flm_customer_mgt_regist':
    case 'flm_customer_mgt_edit':
    case 'opa_group_mgt_regist':
    // case 'flm_user_mgt_regist':
    case 'flm_user_mgt_edit':
    case 'flm_user_mgt_list':
    case 'opa_user_mgt_regist':
    case 'opa_user_mgt_edit':
    case 'opa_user_mgt_list':
    case 'flm_smr_interval_mgt_regist':
    case 'flm_smr_interval_mgt_edit':
    case 'flm_accum_fuel_interval_mgt_regist':
    case 'flm_accum_fuel_interval_mgt_edit':
    case 'opa_business_type_mgt_regist':
    case 'opa_business_type_mgt_edit':
    case 'flm_car_mgt_regist':
    case 'flm_car_mgt_terminal_change':
    case 'opa_mgt_car_setting_mgt_custom_div_regist':
    case 'opa_mgt_car_setting_mgt_custom_div_edit':
    case 'opa_user_screen_mgt_item_pub_setting':
    case 'opa_mgt_car_setting_mgt_model_setting':
    case 'opa_mgt_car_setting_mgt_type_setting':
      var path = 'screen_code/' + screenCode + '/' + cond.condition;
      responseCorrespondingData(path, cond.values[0], target)
        .then(jsonData => {
          resolve(success(jsonData, screenCode));
        })
        .catch(_e => {
          console.log(_e);
          resolve(success([], screenCode));
        });
      return;
  }

  // 画面コードによる切り分けが行われていないため非推奨
  switch (cond.condition) {
    // 車両の検索条件設定にて担当DBが変更された時に使用する
    case 'common.support_distributor.ids':
      var length = cond.values.length;
      var name = String(length);
      var type;
      if (length <= 0 || length > 4) {
        length = 0;
      }
      switch (screenCode) {
        case 'flm_car_mgt_list': // 車両管理 一覧画面
          type = 'car_belong';
          break;
        case 'flm_group_mgt_car_list': // エリア管理 車両毎設定一覧画面
          type = 'car_belong_area';
          break;
        case 'flm_car_mgt_operator_initialize': // 車両管理 オペ識別初期化画面
          type = 'customers';
          name = cond.values[0];
          break;
        case 'flm_support_distributor_chg_mgt_consignor_list': // 車両管理 担当代理店変更
          type = 'customers';
          name = cond.values[0];
          break;
        case 'flm_smr_interval_mgt_car_list': // SMRインターバル管理項目管理 車両毎設定一覧
          type = 'car_belong_smr';
          break;
        case 'flm_accum_fuel_interval_mgt_car_list': // 累積燃料消費量インターバル管理項目管理 車両毎設定一覧
          type = 'car_belong_fuel';
          break;
      }
      responseCorrespondingData(type, name, null).then(jsonData => {
        resolve(success(jsonData, screenCode));
      });
      break;
    // 車両の検索条件設定にてサービスDBが変更された時に使用する
    case 'common.service_distributor.organization_codes':
      responseCorrespondingData(
        'service_distributor_org_codes',
        cond.values[0],
        target
      ).then(jsonData => {
        resolve(success(jsonData, screenCode));
      });
      break;
    // 車両の検索条件設定にてサービスDB組織コードが変更された時に使用する
    case 'common.service_distributor.ids':
      responseCorrespondingData(
        'service_distributor_ids',
        cond.values[0],
        target
      ).then(jsonData => {
        resolve(success(jsonData, screenCode));
      });
      break;
    // 車両の検索条件設定にて担当DB組織コードが変更された時に使用する
    case 'common.support_distributor.organization_codes':
      responseCorrespondingData(
        'support_distributor_org_codes',
        cond.values[0],
        null
      ).then(jsonData => {
        resolve(success(jsonData, screenCode));
      });
      break;
    // 検索条件設定にて担当DBが変更された時に使用する
    case 'support_distributor_id':
      responseCorrespondingData('agency', cond.values[0], target).then(
        jsonData => {
          resolve(success(jsonData, screenCode));
        }
      );
      break;
    // グループIDが変更された時に使用する
    case 'group_area.group_id':
      responseCorrespondingData(
        'group_area',
        String(+cond.values[0] % 3),
        target
      ).then(jsonData => {
        resolve(success(jsonData, screenCode));
      });
      break;
    // ブロックIDが変更された時に使用する
    case 'block_id':
      responseCorrespondingData('block', cond.values[0], target).then(
        jsonData => {
          resolve(success(jsonData, screenCode));
        }
      );
      break;
    // 所属ID(OPA)orグループID(FLM)が変更された時に使用する
    case 'group_id':
      responseCorrespondingData('group', cond.values[0], target).then(
        jsonData => {
          resolve(success(jsonData, screenCode));
        }
      );
      break;
    // 所属グループIDが変更された時に使用する
    case 'belonging_group_id':
      responseCorrespondingData('belonging_group', cond.values[0], target).then(
        jsonData => {
          resolve(success(jsonData, screenCode));
        }
      );
      break;
    // ロールが変更された時に使用する
    case 'group.granted_role_id':
      responseCorrespondingData('role', cond.values[0], target).then(
        jsonData => {
          resolve(success(jsonData, screenCode));
        }
      );
      break;
    // 顧客公開設定画面で公開設定を変更する時に使用する
    case 'group_kind_id':
      responseCorrespondingData(
        'scope_customer_group_kind',
        cond.values[0],
        target
      ).then(jsonData => {
        resolve(success(jsonData, screenCode));
      });
      break;
    // 設定ブロックが変更された時に使用する
    case 'group.configuration_group_id':
      responseCorrespondingData('block_authority', cond.values[0], null).then(
        jsonData => {
          resolve(success(jsonData, screenCode));
        }
      );
      break;
    // 車両管理画面で担当DBが変更された時に使用する
    case 'car.support_distributor_id':
      responseCorrespondingData(
        'scope_car_support_distributor_id',
        cond.values[0],
        target
      ).then(jsonData => {
        resolve(success(jsonData, screenCode));
      });
      break;
  }
}

function resolveFile(resolve, path, screenCode, target) {
  readFile(path, target)
    .then(jsonData => {
      resolve(success(jsonData, screenCode));
    })
    .catch(errMessage => {
      console.log(errMessage);
      resolve(fail(errMessage));
    });
}

function success(data, screen_code) {
  return {
    status: 200,
    json: {
      result_data: {
        screen_code: screen_code,
        resources: data,
      },
    },
  };
}

function responseCorrespondingData(type, value, target) {
  var file;
  switch (value) {
    case '-99':
      file = 'all';
      break;
    case '-2':
      file = 'empty';
      break;
    default:
      file = value;
      break;
  }
  return readFile(
    PATH_BASE + 'belonging_resource/' + type + '/' + file + '.json',
    target
  );
}
