var validation = require('../../common/validation.js');

module.exports = function(args) {
  console.log(args);

  var errorData = validation(args.body);
  if (errorData.length > 0) {
    return fail(errorData);
  }

  var data = {
    result_data: {
      class: {
        label: '神奈川統括',
        id: '3001',
        support_distributor_label_english: 'group1',
        support_distributor_label: '担当1',
        support_distributor_id: '17',
        kind_name: '分類1',
        kind_id: '1',
        update_datetime: '2017-05-24T23:59:59.000Z',
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
