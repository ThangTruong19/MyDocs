var validation = require('../../common/validation.js');

module.exports = function (args) {
  var systemErrorData = validation(args.query, 'system_error');
  if (systemErrorData.length > 0) {
    return fail500();
  }

  var from = isNaN(args.header['x-from']) ? 1 : parseInt(args.header['x-from']);
  var count = isNaN(args.header['x-count'])
    ? 0
    : parseInt(args.header['x-count']);
  var sort = args.header['x-sort'] || 'operation_histories.datetime';
  var TOTAL = isNaN(args.header['x-count']) ? 1 : 100;
  var loopEnd =
    TOTAL > from + count - 1 && count !== 0 ? from + count - 1 : TOTAL;
  var listMock = {
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
  var data;
  // for (var i = from; i <= loopEnd; i++) {
  //   listMock.result_data.car_list.push(createData(i));
  // }

  listMock.result_data.cars = createData(10);

  return success(listMock);
};

function createData(count) {
  const result = [];

  for (var i = 1; i <= count; i++) {
    result.push({
        "car_identification": {
          "id": i,
          "model": "SK714",
          "type_rev": "A12345M0",
          "serial": "A387",
          "division_code": i
        },
        "communication_channel": {
          "id": i,
          "code": i,
          "name": "Iridium"
        },
        "terminal_mode": {
          "kind": i,
          "name": "次世代"
        },
        "customer": {
          "id": "C000" + i,
          "label": "顧客A",
          "label_english": i
        },
        "support_distributor": {
          "id": "D000" + i,
          "label": "代理店A",
          "label_english": i
        },
        "customize_usage_definitions": [
          {
            "id": "KTX" + i,
            "name": "KOMTRAX標準",
            "version": "A387",
            "setting_change_status": "ver.1",
            "setting_change_status_name": "変更中",
            "customize_definitions": [
              {
                "id": i,
                "name": i,
                "version": i,
                "access_level": {
                  "id": i,
                  "code": i,
                  "name": i
                }

              }
            ]
          },
          {
            "id": "OPS" + i,
            "name": "オペレーション分",
            "version": "A387",
            "setting_change_status": "ver.1",
            "setting_change_status_name": "変更中",
            "customize_definitions": [
              {
                "id": i,
                "name": i,
                "version": i,
                "access_level": {
                  "id": i,
                  "code": i,
                  "name": i
                }

              }
            ]
          },
        ]
            // "checkbox": i,
            // "datetime": "代理店A",
            // "group_id": "17929",
            // "group_label": "顧客A",
            // "group_label_english": "IT distributor",
            // "user_label": [
            //   {
            //     code: "KOMTRAX標準",
            //     name: "huh??",
            //     value: "A387",
            //   },
            //   {
            //     code: "KOMTRAX標準2",
            //     name: "huh2??",
            //     value: "A3872",
            //   },
            // ],
            // "category_code": "LOCK1",
            // "code": "201839",
            // "category_name": "ロック操作",
            // "name": "パスワードロック設定",
            // "model": "SK714",
            // "type_rev": "A12345M0",
            // "serial": "A387",
            // "maker_name": "コマツ",
            // "division_name": "ver.1",
            // "content":　"Iridium",
            // "supplementary_informations": [
            //   {
            //     code: "serial",
            //     name: "機番",
            //     value: "A387",
            //   },
            // ],
            // "app_code": "JPAA1",
            // "app_name": "CFM",
            // "kind": "1",
            // "kind_name": "API操作履歴",
            // "customize_usage_definition_id": "1",
            // "customize_usage_definition_label": "次世代",
            // "customize_definition_id": "1",
            // "customize_definition_label": "",
            // "change_status": "変更中",




            // "checkbox": i,
            // "datetime": "代理店A",
            // "group_id": "17929",
            // "group_label": "顧客A",
            // "group_label_english": "IT distributor",
            // "user_label": [
            //   {
            //     code: "KOMTRAX標準",
            //     name: "huh??",
            //     value: "A387",
            //   },
            //   {
            //     code: "KOMTRAX標準2",
            //     name: "huh2??",
            //     value: "A3872",
            //   },
            // ],
            // "category_code": "LOCK1",
            // "code": "201839",
            // "category_name": "ロック操作",
            // "name": "パスワードロック設定",
            // "model": "SK714",
            // "type_rev": "A12345M0",
            // "serial": "A387",
            // "maker_name": "コマツ",
            // "division_name": "ver.1",
            // "content":　"Iridium",
            // "supplementary_informations": [
            //   {
            //     code: "serial",
            //     name: "機番",
            //     value: "A387",
            //   },
            // ],
            // "app_code": "JPAA1",
            // "app_name": "CFM",
            // "kind": "1",
            // "kind_name": "API操作履歴",
            // "customize_usage_definition_id": "1",
            // "customize_usage_definition_label": "次世代",
            // "customize_definition_id": "1",
            // "customize_definition_label": "",
            // "change_status": "変更中",


            // "customize_usage_definition_id": i,
            // "customize_usage_definition_name": "KOMTRAX標準 (Item " + i + ")",
            // "customize_usage_definition_version": i,
            // "start_date": "2017/12/30",
            // "end_date": "2017/12/30",
            // "priority": "1",
            // "priority_name": "low",
            // "use_kind": "0",
            // "use_name": "利用中",
            // "customize_definitions": [
            //   {
            //     "customize_definition_id": 1,
            //     "customize_definition_name": "KOMTRAXデータ v1.0",
            //     "priority": "1",
            //     "priority_name": "low",
            //     "active_kind": "1",
            //     "active_name": "有効",
            //     "latest_operation_code": "1",
            //     "latest_operation_code_name": "追加",
            //     "status": "10",
            //     "status_name": "送信中",
            //     "assumption_data_value": 2022000,
            //     "start_date": "2017/12/30",
            //     "end_date": "2017/12/30",
            //     "first_receive_datetime": "2017/02/01 23:59:59",
            //     "latest_receive_datetime": "2017/05/23 23:59:59",
            //     "aggregation_condition_id": 1,
            //     "aggregation_condition_name": "10分毎",
            //     "send_condition_id": 1,
            //     "send_condition_name": "1時間毎",
            //     "customize_access_level": "1",
            //     "customize_access_level_name": "開発者"
            //   },
            //   {
            //     "customize_definition_id": 2,
            //     "customize_definition_name": "KOMTRAXデータ v2.0",
            //     "priority": "1",
            //     "priority_name": "low",
            //     "active_kind": "1",
            //     "active_name": "有効",
            //     "latest_operation_code": "1",
            //     "latest_operation_code_name": "追加",
            //     "status": "10",
            //     "status_name": "送信中",
            //     "assumption_data_value": 2022000,
            //     "start_date": "2017/12/30",
            //     "end_date": "2017/12/30",
            //     "first_receive_datetime": "2017/02/01 23:59:59",
            //     "latest_receive_datetime": "2017/05/23 23:59:59",
            //     "aggregation_condition_id": 1,
            //     "aggregation_condition_name": "10分毎",
            //     "send_condition_id": 1,
            //     "send_condition_name": "1時間毎",
            //     "customize_access_level": "1",
            //     "customize_access_level_name": "開発者"
            //   },
            //   {
            //     "customize_definition_id": 3,
            //     "customize_definition_name": "KOMTRAXデータ v3.0",
            //     "priority": "1",
            //     "priority_name": "low",
            //     "active_kind": "1",
            //     "active_name": "有効",
            //     "latest_operation_code": "1",
            //     "latest_operation_code_name": "追加",
            //     "status": "10",
            //     "status_name": "送信中",
            //     "assumption_data_value": 2022000,
            //     "start_date": "2017/12/30",
            //     "end_date": "2017/12/30",
            //     "first_receive_datetime": "2017/02/01 23:59:59",
            //     "latest_receive_datetime": "2017/05/23 23:59:59",
            //     "aggregation_condition_id": 1,
            //     "aggregation_condition_name": "10分毎",
            //     "send_condition_id": 1,
            //     "send_condition_name": "1時間毎",
            //     "customize_access_level": "1",
            //     "customize_access_level_name": "開発者"
            //   }
            // ]
      // },
    });
  }

  return result;
}

// function createData(i) {
//   var moment = require('moment');

//   data = {
//     checkbox: i,
//     datetime: '代理店A',
//     group_id: '17929',
//     group_label: '顧客A',
//     group_label_english: 'IT distributor',
//     user_label: [
//       {
//         code: 'KOMTRAX標準',
//         name: 'huh??',
//         value: 'A387',
//       },
//       {
//         code: 'KOMTRAX標準2',
//         name: 'huh2??',
//         value: 'A3872',
//       },
//     ],
//     category_code: 'LOCK1',
//     code: '201839',
//     category_name: 'ロック操作',
//     name: 'パスワードロック設定',
//     model: 'SK714',
//     type_rev: 'A12345M0',
//     serial: 'A387',
//     maker_name: 'コマツ',
//     division_name: 'ver.1',
//     content:　'Iridium',
//     supplementary_informations: [
//       {
//         code: 'serial',
//         name: '機番',
//         value: 'A387',
//       },
//     ],
//     app_code: 'JPAA1',
//     app_name: 'CFM',
//     kind: '1',
//     kind_name: 'API操作履歴',
//     customize_usage_definition_id: '1',
//     customize_usage_definition_label: '次世代',
//     customize_definition_id: '1',
//     customize_definition_label: '',
//     change_status: '変更中'
//   };
//   return data;
// }

function success(data) {
  return {
    status: 200,
    json: {
      result_data: data.result_data,
    },
    header: data.result_header,
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
          keys: '???',
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
