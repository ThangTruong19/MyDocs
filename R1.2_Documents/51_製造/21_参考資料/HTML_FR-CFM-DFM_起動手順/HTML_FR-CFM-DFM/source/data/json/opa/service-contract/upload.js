module.exports = function(args) {
  var result_data, error_data;

  var responses = [];
  var res;
  var hasError;

  for (var i = 0; i < 10; i++) {
    res = {};
    hasError = Math.random() < 0.5;

    res.request = createRequestData(i);

    if (hasError) {
      res.error_data = [
        {
          key: 'carId',
          message: 'リクエスト情報が不正です。',
          code: 'COM0002E',
        },
      ];
    } else {
      res.result_data = { car: createData(i) };
    }

    responses.push(res);
  }

  return done({
    responses,
  });

  // return fail500();
};

function createRequestData(i) {
  return {
    line_no: '' + i,
    car: {
      car_identification: {
        id: '' + i,
        maker_name: 'コマツ',
        division_name: 'スキッドステアローダ',
        model: 'SK714',
        type: 'A12345',
        rev: 'M0',
        type_rev: 'A12345M0',
        serial: 'A12345',
        pin: '12345',
        production_date: '2017/05/23',
        initial_smr: '100.5',
        update_datetime: '2017-05-23T23:59:59.999Z',
      },
      service_distributor: {
        label: 'コマツ東京D',
      },
    },
  };
}

function createData(i) {
  var data = {
    car_identification: null,
    support_distributor: null,
    service_distributor: null,
    customer: null,
  };

  data.car_identification = {
    id: i,
    maker_id: '1',
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
    update_datetime: '2017-05-23T23:59:59.999Z',
  };

  data.support_distributor = {
    id: '1',
    label: 'コマツ東京A',
    label_english: 'KOMATSU Tokyo A',
    organization_code: 'NU0001',
    sub_groups: [
      {
        id: '1',
        label: 'コマツ東京C',
        label_english: 'KOMATSU Tokyo C',
      },
      {
        id: '2',
        label: 'コマツ東京D',
        label_english: 'KOMATSU Tokyo D',
      },
    ],
  };

  data.service_distributor = {
    id: '1',
    label: 'コマツ東京X',
    label_english: 'KOMATSU Tokyo X',
    organization_code: 'NU0002',
    sub_groups: [
      {
        id: '3',
        label: 'コマツ東京Y',
        label_english: 'KOMATSU Tokyo Y',
      },
    ],
  };

  data.customer = {
    id: i,
    label: '顧客 ' + i,
    label_english: 'customer ' + i,
    organization_code: 'NU0001',
    business_type_id: '1',
    business_type_name: '建設業',
    sub_groups: [
      {
        id: '1',
        label: 'コマツ東京C',
        label_english: 'KOMATSU Tokyo C',
      },
    ],
  };

  return data;
}

function done(data) {
  return {
    status: 207,
    json: data,
    header: {
      'Cache-Control': 'no-cache',
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
