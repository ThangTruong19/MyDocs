module.exports = function(args) {
  var from = 1; //未指定時は1が返るため
  var count = 0; //未指定時は0(全件取得)が返るため
  var sort = args.header['x-sort'] || 'classes.label'; //未指定時は分類名称の降順'
  var totalCount = 100; //100件のデータが返ることを想定する
  var data = [];
  var classItems = [];

  // 担当DBと分類区分IDはリクエストに応じて変化するようにする。
  var supportDistributorId = args.query.support_distributor_id
    ? args.query.support_distributor_id.toString()
    : '1';
  var kindId = args.query.kind_id ? args.query.kind_id.toString() : '1';

  if (args.query.class_id) {
    var id = args.query.class_id;
    classItems = [
      {
        update_datetime: `2017-05-23T23:59:59.${('000' + id).slice(-3)}Z`,
        support_distributor_label_english: 'group' + supportDistributorId,
        support_distributor_label: '担当' + supportDistributorId,
        support_distributor_id: supportDistributorId,
        kind_name: '分類' + kindId,
        kind_id: kindId,
        id: `${id}`,
        label: `神奈川統括${id}`,
      },
    ];
  } else {
    for (var i = count; i < totalCount; i++) {
      const labelNum = args.header['x-sort'] === '-classes.label' ? 100 - i : i;
      const classItem = {
        update_datetime: `2017-05-23T23:59:59.${('000' + i).slice(-3)}Z`,
        support_distributor_label_english: 'group' + supportDistributorId,
        support_distributor_label: '担当' + supportDistributorId,
        support_distributor_id: supportDistributorId,
        kind_name: '分類' + kindId,
        kind_id: kindId,
        id: '' + i,
        label: `神奈川統括${labelNum}`,
      };
      classItems.push(classItem);
    }
  }

  data = {
    result_header: {
      'X-From': from,
      'X-Count': count,
      'X-Sort': sort,
      'X-TotalCount': totalCount,
    },
    result_data: {
      classes: classItems,
    },
  };
  return success(data);
  // return failToken();
};

function success(data) {
  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve({
        status: 200,
        json: {
          result_data: data.result_data,
        },
        header: data.result_header,
      });
    }, 100);
  });
}

function fail() {
  return {
    status: 400,
    json: {
      error_data: [
        {
          keys: ['car_id'],
          message: 'リクエスト情報が不正です。',
          code: 'COM0002E',
        },
      ],
    },
  };
}

function failToken() {
  return {
    status: 401,
    json: {
      error_data: [
        {
          keys: [],
          message: 'トークンが不正です。',
          code: 'COM0001F',
        },
      ],
    },
  };
}
