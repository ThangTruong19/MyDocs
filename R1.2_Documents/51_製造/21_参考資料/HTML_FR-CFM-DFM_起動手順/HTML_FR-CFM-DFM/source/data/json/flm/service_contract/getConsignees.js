var pickAvailableResponse = require('../../common/pickAvailableResponse');
var requestStatus = '-99';
var statusName = {
  '0': '未承認',
  '1': '承認済み',
  '9': '却下',
};

module.exports = function(args) {
  var xFields = args.header['x-fields'];
  var from = isNaN(args.header['x-from']) ? 1 : parseInt(args.header['x-from']);
  var count = isNaN(args.header['x-count'])
    ? 0
    : parseInt(args.header['x-count']);
  var sort = args.header['x-sort'] || '';
  var TOTAL = 100;
  var loopEnd =
    TOTAL > from + count - 1 && count !== 0 ? from + count - 1 : TOTAL;

  requestStatus = args.query.service_contract_request_status;

  var mock = {
    result_header: {
      'X-From': from,
      'X-Count': count,
      'X-Sort': sort,
      'X-TotalCount': TOTAL,
      'Cache-Control': 'no-cache',
    },
    result_data: {
      service_contract_requests: [],
    },
  };

  for (var i = from; i <= loopEnd; i++) {
    mock.result_data.service_contract_requests.push(createData(i));
  }

  mock.result_data = pickAvailableResponse(mock.result_data, xFields);

  return success(mock);
};

function createStatusId() {
  if (requestStatus === '-99') {
    var ids = ['0', '1', '9'];
    return ids[Math.floor(Math.random() * ids.length)];
  }
  return requestStatus;
}

function createData(i) {
  var statusId = createStatusId();
  var data = {
    id: String(i),
    applicant_label: `小松太郎${i}`,
    applicant_email: 'tarou.komatsu@example.com',
    free_memo: 'コメント',
    status: statusId,
    status_name: statusName[statusId],
    service_distributor: {
      id: '632',
      label: 'コマツ福島',
      label_english: 'KOMATSU Fukushima',
    },
    car: {
      car_identification: {
        id: String(i),
        maker_id: String(i),
        maker_code: `000${i}`,
        maker_name: 'コマツ',
        division_id: String(i),
        division_code: `000${i}`,
        division_name: 'ブルドーザ',
        model_id: String(i),
        model: 'D85PX',
        model_type_id: '1',
        type: '15',
        rev: 'E0',
        type_rev: `15E0${i}`,
        icon_font_no: '1',
        serial: `A12345${i}`,
        pin: 'KMT0D101CJAA12345',
        production_date: '2017/05/23',
        initial_smr: '100.5',
        update_datetime: '2017-05-23T23:59:59.999Z',
      },
      support_distributor: {
        id: '401',
        label: `コマツ東京${i}`,
        label_english: `KOMATSU Tokyo ${i}`,
        organization_code: 'NU0001',
      },
      service_distributor: {
        id: '402',
        label: `コマツ東京${10 + i}`,
        label_english: `KOMATSU Tokyo ${10 + i}`,
        organization_code: 'NU0002',
      },
      customer: {
        id: '601',
        label: `顧客_${i}`,
        label_english: `customer_${i}`,
        organization_code: 'NU0003',
        business_type_id: '1',
        business_type_name: '建設業',
        phone_no: '(03)5412-1111',
        address: '青森県青森市青森町2-10',
      },
    },
    receive_datetime: '2017/05/23 23:59:59',
    update_datetime: '2017-05-23T23:59:59.999Z',
  };

  if (i % 2 === 0) {
    delete data.free_memo;
  }

  return data;
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

function startDownload(data) {
  return {
    status: 202,
    json: {
      result_data: data,
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
