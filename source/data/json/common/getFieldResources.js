var Promise = require('bluebird');
var fail = require('./fail');
var readFile = require('./readFile');

var PATH_BASE = './data/json/common/field_resource/';

module.exports = function(data) {
  return new Promise(function(resolve) {

    setTimeout(() => {
      if (data.query.function_code) {
        var path =
          PATH_BASE + 'function_code/' + data.query.function_code + '.json';
        readFile(path)
          .then(jsonData => {
            resolve(success(jsonData, data.query.function_code));
          })
          .catch(errMessage => {
            console.log(errMessage);
            resolve(fail(errMessage));
          });
        return;
      }

      resolve(fail('パラメータが誤っています。'));
    }, 0);
  });
};

function success(data, fuction_code) {
  return {
    status: 200,
    json: {
      result_data: {
        fuction_code: fuction_code,
        field_resources: [
          {
            code: '10',
            name: '代表連絡先',
            type: '30',
            field_items: data,
          },
        ],
      },
    },
  };
}
