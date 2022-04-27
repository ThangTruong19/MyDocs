var validation = require('../../common/validation.js');

module.exports = function(args) {
  var errorData = validation(args.body);
  if (errorData.length > 0) {
    return fail(errorData);
  }
  var data = {
    result_data: {
      business_type: {
        id: '1575139',
        block_id: '2308290',
        block_label: '関東',
        block_label_english: 'Kanto',
        item_names: [
          {
            label: '土木(建設業)',
            lang_code: 'ja-JP',
            lang_name: '日本語',
          },
        ],
        update_datetime: '2019-03-19T00:00:00.000Z',
      },
    },
  };
  return success(data);
};

function success(data) {
  return {
    status: 200,
    json: {
      result_data: data.result_data,
    },
  };
}

function fail(errorData) {
  return {
    status: 400,
    json: {
      error_data: errorData,
    },
  };
}
