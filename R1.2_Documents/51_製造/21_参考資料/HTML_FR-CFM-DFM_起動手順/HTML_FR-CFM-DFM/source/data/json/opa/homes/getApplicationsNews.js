const _ = require('lodash');
const moment = require('moment');

module.exports = function() {
  const now = moment();
  var mock = {
    result_data: {
      notifications: _.map(_.range(_.random(0, 3)), i => {
        return {
          end_datetime: now
            .clone()
            .add(i, 'd')
            .format('YYYY-MM-DD HH:mm:SS'),
          start_datetime: now
            .clone()
            .add(i, 'd')
            .format('YYYY-MM-DD HH:mm:SS'),
          content: `【お知らせ_${i}】2014年12月25日（木）19：00から20：00まで、KOMTRAXサーバメンテナンスを実施いたします。該当時間は、KOMTORAXのご利用ができませんので、ご容赦願います。`,
        };
      }),
    },
  };

  return success(mock);
};

function success(data) {
  return {
    status: 200,
    json: {
      result_data: data.result_data,
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
          keys: ['???'],
        },
      ],
    },
  };
}
