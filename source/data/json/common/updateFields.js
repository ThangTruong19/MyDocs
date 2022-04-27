var fail = require('./fail');
var fs = require('fs');

var TEMP_PATH = './data/json/common/temp/field/';

module.exports = function(args) {
  if (
    args.body.function_code &&
    args.body.field_set &&
    args.body.field_set.field_items
  ) {
    var paths = args.body.field_set.field_items.map(function(item) {
      return item.path;
    });

    const tempSplit = TEMP_PATH.split('/');
    const tempArray = tempSplit.reduce((temp, current) => {
      const last = temp[temp.length - 1];

      temp.push(last ? last + '/' + current : current);
      return temp;
    }, [])

    tempArray.forEach((p) => {
      if (!fs.existsSync(p)) {
        fs.mkdirSync(p);
      }
    })

    fs.writeFileSync(
      TEMP_PATH + '/' + args.body.function_code,
      paths.join(',')
    );
    return success();
  }

  return fail('パラメータが誤っています。');
};

function success() {
  return {
    status: 204,
  };
}
