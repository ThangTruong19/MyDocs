var Promise = require('bluebird');
var fs = require('fs');
var _ = require('lodash');

module.exports = function(path, target = null) {
  return new Promise(function(resolve, reject) {
    fs.readFile(path, 'utf8', function(err, text) {
      if (err) {
        reject('got error on reading ' + path);
        return;
      }
      jsonData = JSON.parse(text);

      // 要素の絞り込み処理
      if (target) {
        jsonData = _.filter(jsonData, d => _.includes(target, d.path));
      }

      resolve(jsonData);
    });
  });
};
