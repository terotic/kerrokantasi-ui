import addProj4Leaflet from '../utils/byol-proj4leaflet';

export function EPSG3067() { // eslint-disable-line
  const L = require('leaflet'); // eslint-disable-line
  const proj4 = require('proj4');
  addProj4Leaflet(L, proj4);
  const crsName = 'EPSG:3067';
  const projDef = '+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
  const bounds = L.bounds(L.point(-548576, 6291456), L.point(1548576, 8388608));
  const originNw = [bounds.min.x, bounds.max.y];
  const crsOpts = {
    resolutions: [8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5, 0.25, 0.125],
    bounds,
    transformation: new L.Transformation(1, -originNw[0], -1, originNw[1])
  };
  return new L.Proj.CRS(crsName, projDef, crsOpts);
}
