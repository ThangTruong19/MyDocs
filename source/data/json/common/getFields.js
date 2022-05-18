var Promise = require("bluebird");
var fail = require("./fail");
var readFile = require("./readFile");
var fs = require("fs");
var _ = require("lodash");

var PATH_BASE = "./data/json/common/field/";
var TEMP_PATH = "./data/json/common/temp/field/";

module.exports = function(data) {
  return new Promise(function(resolve) {
    if (data.query.function_code) {
      var functionCode = data.query.function_code;
      var fieldSetNo = data.query.field_set_no;
      var searchParamaters =
        data.query.search_parameter && data.query.search_parameter.split(",");

      var path =
        PATH_BASE +
        (searchParamaters
          ? `search_paramaters/${functionCode}/${searchParamaters[0]}/${searchParamaters[1]}`
          : "function_code/" + functionCode + "/field_set_no/" + fieldSetNo) +
        ".json";

      readFile(path)
        .then(jsonData => {
          if (fs.existsSync(TEMP_PATH + functionCode+ '/' + fieldSetNo)) {
              var paths = fs
              .readFileSync(TEMP_PATH + functionCode + '/' + fieldSetNo, "utf8")
              .split(",");

            tmpJsonData = _.reduce(
              jsonData,
              (array, json) => {
                // 一時ファイルに含まれている または サロゲートパスの場合
                if (_.includes(paths, json.path) || json.display_code === "0") {
                  array.push(json);
                }

                return array;
              },
              []
            );

            jsonData = tmpJsonData;
          }
          if (/delete|detail|download|represent|map|setting_on|setting_off|version|macro_setting_confirm/.test(functionCode)) {
            setTimeout(() => {
              resolve(
                success(jsonData, data.query.field_set_no, data.query.function_code)
              );
            }, 0);
          } else {
            resolve(
              success(jsonData, data.query.field_set_no, data.query.function_code)
            );
          }
        })
        .catch(errMessage => {
          console.log(errMessage);
          resolve(fail(errMessage));
        });
      return;
    }

    resolve(fail("パラメータが誤っています。"));
  });
};

function success(data, no, function_code) {
  return {
    status: 200,
    json: {
      result_data: {
        function_code: function_code,
        field_sets: [
          {
            no: no,
            label: function_code,
            field_items: data
          }
        ]
      }
    }
  };
}
