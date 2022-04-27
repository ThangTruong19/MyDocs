var Promise = require('bluebird');
var fail = require('./fail');
var readFile = require('./readFile');

var PATH_BASE = './data/json/common/search_condition/';

module.exports = function(data) {
  return new Promise(function(resolve) {
    if (data.query.screen_code) {
      var path = PATH_BASE + 'screen_code/' + data.query.screen_code + '.json';
      readFile(path)
        .then(jsonData => {
          resolve(
            success(jsonData, data.query.search_set_no, data.query.screen_code)
          );
        })
        .catch(errMessage => {
          console.log(errMessage);
          resolve(fail(errMessage));
        });
      return;
    }

    resolve(fail('パラメータが誤っています。'));
  });
};

function success(data, no, screen_code) {
  return {
    status: 200,
    json: {
      result_data: {
        search_set: [
          {
            screen_code: screen_code,
            no: no,
            label: '検索条件1',
            search_items: data,
          },
        ],
      },
    },
  };
}
