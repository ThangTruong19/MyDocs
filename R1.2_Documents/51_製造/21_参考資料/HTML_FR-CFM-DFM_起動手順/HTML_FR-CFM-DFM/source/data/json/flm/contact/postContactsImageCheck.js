module.exports = function(args) {
  return success(args.body.photo.image);
  // return fail();
};

function success(data) {
  return {
    status: 200,
    json: {
      result_data: {
        photo: {
          image: data,
          image_attribute: {
            width: 600,
            height: 800,
          },
          minimum_limit: {
            min_width: 240,
            min_height: 320,
          },
        },
      },
    },
  };
}

function fail() {
  return {
    status: 400,
    json: {
      error_data: [
        {
          keys: ['photo.image'],
          message: '画像はリクエスト情報が不正です。',
          code: 'ACOM0002E',
        },
      ],
    },
  };
}
