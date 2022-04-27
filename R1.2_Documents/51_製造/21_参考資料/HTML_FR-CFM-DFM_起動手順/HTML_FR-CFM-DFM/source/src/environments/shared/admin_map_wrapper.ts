export const adminMapWrapper = {
  GoogleMaps: {
    pluginName: 'GoogleMapPlugin', // MapWrapperに読み込むプラグインクラス名 GoogleMapPlugin,OpenStreetMapPlugin
    pluginscripts: ['./assets/vendor/scripts/maplib/extlib/markerwithlabel.js'],
    clusterpluginscript:
      './assets/vendor/scripts/maplib/extlib/markerclustererplus/markerclusterer_packed.js', // ClusterMarker生成用のライブラリ
    clustericondir:
      './assets/vendor/scripts/maplib/extlib/markerclustererplus/images/',
    pngicondir: './assets/static/img/car-png-icons',
    landmarkicondir: './assets/static/img',
    landmarkretinaicondir: './assets/static/img',
    geocoderPluginName: 'GoogleGeocoder', // Geocoder用プラグインクラス名 GoogleGeocoder,NominatimGeocoder
  },
  OpenStreetMap: {
    pluginName: 'OpenStreetMapPlugin',
    apiurl: './assets/vendor/scripts/maplib/extlib/leaflet/leaflet.js',
    apicss: './assets/vendor/scripts/maplib/extlib/leaflet/leaflet.css',
    pluginscripts: [
      './assets/vendor/scripts/maplib/extlib/L.Control.Zoomslider.js',
      './assets/vendor/scripts/maplib/extlib/leaflet-routing-machine.min.js',
      './assets/vendor/scripts/maplib/extlib/leaflet.draw.js',
      './assets/vendor/scripts/maplib/extlib/Leaflet.draw.drag.js',
    ],
    plugincss: [
      './assets/vendor/scripts/maplib/extlib/mapwrapper.css',
      './assets/vendor/scripts/maplib/extlib/L.Control.Zoomslider.css',
      './assets/vendor/scripts/maplib/extlib/leaflet-routing-machine.css',
      './assets/vendor/scripts/maplib/extlib/leaflet.draw.css',
    ],
    clusterpluginscript:
      './assets/vendor/scripts/maplib/extlib/PruneCluster.min.js',
    clusterplugincss:
      './assets/vendor/scripts/maplib/extlib/LeafletStyleSheet.css',
    pngicondir: './assets/static/img/car-png-icons',
    landmarkicondir: './assets/static/img',
    landmarkretinaicondir: './assets/static/img',
    geocoderPluginName: 'NominatimGeocoder',
  },
  OpenStreetMapNoGeoCoder: {
    pluginName: 'OpenStreetMapPlugin',
    apiurl: './assets/vendor/scripts/maplib/extlib/leaflet/leaflet.js',
    apicss: './assets/vendor/scripts/maplib/extlib/leaflet/leaflet.css',
    pluginscripts: [
      './assets/vendor/scripts/maplib/extlib/L.Control.Zoomslider.js',
      './assets/vendor/scripts/maplib/extlib/leaflet-routing-machine.min.js',
      './assets/vendor/scripts/maplib/extlib/leaflet.draw.js',
      './assets/vendor/scripts/maplib/extlib/Leaflet.draw.drag.js',
    ],
    plugincss: [
      './assets/vendor/scripts/maplib/extlib/mapwrapper.css',
      './assets/vendor/scripts/maplib/extlib/L.Control.Zoomslider.css',
      './assets/vendor/scripts/maplib/extlib/leaflet-routing-machine.css',
      './assets/vendor/scripts/maplib/extlib/leaflet.draw.css',
    ],
    clusterpluginscript:
      './assets/vendor/scripts/maplib/extlib/PruneCluster.min.js',
    clusterplugincss:
      './assets/vendor/scripts/maplib/extlib/LeafletStyleSheet.css',
    pngicondir: './assets/static/img/car-png-icons',
    landmarkicondir: './assets/static/img',
    landmarkretinaicondir: './assets/static/img',
  },
};
