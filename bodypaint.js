'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var ramda = require('ramda');
var facepaint = require('facepaint');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var facepaint__default = /*#__PURE__*/_interopDefaultLegacy(facepaint);

const LEGACY_BREAKPOINTS = {
  XT: 320,
  T: 480,
  XXXS: 600,
  XXS: 736,
  XS: 864,
  S: 900,
  XXM: 1088,
  XM: 1200,
  M: 1300,
  L: 1800,
  XL: 2048,
  XXL: 2560,
  XXXL: 4000
};

const HORIZONTAL_BREAKPOINTS = {
  T0: 320,
  T1: 480,
  S0: 600,
  S1: 736,
  S2: 864,
  S3: 900,
  M0: 976,
  M1: 1088,
  M2: 1200,
  M3: 1300,
  L0: 1800,
  L1: 2048,
  L2: 2560,
  L3: 4000
};
const VERTICAL_BREAKPOINTS = {
  H0: 160,
  H1: 320,
  H2: 480,
  H3: 640,
  H4: 800,
  H5: 960,
  H6: 1120,
  H7: 1280,
  H8: 1440
};
const withUnit = ramda.curry((suffix, o) => ramda.map(z => z + suffix, o));

const asRelativeUnit = ramda.curry((ratio, name, points) =>
  ramda.pipe(ramda.map(ratio), withUnit(name), Object.freeze)(points)
);
const asPx = asRelativeUnit(ramda.identity, "px");
const asRem = ramda.curry((base, points) =>
  asRelativeUnit(z => z / base, "rem")(points)
);

const media = ramda.curry((y, z) => `@media(${y}: ${z})`);
const minWidth = media(`min-width`);
const maxWidth = media(`max-width`);
const maxHeight = media(`max-height`);
const minHeight = media(`min-height`);
const GAP = "%GAP%";
const __ = GAP;

const fillGaps = ramda.curry((points, xxx) =>
  ramda.ifElse(
    Array.isArray,
    ramda.pipe(
      z => {
        const zLength = z.length;
        const totalPoints = ramda.keys(points).length;
        if (zLength >= totalPoints) return z
        return ramda.pipe(
          ramda.range(0),
          ramda.map(() => GAP),
          aa => z.concat(aa)
        )(Math.abs(zLength - totalPoints))
      },
      ramda.reduce((aa, bb) => {
        const cc = bb === GAP ? ramda.last(aa) : bb;
        return aa.concat(cc)
      }, [])
    ),
    ramda.map(fillGaps(points))
  )(xxx)
);

const directionalPaint = ramda.curry((useHeight, useMin, baseFontSize, xxx) =>
  ramda.pipe(
    asRem(baseFontSize),
    ramda.map(
      useHeight
      ? useMin ? minHeight : minWidth
      : useMin ? minWidth : maxWidth
    ),
    ramda.values,
    facepaint__default['default']
  )(xxx)
);

const paint = directionalPaint(false);
const vpaint = directionalPaint(true);

const orderedKeyReduction = ramda.reduce(
  (agg, [kk, vv, doStuff]) =>
    ramda.mergeRight(agg, doStuff ? { [kk]: ramda.pipe(ramda.values)(vv) } : { [kk]: vv }),
  {}
);
const makeBaseFromPattern = ramda.pipe(
  ramda.toPairs,
  ramda.map(([k]) => [k, GAP]),
  ramda.fromPairs
);

const isPatternObject = ramda.curry((pattern, xxx) => {
  const points = ramda.keys(pattern);
  return ramda.pipe(
    ramda.keys,
    ramda.difference(ramda.keys(xxx)),
    ramda.map(ramda.includes(ramda.__, points)),
    ramda.all(z => z)
  )(points)
});

const dropNeedlessGaps = ramda.curry((pattern, list) => {
  if (!Array.isArray(list)) return list
  const copy = [].concat(list);
  let chained = true;
  let terminal = list.length;
  let cur = null;
  let prev = null;
  for (let i = list.length; i > -1; i--) {
    if (!chained) break
    cur = list[i];
    prev = list[i + 1];
    if (cur && prev) {
      if ((prev === GAP && cur !== GAP) || prev !== GAP) {
        chained = false;
        terminal = prev !== GAP ? i + 1 : i;
      }
    }
  }
  return copy.slice(0, terminal + 1)
});

const gaplessPlayback = ramda.curry((pattern, mqInput) => {
  const smashable = makeBaseFromPattern(pattern);
  return ramda.pipe(
    ramda.toPairs,
    ramda.map(([k, v]) => [
      k,
      isPatternObject(pattern, v)
        ? ramda.mergeRight(smashable, v)
        : gaplessPlayback(pattern, v),
      isPatternObject(pattern, v)
    ]),
    orderedKeyReduction,
    ramda.map(dropNeedlessGaps(pattern))
  )(mqInput)
});

const makePainter = ({
  useHeight = false,
  useMin,
  baseFontSize,
  points,
  implicit
}) => {
  const rawPoints = Object.freeze(points);
  const painter = directionalPaint(useHeight, useMin, baseFontSize, rawPoints);
  return ramda.pipe(
    implicit ? gaplessPlayback(rawPoints) : ramda.identity,
    ramda.map(fillGaps(rawPoints)),
    painter
  )
};

const bodypaint = makePainter({
  useHeight: false,
  useMin: true,
  baseFontSize: 16,
  points: HORIZONTAL_BREAKPOINTS,
  implicit: true
});

exports.GAP = GAP;
exports.HORIZONTAL_BREAKPOINTS = HORIZONTAL_BREAKPOINTS;
exports.LEGACY_BREAKPOINTS = LEGACY_BREAKPOINTS;
exports.VERTICAL_BREAKPOINTS = VERTICAL_BREAKPOINTS;
exports.__ = __;
exports.asPx = asPx;
exports.asRelativeUnit = asRelativeUnit;
exports.asRem = asRem;
exports.bodypaint = bodypaint;
exports.directionalPaint = directionalPaint;
exports.fillGaps = fillGaps;
exports.gaplessPlayback = gaplessPlayback;
exports.makePainter = makePainter;
exports.maxHeight = maxHeight;
exports.maxWidth = maxWidth;
exports.minHeight = minHeight;
exports.minWidth = minWidth;
exports.paint = paint;
exports.vpaint = vpaint;
exports.withUnit = withUnit;
