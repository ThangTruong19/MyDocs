const fs = require('fs');

module.exports = function(args) {
  const paths = ['src/assets/settings.js', 'dist/assets/settings.js'];
  const settingsPath = paths.find(path => fs.existsSync(path));

  if (settingsPath == null) {
    return {
      json: {
        error_data: [
          {
            code: 'CCOM0404E',
            message: path,
            keys: [],
          },
        ],
      },
      status: 404,
    };
  }

  const json = JSON.parse(
    fs.readFileSync('data/json/common/getCatalog.json', 'utf8')
  );
  const settings = fs.readFileSync(settingsPath, 'utf8');
  const protocol = settings.match(/protocol:\s*'(.+)'/)[1];
  const hostname = settings.match(/hostname:\s*'(.+)'/)[1];

  json.result_data.user.apis = json.result_data.user.apis.map(function(api) {
    api.url = api.url
      .replace('{protocol}', protocol)
      .replace('{hostname}', hostname);
    return api;
  });

  return {
    json,
    status: 200,
  };
};
