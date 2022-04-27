var _ = require('lodash');

module.exports = function(body, failureTerm = 'error') {
  var paths = _.flatten(createPaths(body));
  var errorData = paths
    .filter(path => {
      var inputValue = _.get(body, path);
      if (_.isArray(failureTerm)) {
        return _.some(failureTerm, t => inputValue === t);
      } else {
        return inputValue === failureTerm;
      }
    })
    .map(path => ({
      keys: [path],
      message: `{{${path}}}はリクエスト情報が不正です。`,
      code: 'ACOM0002E',
    }));

  return errorData;
};

function createPaths(obj, nestedKey = null) {
  if (_.isArray(obj)) return createArrayPaths(obj, nestedKey);
  if (!_.isObject(obj)) return nestedKey;

  return _.flatten(
    _.map(_.keys(obj), function(key) {
      return createPaths(obj[key], _.join(_.compact([nestedKey, key]), '.'));
    })
  );

  function createArrayPaths(obj, nestedKey) {
    return obj.map(function(elem, index) {
      if (_.isObject(elem)) {
        return _.flatten(createPaths(elem, nestedKey + '[' + index + ']'));
      } else {
        return nestedKey + '[' + index + ']';
      }
    });
  }
}
