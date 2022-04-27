// standard module
var http = require('http');
var path = require('path');
var fs = require('fs');
var os = require('os');

// npm module
var gulp = require('gulp');
var options = require('gulp-options');
var connect = require('connect');
var cors = require('cors');
var bodyParser = require('body-parser');
var apimock = require('apimock-middleware');
var through2 = require('through2');
var yamljs = require('yamljs');
var $ = require('gulp-load-plugins')();
var _ = require('lodash');
var merge = require('event-stream').merge;
var execSync = require('child_process').execSync;

// settings
var docroot = path.resolve(__dirname, 'src');
var destDir = path.join(docroot, 'assets/vendor');
var srcDir = path.resolve(__dirname, 'vendor/bower');

/**
 * private functions
 */
function startServer(fn) {
  'use strict';

  var app = connect()
    .use(function (req, res, next) {
      res.setHeader('Cache-Control', 'no-cache');
      next();
    })
    .use(bodyParser.urlencoded({ extended: false }))
    .use(bodyParser.json({ limit: '10mb' }))
    .use(cors({ exposedHeaders: ['X-From, X-Count, X-TotalCount, X-Sort', 'Content-Disposition', 'Cache-Control'] }));

  var server = http.createServer(app);

  if (options.has('opa')) {
    var server = http.createServer(app.use(apimock('data/apimock.opa.yml')));
    server.listen(4201, function () {
      console.log('OPA Api mock server is listening on port 4201');
    });
  } else if (options.has('komtrax-link')) {
    var server = http.createServer(app.use(apimock('data/apimock.komtrax-link.yml')));
    server.listen(4201, function () {
      console.log('KOMTRAX-LINK Api mock server is listening on port 4201');
    });
  } else {
    var server = http.createServer(app.use(apimock('data/apimock.yml')));

    server.listen(4201, function () {
      console.log('FLM Api mock server is listening on port 4201');
    });
  }
}

function yaml() {
  return through2.obj(function (file, enc, fn) {
    file.yaml = yamljs.parse(file.contents.toString());
    this.push(file);
    fn();
  });
}

function preBuild() {
  const temp = fs.readFileSync("src/assets/settings.js", "utf8");
  const example = fs.readFileSync("src/assets/settings.example.js", "utf8");
  fs.writeFileSync("src/assets/settings.temp.js", temp, "utf8");
  fs.writeFileSync("src/assets/settings.js", example, "utf8");
}

function postBuild() {
  const temp = fs.readFileSync("src/assets/settings.temp.js", "utf8");
  const example = fs.readFileSync("src/assets/settings.js", "utf8");
  fs.unlinkSync("src/assets/settings.temp.js");
  fs.writeFileSync("src/assets/settings.js", temp, "utf8");
  fs.writeFileSync("src/assets/settings.example.js", example, "utf8");
}

function loadDeploySettings() {
  return JSON.parse(fs.readFileSync('deploy.json', 'utf8'));
}

function getAppVersion() {
  const settings = fs.readFileSync('src/assets/settings.js', 'utf8');
  const [, version] = settings.match(/window\.appVersion = '(.+)'/);
  return version;
}

function downloadSource(github, baseBranch, vstsDir) {
  const commoand = `cd ${vstsDir} && rm -rf source && mkdir source && cd source && \
    curl -H 'Authorization: token ${github.token}' \
    -L ${github.apiBaseUrl}/repos/${github.owner}/${github.repo}/tarball/${baseBranch} | tar xz --strip=1`
  execSync(commoand);
}

function build(appName) {
  return new Promise(function (resolve) {
    const deploySettings = loadDeploySettings();
    const {
      github,
      app
    } = deploySettings;
    const {
      vsts,
      buildTargts,
      cli,
      baseBranch,
    } = app[appName];

    preBuild();

    const appVersion = getAppVersion();

    execSync(`cp ${cli} angular.json`);
    try {
      execSync(
        `cd ${vsts.dir} &&
        git fetch ${vsts.remote} &&
        git checkout ${vsts.remote}/${vsts.baseBranch}
        git checkout -b Feature/${appVersion}`
      );
    } catch (e) {
      execSync(
        `cd ${vsts.dir} &&
        git checkout Feature/${appVersion}`
      );
    }

    if (appName !== 'opa') {
      buildTargts.forEach(function (target) {
        execSync(`ng build --prod --base-href=${target.baseHref} --rebase-root-relative-css-urls`);
        execSync(`cp -r dist/ ${path.join(vsts.dir, target.distPath)}`);
      });
    } else {
      buildTargts.forEach(function (target) {
        execSync(`node --max_old_space_size=8192 ./node_modules/@angular/cli/bin/ng build --prod --base-href=${target.baseHref} --rebase-root-relative-css-urls`);
        execSync(`cp -r dist/ ${path.join(vsts.dir, target.distPath)}`);
      });
    }
    postBuild();
    downloadSource(github, baseBranch, vsts.dir);
    resolve();
  });
}

