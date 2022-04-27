module.exports = function(args) {
  var data = [];
  var mock;
  var hasError;

  for (var i = 1; i <= 10; i++) {
    hasError = Math.random() < 0.3;
    if (hasError) {
      mock = {
        error_data: [
          {
            code: 'ERR0001',
            message: '顧客名称が不正です。',
            keys: ['customer.identification.label'],
          },
          {
            code: 'ERR0002',
            message: '顧客組織コードが不正です。',
            keys: ['customer.identification.organization_code'],
          },
        ],
        request: createRequestData(i),
      };
    } else {
      mock = {
        result_data: createResultData(i),
        request: createRequestData(i),
      };
    }

    data.push(mock);
  }

  return success(data);
};

function createRequestData(i) {
  return {
    line_no: '1',
    customer: {
      identification: {
        label: '顧客A',
        label_english: 'Customer A',
        organization_code: 'ABBESS',
      },
      attribute: {
        phone_no: '(03)5412-1111',
        email: 'example@example.jp',
        address: '青森県青森市青森町2-10',
        time_difference: '+0900',
        business_type_name: '建設業',
        nation_name: '日本',
        report_display_label: '顧客A',
      },
      support_distributor: {
        identification: {
          label: 'コマツ建機販売',
        },
      },
    },
  };
}

function createResultData(i) {
  return {
    customer: {
      identification: {
        id: '12345',
        label: '顧客A',
        label_english: 'Customer A',
        organization_code: 'ABBESS',
        kind_id: '8',
        kind_name: '顧客',
        update_datetime: '2017-08-01T23:59:59.000Z',
      },
      attribute: {
        phone_no: '(03)5412-1111',
        email: 'example@example.jp',
        address: '青森県青森市青森町2-10',
        time_difference: '+0900',
        business_type_id: '1',
        business_type_name: '建設業',
        nation_code: 'JP',
        nation_name: '日本',
        report_display_label: '顧客A',
      },
      support_distributor: {
        identification: {
          id: '123456',
          label: 'コマツ建機販売',
          label_english: 'komatsu construction machine sale',
          organization_code: 'ABBESS',
          kind_id: '4',
          kind_name: '代理店',
          update_datetime: '2017-08-01T23:59:59.000Z',
        },
      },
      administrator_role: {
        id: '66666',
        name: '管理者権限',
        authorities: [
          {
            id: '77777',
            name: '車両操作',
            default_kind: '1',
            default_kind_name: 'ON',
          },
        ],
      },
      general_role: {
        id: '88888',
        name: '一般権限',
        authorities: [
          {
            id: '99999',
            name: '車両参照',
            default_kind: '1',
            default_kind_name: 'ON',
          },
        ],
      },
    },
  };
}

function success(data) {
  return {
    status: 207,
    json: {
      responses: data,
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
