import { curry, map, pipe, identity, ifElse, keys, range, reduce, last, values, mergeRight, toPairs, fromPairs, difference, includes, __ as __$1, all } from 'ramda';
import facepaint from 'facepaint';

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
const withUnit = curry((suffix, o) => map(z => z + suffix, o));

const asRelativeUnit = curry((ratio, name, points) =>
  pipe(map(ratio), withUnit(name), Object.freeze)(points)
);
const asPx = asRelativeUnit(identity, "px");
const asRem = curry((base, points) =>
  asRelativeUnit(z => z / base, "rem")(points)
);

const media = curry((y, z) => `@media(${y}: ${z})`);
const minWidth = media(`min-width`);
const maxWidth = media(`max-width`);
const maxHeight = media(`max-height`);
const minHeight = media(`min-height`);
const GAP = "%GAP%";
const __ = GAP;

const fillGaps = curry((points, xxx) =>
  ifElse(
    Array.isArray,
    pipe(
      z => {
        const zLength = z.length;
        const totalPoints = keys(points).length;
        if (zLength >= totalPoints) return z
        return pipe(
          range(0),
          map(() => GAP),
          aa => z.concat(aa)
        )(Math.abs(zLength - totalPoints))
      },
      reduce((aa, bb) => {
        const cc = bb === GAP ? last(aa) : bb;
        return aa.concat(cc)
      }, [])
    ),
    map(fillGaps(points))
  )(xxx)
);

const directionalPaint = curry((useHeight, useMin, baseFontSize, xxx) =>
  pipe(
    asRem(baseFontSize),
    map(
      useHeight
      ? useMin ? minHeight : minWidth
      : useMin ? minWidth : maxWidth
    ),
    values,
    facepaint
  )(xxx)
);

const paint = directionalPaint(false);
const vpaint = directionalPaint(true);

const orderedKeyReduction = reduce(
  (agg, [kk, vv, doStuff]) =>
    mergeRight(agg, doStuff ? { [kk]: pipe(values)(vv) } : { [kk]: vv }),
  {}
);
const makeBaseFromPattern = pipe(
  toPairs,
  map(([k]) => [k, GAP]),
  fromPairs
);

const isPatternObject = curry((pattern, xxx) => {
  const points = keys(pattern);
  return pipe(
    keys,
    difference(keys(xxx)),
    map(includes(__$1, points)),
    all(z => z)
  )(points)
});

const dropNeedlessGaps = curry((pattern, list) => {
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

const gaplessPlayback = curry((pattern, mqInput) => {
  const smashable = makeBaseFromPattern(pattern);
  return pipe(
    toPairs,
    map(([k, v]) => [
      k,
      isPatternObject(pattern, v)
        ? mergeRight(smashable, v)
        : gaplessPlayback(pattern, v),
      isPatternObject(pattern, v)
    ]),
    orderedKeyReduction,
    map(dropNeedlessGaps(pattern))
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
  return pipe(
    implicit ? gaplessPlayback(rawPoints) : identity,
    map(fillGaps(rawPoints)),
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

export { GAP, HORIZONTAL_BREAKPOINTS, LEGACY_BREAKPOINTS, VERTICAL_BREAKPOINTS, __, asPx, asRelativeUnit, asRem, bodypaint, directionalPaint, fillGaps, gaplessPlayback, makePainter, maxHeight, maxWidth, minHeight, minWidth, paint, vpaint, withUnit };
