var validation = require('../../common/validation.js');
var moment = require('moment');

module.exports = function(args) {
  var errorData = validation(args.body);
  var notification = args.body.applications_system_notification.notification;
  if (moment(notification.start_datetime).isBefore(moment(), 'D')) {
    errorData.push(dateFail(['start_datetime']));
  }
  if (
    moment(notification.end_datetime).isBefore(
      moment(notification.start_datetime),
      'D'
    )
  ) {
    errorData.push(dateFail(['end_datetime', 'start_datetime']));
  }
  if (errorData.length > 0) {
    return fail(errorData);
  }
  var mock = {
    result_data: {
      applications_system_notification: {
        id: '8192910',
        publish_applications: [
          {
            code: 'JPAA1',
            name: 'CFM',
          },
        ],
        publish_group: {
          kind_id: '3',
          kind_name: 'ブロック',
          blocks: [
            {
              id: '12345678',
              label: 'ブロックA',
              label_english: 'blockA',
            },
          ],
        },
        notification: {
          content:
            '03/30/2019　Orbcomm services will be interrupted during the following hours………',
          start_datetime: '2019-03-20 00:00:00',
          end_datetime: '2019-03-30 00:00:00',
        },
        update_datetime: '2019-03-19T00:00:00.000Z',
        registration_datetime: '2019-03-19 00:00:00',
      },
    },
  };

  return success(mock);
};

function success(data) {
  return {
    status: 200,
    json: {
      responses: {
        result_data: data.result_data,
      },
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

function dateFail(names) {
  var keys = names.map(name => {
    return `applications_system_notification.notification.${name}`;
  });
  return {
    keys,
    message:
      keys.map(key => `{{${key}}}`).join(', ') + 'はリクエスト情報が不正です。',
  };
}
