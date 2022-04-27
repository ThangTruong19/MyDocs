var moment = require('moment');
var fs = require('fs');
var timeout;

module.exports = function(args) {
  var tempPath = './data/json/common/temp/async';
  var downloadable = fs.existsSync(tempPath);

  if (!downloadable && Math.random() < 0.5) {
    fs.writeFileSync(tempPath, '');
    downloadable = true;
    timeout = setTimeout(function() {
      fs.unlinkSync(tempPath);
    }, 100);
  }

  if (downloadable) {
    return success(args.header.accept);
  }
  return pending(args.header.accept);
};

function success(contentType) {
  var path, fileName;

  switch (contentType) {
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      path = './data/json/common/downloads/sample.xlsx';
      fileName = 'sample.xlsx';
      break;

    case 'text/comma-separated-values':
      path = './data/json/common/downloads/sample.csv';
      fileName = 'sample.csv';
      break;
  }

  var file = fs.readFileSync(path);
  return {
    status: 200,
    header: {
      'Content-Type': contentType,
      'Content-Disposition': 'attachment; filename=' + fileName,
    },
    body: file,
  };
}

function pending(contentType) {
  return {
    status: 202,
    json: {
      result_data: {
        content_type: contentType,
        id: '0',
        name: '〇〇ファイル作成',
        request_datetime: '2000/01/01 00:00:00',
        complete_datetime: '2000/01/01 00:00:00',
        request_api_id: 'KOM-00100010',
        result_api_id: 'KOM-00000011',
        status_code: '0',
        status_name: '受付',
      },
    },
  };
}

function fail(msg) {
  return {
    status: 500,
    json: {
      error_data: [
        {
          code: 'ERR0001',
          message: msg,
          key: '???',
        },
      ],
    },
  };
}
