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
  var sort = args.header['x-sort'] || 'operation_histries.datetime';
  var TOTAL = isNaN(args.header['x-count']) ? 1 :10;
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

  listMock.result_data.cars = createData(10);

  return success(listMock);
};

function createData(count) {
  const result = [];

  for (var i = 1; i <= count; i++) {
    const isNextGen = Math.random() < 0.7;
    const isIridium = Math.random() < 0.5;

    result.push({
        "car_identification": {
          "id": i,
          "model": "SK71" + i % 10,
          "type_rev": "A12345M" + i % 10,
          "serial": "A38" + i % 10,
          "division_code": i
        },
        "communication_channel": {
          "id": i,
          "code": isIridium ? "5": "1",
          "name": isIridium ? "Iridium": "通信機種1",
        },
        "terminal_mode": {
          "kind": isNextGen ? "0" : i,
          "name": isNextGen ? "次世代": Math.random() < 0.5 ? "モード1": "モード2",
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
            "setting_change_status_name": Math.random() < 0.5 ? "変更中": "完了",
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
    });
  }

  return result;
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
