var _ = require('lodash');

module.exports = function pickAvailableResponse(
  response,
  inclusionKeys,
  keys = '',
  isArray
) {
  if (_.isEmpty(inclusionKeys)) {
    return response;
  }

  const iKeys = _.isArray(inclusionKeys)
    ? inclusionKeys
    : inclusionKeys.split(',');

  return _pickAvailableResponse(response, iKeys, keys, isArray);
};

function _pickAvailableResponse(response, inclusionKeys, keys = '', isArray) {
  const initValue = _.isArray(response) ? [] : {};
  // ファイルアップロード：パラメータとして FormData が渡された場合そのまま通す
  if (Object.prototype.toString.call(response) === '[object FormData]') {
    return response;
  }

  return _.reduce(
    response,
    (obj, value, key) => {
      // キーが添え字でない場合
      if (!_.isNumber(key)) {
        keys += _.isEmpty(keys) ? key : `.${key}`;
      }

      if (_.some(inclusionKeys, k => matchKey(k, keys))) {
        obj[key] = value;
      } else {
        // Array以外のObjectの場合
        if (_.isPlainObject(value)) {
          var result = _pickAvailableResponse(value, inclusionKeys, keys);
          if (!_.isEmpty(result)) {
            obj[key] = result;
          }
        } else if (_.isArray(value)) {
          obj[key] = _.compact(
            _pickAvailableResponse(value, inclusionKeys, keys, true)
          );
        }
      }

      if (!isArray) {
        // 除外パラメタのキー比較用のキーより「.」の最後の要素を取り除く
        // 例. id_keys.current_operator.code => id_keys.current_operator
        keys = _.chain(keys)
          .split('.')
          .dropRight()
          .join('.')
          .value();
      }

      return obj;
    },
    initValue
  );
}

function matchKey(k, keys) {
  return k === keys;
}
