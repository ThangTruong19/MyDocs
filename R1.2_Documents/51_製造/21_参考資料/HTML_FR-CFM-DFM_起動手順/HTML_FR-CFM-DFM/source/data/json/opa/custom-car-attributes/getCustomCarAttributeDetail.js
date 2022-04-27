var pickAvailableResponse = require('../../common/pickAvailableResponse');

module.exports = function(args) {
  var xFields = args.header['x-fields'];
  var langTable = [
    {
      code: 'en-US',
      name: '英語',
    },
    {
      code: 'ja-JP',
      name: '日本語',
    },

    {
      code: 'fr-FR',
      name: 'フランス語',
    },
  ];
  var data = {
    custom_car_attribute: {
      block_label: 'ブロックA',
      details: [],
      field_no: '' + ((args.params.custom_car_attribute_id % 3) + 1) * 11,
      registered_cars_count: 100,
      block_id: '-99',
      update_datetime: '2017-06-01T13:54:00.000Z',
      block_label_english: 'block A',
      id: '' + args.params.custom_car_attribute_id,
      names: [],
    },
  };

  langTable.forEach(function(lang) {
    data.custom_car_attribute.names.push({
      lang_code: lang.code,
      lang_name: lang.name,
      label: '属性名（' + lang.name + '）',
    });

    for (var i = 0; i < 5; i++) {
      data.custom_car_attribute.details[i] = data.custom_car_attribute.details[
        i
      ] || {
        id: '' + i,
        order: '' + (i + 1),
        names: [],
      };
      data.custom_car_attribute.details[i].names.push({
        lang_code: lang.code,
        lang_name: lang.name,
        label: '項目' + (i + 1) + '名称（' + lang.name + '）',
      });
    }
  });

  return success({
    result_header: {
      'Cache-Control': 'no-cache',
    },
    result_data: xFields ? pickAvailableResponse(data, xFields) : data,
  });
};

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
