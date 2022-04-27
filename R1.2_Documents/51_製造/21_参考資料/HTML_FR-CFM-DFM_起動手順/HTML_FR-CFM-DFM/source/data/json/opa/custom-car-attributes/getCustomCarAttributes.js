var _ = require('lodash');
var pickAvailableResponse = require('../../common/pickAvailableResponse');

module.exports = function(args) {
  var xFields = args.header['x-fields'];
  var from = parseInt(args.header['x-from']);
  var count = parseInt(args.header['x-count']);
  var sort = args.header['x-sort'] || 'flag_conditions.latest_update_datetime';
  var TOTAL = 100;
  var loopEnd = TOTAL > from + count - 1 ? from + count - 1 : TOTAL;
  var data = {
    custom_car_attributes: [],
  };

  for (var i = from; i <= loopEnd; i++) {
    data.custom_car_attributes.push(createData(args, i));
  }

  return success({
    result_header: {
      'X-From': from,
      'X-Count': count,
      'X-Sort': sort,
      'X-TotalCount': TOTAL,
      'Cache-Control': 'no-cache',
    },
    result_data: pickAvailableResponse(data, xFields),
  });
};

function createData(args, i) {
  var custom_car_attribute = {
    update_datetime: '2017-06-01T13:54:00.000Z',
    name: '属性名' + i,
    field_no: '' + ((i % 3) + 1) * 10,
    id: '' + i,
  };

  if (args.query.block_id) {
    _.assign(custom_car_attribute, {
      block_id: '' + args.query.block_id,
      block_label: 'ブロックA',
      block_label_english: 'Block A',
    });
  }

  return custom_car_attribute;
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

function fail(msgs) {
  return {
    status: 400,
    json: {
      error_data: msgs.map(m => {
        return { code: 'COM0002E', message: m, key: 'carId' };
      }),
    },
  };
}