function setupBuild(appName) {
  return new Promise(function (resolve) {
    const deploySettings = loadDeploySettings();
    const {
      remote,
      app
    } = deploySettings;
    const {
      baseBranch,
    } = app[appName];

    execSync(`git fetch ${remote}`);
    execSync(`git checkout ${remote}/${baseBranch}`);
    execSync('bower install');
    execSync('npm clean-install');

    resolve();
  });
}

function setEnvironment(app, setting) {
  execSync(`copy .angular-cli_${app}.json angular.json`);
  execSync(`copy src\\assets\\settings.${setting}.js src\\assets\\settings.js`);

  if (process.argv.includes('--replace-api-host') || process.argv.includes('-h') && setting === 'local') {
    var addr = getLocalIppAddr();
    var settingsPath = `src\\assets\\settings.js`;
    var settings = fs.readFileSync(settingsPath, 'utf8');
    fs.writeFileSync(settingsPath, settings.replace(/hostname:\s*'[\w\d\.]+:4201'/, `hostname: '${addr}:4201'`));
  }
}

function getLocalIppAddr() {
  var ifaces = os.networkInterfaces();
  var addr = null;

  Object.keys(ifaces).forEach(function (ifname) {
    ifaces[ifname].forEach(function (iface) {
      if (iface.family !== 'IPv4' || iface.internal || !/^172\.19\.2/.test(iface.address)) {
        // ipv6, 172.0.0.1, 有線のみ
        return;
      }

      addr = iface.address;
    });
  });

  return addr;
}

// tasks
gulp.task('scripts:maplibrary', function () {
  return merge(
    gulp.src([
      srcDir + '/PruneCluster/dist/PruneCluster.min.js',
      srcDir + '/PruneCluster/dist/LeafletStyleSheet.css',
      srcDir + '/leaflet-routing-machine/dist/**/*.*',
      srcDir + '/Leaflet.zoomslider/src/L.Control.Zoomslider.css',
      srcDir + '/Leaflet.zoomslider/src/L.Control.Zoomslider.js',
      srcDir + '/leaflet.draw/dist/leaflet.draw.js',
      srcDir + '/leaflet.draw/dist/leaflet.draw.css',
      srcDir + '/leaflet.draw.drag/dist/Leaflet.draw.drag.js',
      'vendor/komtrax-map/dist/style/mapwrapper.css',
      srcDir + '/v3-utility-library/markerwithlabel/src/markerwithlabel.js'
    ])
      .pipe(gulp.dest(destDir + '/scripts/maplib/extlib/'))
      .pipe(gulp.dest(destDir + '/admin/scripts/maplib/extlib/')),

    gulp.src([
      srcDir + '/v3-utility-library/markerclustererplus/src/markerclusterer_packed.js',
    ])
      .pipe(gulp.dest(destDir + '/scripts/maplib/extlib/markerclustererplus/')),

    gulp.src([
      srcDir + '/v3-utility-library/markerclustererplus/images/**/*.*'
    ])
      .pipe(gulp.dest(destDir + '/scripts/maplib/extlib/markerclustererplus/images')),

    gulp.src([
      srcDir + '/leaflet/dist/leaflet.js',
      srcDir + '/leaflet/dist/leaflet.css',
      srcDir + '/leaflet/dist/images/**/*.*'
    ], { base: "vendor/bower/leaflet/dist/" }
    )
      .pipe(gulp.dest(destDir + '/scripts/maplib/extlib/leaflet'))
      .pipe(gulp.dest(destDir + '/admin/scripts/maplib/extlib/leaflet')),

    gulp.src([
      srcDir + '/markerwithlabel/markerwithlabel.js'
    ], { base: "vendor/bower/markerwithlabel/" }
    )
      .pipe(gulp.dest(destDir + '/scripts/maplib/extlib/markerwithlabel'))
      .pipe(gulp.dest(destDir + '/admin/scripts/maplib/extlib/markerwithlabel')),

    gulp.src([
      srcDir + '/markerclustererplus/src/markerclusterer_packed.js',
      srcDir + '/markerclustererplus/images/**/*.*',
    ], { base: "vendor/bower/markerclustererplus/" }
    )
      .pipe(gulp.dest(destDir + '/scripts/maplib/extlib/markerclustererplus'))
      .pipe(gulp.dest(destDir + '/admin/scripts/maplib/extlib/markerclustererplus'))
  );
});

gulp.task('scripts:jquery', function () {
  return gulp.src([srcDir + '/jquery/dist/jquery.min.js'])
    .pipe(gulp.dest(destDir));
});

gulp.task('server:mock', function (cb) {
  startServer(cb);
});

gulp.task('prebuild', function () {
  preBuild();
});

gulp.task('postbuild', function () {
  postBuild();
});

gulp.task('build:setup:cdsm', function () {
  return setupBuild('cdsm');
});

gulp.task('default', [
  'server:mock'
]);

gulp.task('build:cdsm', ['build:setup:cdsm', 'scripts:maplibrary', 'scripts:jquery'], function () {
  return build('cdsm');
});

gulp.task('env:local:cdsm', function () {
  return setEnvironment('cdsm', 'local');
});

gulp.task('env:cdsm', function () {
  return setEnvironment('cdsm', '');
});
