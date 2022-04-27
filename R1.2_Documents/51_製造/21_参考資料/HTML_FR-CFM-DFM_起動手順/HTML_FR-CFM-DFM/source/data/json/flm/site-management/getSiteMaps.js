var pickAvailableResponse = require('../../common/pickAvailableResponse');
var icons = [
  {
    no: '65',
    id: '1',
    color: '#0000FF',
  },
  {
    no: '70',
    id: '1',
    color: '#0000FF',
  },
];
module.exports = function(args) {
  var mode = args.query.mode;
  var customerId = args.query.customer_ids
    ? parseInt(args.query.customer_ids)
    : 1;
  var id = args.query.site_ids || args.query.area_ids;
  var xFields = args.header['x-fields']
    ? args.header['x-fields'].split(',')
    : null;
  var from = 1;
  var count = id ? 1 : 10;
  var sort = mode === '1' ? 'group_area_maps.label' : 'site_maps.label';
  var TOTAL = id ? 1 : 10;
  var loopEnd = id ? 1 : 10;
  var mock = {
    result_header: {
      'X-From': from,
      'X-Count': count,
      'X-Sort': sort,
      'X-TotalCount': TOTAL,
      'Cache-Control': 'no-cache',
    },
    result_data: {},
  };

  switch (mode) {
    // エリア
    case '1':
      mock.result_data.group_area_maps = createGroupAreaMaps(count, customerId);
      if (mock.result_data.group_area_maps.length > 0) mock.result_data.group_area_maps[0].cars.length = 1;
      break;
    // 現場
    case '2':
      mock.result_data.site_maps = createSiteMaps(
        count,
        id,
        args.header['x-screencode']
      );
      if (mock.result_data.site_maps.length > 0) mock.result_data.site_maps[0].cars.length = 1;
      break;
  }

  mock.result_data = xFields
    ? pickAvailableResponse(mock.result_data, xFields)
    : mock.result_data;

  return success(mock);
  // return fail500();
};

function createGroupAreaMaps(count, customerId) {
  const result = [];
  if (customerId === 2) {
    return result;
  }

  for (var i = 1; i <= count; i++) {
    result.push({
      id: '' + i,
      label: `顧客${customerId}のグループエリア名称` + i,
      no: '1',
      group_id: '1',
      group_label: 'コマツ東京C',
      group_label_english: 'KOMATSU Tokyo C',
      description: null,
      feature: {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [139.8215963, 35.72588514],
              [139.70961392, 35.72588514],
              [139.70967858, 35.63367834],
              [139.82153164, 35.63367834],
              [139.8215963, 35.72588514],
            ],
          ],
        },
        properties: {
          color: '#0000FF',
          type_name: 'ポリゴン',
        },
      },
      cars: createCarData(customerId),
    });
  }

  return result;
}

function createSiteMaps(count, id, screencode) {
  const result = [];

  /**
   * 現場一覧では特定の条件下で 0 件を返すことが難しいため、ランダムで空配列を返す。
   * また、0 件表示した場合の現場一覧から、詳細に遷移した場合にデータ整合性が取れるよう、
   * id なしで詳細にアクセスした場合も空配列で返す。
   */
  if (
    (screencode === 'flm_jobsite_site_mgt_site' &&
      Math.round(Math.random()) % 2) ||
    (!id && screencode === 'flm_jobsite_site_mgt_site_map')
  ) {
    return result;
  }

  for (var i = 1; i <= count; i++) {
    result.push({
      id: '' + i,
      label: '現場名称' + i,
      group_id: '1',
      group_label: 'コマツ東京C',
      group_label_english: 'KOMATSU Tokyo C',
      start_datetime: '2019/03/20 00:00:00',
      end_datetime: '2019/03/20 00:00:00',
      cars: createCarData(1),
    });
  }

  return result;
}

function createCarData(customerId) {
  const cars = [];
  const carCount = Math.floor(Math.random() * 10 + 1);
  for (let i = 1; i <= carCount; i++) {
    cars.push({
      car_identification: {
        id: `${i}`,
        maker_id: '1',
        maker_code: '0001',
        maker_name: 'コマツ',
        division_id: '1',
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
      customer: {
        id: `${customerId}`,
        label: `顧客_${customerId}`,
        label_english: `customer_${customerId}`,
        organization_code: 'NU0003',
        business_type_id: '1',
        business_type_name: '建設業',
        phone_no: '0312345678',
        address: '青森県青森市青森町2-10',
      },
      customer_attribute: {
        operator_label1: 'オペレータ１',
        operator_label2: 'オペレータ２',
        operator_label3: 'オペレータ３',
        mainte_in_charge: '保守責任者１',
        remarks: '特記事項です',
        user_memo: '自由記入欄です',
        customer_car_no: '123456',
        customer_management_no: '123456',
      },
      latest_status: {
        point:
          Math.random() < 0.9
            ? {
                type: 'Point',
                coordinates: [139.0 + Math.random(), 35.0 + Math.random()],
              }
            : null,
      },
      icon_font: icons[i % 2],
    });
  }
  return cars;
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
