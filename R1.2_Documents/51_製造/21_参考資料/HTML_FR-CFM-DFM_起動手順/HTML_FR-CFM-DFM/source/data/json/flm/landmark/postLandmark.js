var validation = require('../../common/validation.js');

module.exports = function(args) {
  var errorData = validation(args.body);
  if (errorData.length > 0) {
    return fail(errorData);
  }

  var data = {
    landmark: {
      id: '25454',
      label: '小松製作所 本社',
      icon: {
        id: '14',
        image: 'data:image/png;base64,iVBORrkJggg==',
        name: 'ビル',
      },
      point: {
        type: 'Point',
        coordinates: [139.766027, 35.681657],
      },
      group: {
        id: '1',
        label: 'グループA',
        label_english: 'GRPA',
      },
      free_memo: '東京都にあります。',
      publish_kind: '0',
      publish_name: '共有しない',
      update_datetime: '2017-08-01T00:00:00.999Z',
    },
  };

  return success(data);
  // fail500();
};

function success(data) {
  return {
    status: 200,
    json: {
      result_data: data,
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
