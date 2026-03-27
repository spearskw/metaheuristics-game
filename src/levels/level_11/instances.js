/**
 * Instance catalog for Solomon and Gehring & Homberger VRPTW benchmarks.
 * Derives metadata (type, route length, TW density) from filenames.
 */

const SIZES = [100, 400, 1000];

// 100-stop Solomon instances
const SOLOMON_100 = {
  R1: ['r101','r102','r103','r104','r105','r106','r107','r108','r109','r110','r111','r112'],
  R2: ['r201','r202','r203','r204','r205','r206','r207','r208','r209','r210','r211'],
  C1: ['c101','c102','c103','c104','c105','c106','c107','c108','c109'],
  C2: ['c201','c202','c203','c204','c205','c206','c207','c208'],
  RC1: ['rc101','rc102','rc103','rc104','rc105','rc106','rc107','rc108'],
  RC2: ['rc201','rc202','rc203','rc204','rc205','rc206','rc207','rc208'],
};

/**
 * Compute TW density from the geo type (R, C, RC) and variant number.
 *
 * R types have two cycles: variants 1-4 and 5-8 each map to 100/75/50/25%.
 * C and RC types have one cycle: variants 1-4, rest are 100%.
 * Variants 9+ are always 100%.
 */
function getTwDensity(geoType, variant) {
  const cycle = [100, 75, 50, 25];
  if (variant <= 4) return cycle[variant - 1];
  if (geoType === 'R' && variant <= 8) return cycle[variant - 5];
  return 100;
}

function parseGeoType(prefix) {
  // prefix is like R1, C2, RC1 — strip the trailing digit for geo type
  if (prefix.startsWith('RC')) return 'RC';
  if (prefix.startsWith('R')) return 'R';
  return 'C';
}

function buildCatalog() {
  const instances = [];

  // 100-stop Solomon instances
  for (const [setName, files] of Object.entries(SOLOMON_100)) {
    const geoType = parseGeoType(setName);
    const routeNum = parseInt(setName.replace(/^RC|^R|^C/, ''));
    for (const name of files) {
      // Extract variant: last 2 digits for 100-stop, e.g. r101 → 01 → 1
      const variant = parseInt(name.replace(/^rc|^r|^c/, '').slice(1));
      instances.push({
        name: name + '.txt',
        path: `problems/100/${name}.txt`,
        size: 100,
        geoType,
        routeLength: routeNum === 1 ? 'short' : 'long',
        twDensity: getTwDensity(geoType, variant),
      });
    }
  }

  // 400 and 1000-stop Gehring & Homberger instances
  for (const size of [400, 1000]) {
    const sizeCode = size === 400 ? '4' : '10';
    for (const prefix of ['C1', 'C2', 'R1', 'R2', 'RC1', 'RC2']) {
      const geoType = parseGeoType(prefix);
      const routeNum = parseInt(prefix.replace(/^RC|^R|^C/, ''));
      for (let v = 1; v <= 10; v++) {
        const name = `${prefix}_${sizeCode}_${v}.TXT`;
        instances.push({
          name,
          path: `problems/${size}/${name}`,
          size,
          geoType,
          routeLength: routeNum === 1 ? 'short' : 'long',
          twDensity: getTwDensity(geoType, v),
        });
      }
    }
  }

  return instances;
}

export const INSTANCE_CATALOG = buildCatalog();

/**
 * Filter the catalog by the given criteria. Pass null/undefined to skip a filter.
 */
export function filterInstances({ size, geoType, routeLength, twDensity } = {}) {
  return INSTANCE_CATALOG.filter(inst => {
    if (size != null && inst.size !== size) return false;
    if (geoType != null && inst.geoType !== geoType) return false;
    if (routeLength != null && inst.routeLength !== routeLength) return false;
    if (twDensity != null && inst.twDensity !== twDensity) return false;
    return true;
  });
}
