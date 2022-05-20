module.exports = function(args) {
  var data = [];
  var mock;
  var hasError;

  hasError = Math.random() < 0.5;
  for (var i = 1; i <= 10; i++) {
    mock = {};

    if (hasError) {
      mock = {
        error_data: {
          "keys": [],
          "message": '[ACOM00' + (i % 10) + ']' + i + '行目、機種野形式に誤りがあります。' ,
          "code": 'ERR0000X'
        },
      };
    } else {
      mock = {
              "request": {
                  "row_no": i,
                  "customize_usage_definition_info": {
                    "model": Math.random() < 0.2 ? '10': '11',
                    "type": 'PC20' + i % 10,
                    "serial": 'XXX' + i % 10,
                    "support_distributor": '担当代理店_1',
                    "customer": '顧客_1',
                    "customize_definition": Math.random() < 0.7 ? 'KOMTRAX標準': 'オペレーション分析',
                    "version": Math.random() < 0.2 ? 'Ver1': (Math.random() < 0.8 ? 'Ver2' : 'Ver3'),
                    "status": Math.random() < 0.3 ? '変更': '削除',
                    "change_necessity": '設定中',
                    "priority": Math.random() < 0.7 ? '中': '低',
                    "active_disable": '有効',
                    "start_datetime": '2022/11/15',
                    "end_datetime": '2022/12/31',
                    "instant_kind": Math.random() < 0.7 ? '即時': '通常',
                    "latest_operation": '追加'
                  }
              },
              "response": {
                "request_key": 'a23defww'
              }
      };
    }

    data.push(mock);
  }

  return success(data);
};

function success(data) {
  return {
    status: 207,
    json: {
      result_data: {
        results: data,
      },
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
