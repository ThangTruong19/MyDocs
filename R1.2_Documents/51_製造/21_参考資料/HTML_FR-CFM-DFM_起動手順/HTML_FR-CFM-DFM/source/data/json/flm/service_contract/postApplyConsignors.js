var _ = require('lodash');

module.exports = function(args) {
  var responses = [];

  _.each(args.body.service_contract_requests, (r, index) => {
    responses.push(responseBody(index, r));
  });

  return success(responses);
};

function responseBody(index, car) {
  var type = _.random(0, 1);
  if (type === 0) {
    return {
      result_data: {
        service_contract_request: {
          id: '123',
          applicant_label: '小松太郎',
          applicant_email: 'tarou.komatsu@example.com',
          free_memo: 'コメント',
          status: '0',
          status_name: '未承認',
          service_distributor: {
            id: '632',
            label: 'コマツ福島',
            label_english: 'KOMATSU Fukushima',
          },
          car: {
            car_identification: {
              id: '1',
              maker_id: '1',
              maker_code: '0001',
              maker_name: 'コマツ',
              division_id: '1',
              division_code: '0001',
              division_name: 'スキッドステアローダ',
              model_id: '1',
              model: 'SK714',
              model_type_id: '1',
              type: 'A12345',
              rev: 'M0',
              type_rev: 'A12345M0',
              icon_font_no: '1',
              serial: 'A12345',
              pin: '12345',
              production_date: '2017/05/23',
              initial_smr: '100.5',
              update_datetime: '2017-05-23T23:59:59.999Z',
            },
            support_distributor: {
              id: '401',
              label: 'コマツ東京C',
              label_english: 'KOMATSU Tokyo C',
              organization_code: 'NU0001',
            },
            service_distributor: {
              id: '402',
              label: 'コマツ東京D',
              label_english: 'KOMATSU Tokyo D',
              organization_code: 'NU0002',
            },
            customer: {
              id: '601',
              label: '顧客_1',
              label_english: 'customer_1',
              organization_code: 'NU0003',
              business_type_id: '1',
              business_type_name: '建設業',
              phone_no: '(03)5412-1111',
              address: '青森県青森市青森町2-10',
            },
          },
          receive_datetime: '2017/05/23 23:59:59',
          update_datetime: '2017-05-23T23:59:59.999Z',
        },
      },
    };
  } else {
    return {
      error_data: [
        {
          code: 'E00000',
          message:
            '{{service_contract_requests.applicant_label}}の形式に誤りがあります。',
          keys: ['service_contract_requests.applicant_label'],
        },
        {
          code: 'E00000',
          message:
            '{{service_contract_requests.service_distributor_id}}の形式に誤りがあります。',
          keys: ['service_contract_requests.service_distributor_id'],
        },
        {
          code: 'E00000',
          message: '機種の形式に誤りがあります。',
          keys: [],
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
