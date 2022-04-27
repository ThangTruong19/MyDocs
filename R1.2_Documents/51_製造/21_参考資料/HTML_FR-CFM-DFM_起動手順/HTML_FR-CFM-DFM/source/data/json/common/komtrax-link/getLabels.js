var _ = require('lodash');
var yaml = require('yamljs');
var admindir = __dirname + '/../../../label/';

module.exports = function(data) {
  var screenCode = data.query.screen_code;
  var lang = {
    'ja-JP': 'ja',
    'en-US': 'en',
  }[data.header['x-lang']];
  lang = lang || 'ja';

  var adminTargetFile = 'komtrax-link/' + screenCode + '.yml';
  var label = yaml.load(admindir + adminTargetFile);
  var labels = label.labels.map(item => ({
    code: item.name,
    name: item[lang],
  }));

  return {
    status: 200,
    json: {
      result_data: {
        screen_code: screenCode,
        labels: labels,
      },
    },
  };
};
