module.exports = function(args) {
  var TOTAL = args.body.cars == null ? 0 : args.body.cars.length;
  var result = {
    responses: [],
  };
  var item;

  for (var i = 1; i <= TOTAL; i++) {
    item = {};
    Math.random() < 0.5
      ? (item.result_data = { car: createData(i) })
      : (item.error_data = createErrorData());
    result.responses.push(item);
  }

  return success(result);
};

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

function createErrorData() {
  return [
    {
      code: 'COM0002E',
      message: '{{cars.service_distributor_id}}の形式に誤りがあります。',
      keys: ['cars.service_distributor_id'],
    },
  ];
}

function success(data) {
  return {
    status: 207,
    json: data,
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
