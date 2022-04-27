var _ = require('lodash');

module.exports = function(args) {
  var TOTAL = 100;
  var mock = {
    result_header: {
      'X-From': 1,
      'X-Count': 0,
      'X-Sort': 'companies.identification.organization_code',
      'X-TotalCount': TOTAL,
      'Cache-Control': 'no-cache',
    },
    result_data: {
      companies: [],
    },
  };

  var data;
  var companies = {
    US: {
      identification: {
        id: '1234567890123456789',
        code: 'KOMATSU0000000000001',
        label: 'コマツアメリカ',
        label_english: 'Komatsu Ltd.',
        organization_code: 'KMTUS',
        address: '青森県青森市青森町2-10',
        postalcode: '1078414',
        phone_no: '09099999999',
        nation_code: 'US',
        nation_name: 'アメリカ',
      },
    },
    JP: {
      identification: {
        id: '1234567890123456789',
        code: 'KOMATSU0000000000001',
        label: 'コマツ日本',
        label_english: 'Komatsu Ltd.',
        organization_code: 'KMTJP',
        address: '青森県青森市青森町2-10',
        postalcode: '1078414',
        phone_no: '09099999999',
        nation_code: 'JP',
        nation_name: '日本',
      },
    },
    FR: {
      identification: {
        id: '1234567890123456789',
        code: 'KOMATSU0000000000001',
        label: 'コマツフランス',
        label_english: 'Komatsu Ltd.',
        organization_code: 'KMTFR',
        address: '青森県青森市青森町2-10',
        postalcode: '1078414',
        phone_no: '09099999999',
        nation_code: 'FR',
        nation_name: 'フランス',
      },
    },
  };
  var company = companies[args.query.nation_code];

  for (var i = 1; i < TOTAL + 1; i++) {
    data = _.cloneDeep(company);
    data.identification.id = i + '';

    mock.result_data.companies.push(data);
  }

  return success(mock);
};

function success(data) {
  return {
    status: 200,
    json: {
      result_data: data.result_data,
    },
    header: data.result_header,
  };

  // 検索結果0件
  // return {
  //   status: 200,
  //   json: {
  //     result_data: {
  //       users: []
  //     }
  //   },
  //   header: {
  //     'X-From': 1,
  //     'X-Count': 0,
  //     'X-Sort': 'users.identification.id',
  //     'X-TotalCount': 0,
  //     'Cache-Control': 'no-cache'
  //   }
  // };
}

function fail(msg) {
  return {
    status: 500,
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
