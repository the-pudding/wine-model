// Used in two objects below, hence declared out here.
const baseStops = {
  stop0: '#4D4054',
  stop1: '#040509',
};

export default {
  // General.
  width: null,
  height: null,
  tabletUp: 800,
  transform: {
    shape: null,
    scape: null,
    bottle: null,
    // all the animal transforms
    // are being added in `update`
    dataset: null,
  },
  ctx: {
    scape: null,
    glassBottle: null,
    bottleText: null,
    bottleWave: null,
    chart: null,
    blackBox: null,
    globe: null,
  },
  rough: {
    chart: null,
    globe: null,
    wave: null,
  },
  // Tweens.
  tween: {
    wineScape: null,
    glassBottle: null,
    bottleText: null,
    bottleWave: null,
    lolliChart: null,
    lolliUpdate1: null,
    lolliUpdate2: null,
    lolliUpdate3: null,
    // blackbox/arrow tweens are being added in tween func.
    blackBox: null,
    cleanup: null,
    bottleEmpty: null,
    bottleTextOut: null,
    // animal tweens are being added in tween func.
    bottleFill: null,
    // bottle colour tweens are being added in tween func.
    bottleGrid: null,
    bottleGridColour: null,
    bottleGridSort: null,
    bottleGridOut: null,
    // dataset tweens are being added in tween func.
    globe: null,
    importance: null,
    importanceRemove: null,
    modelBottleIn: null,
    modelBottleOut: null,
    modelWaveInit: null,
  },
  scape: {
    image: null,
    alpha: null,
    alphaTarget: 0.2,
  },
  glassBottle: {
    bottleBox: null,
    bottleTop: null, // % of bottle's top position
    bottleLeft: null, // % of bottle's top position
    path: null,
    colour: null,
    alpha: 0,
  },
  bottleText: {
    paths: null,
    maxLength: null,
    dashOffset: null,
    colour: null,
  },
  bottleColour: {
    base: { ...baseStops },
    good: {
      // stop0: '#88BFF2',
      // stop1: '#4D8ECA',
      stop0: '#98A5DA',
      stop1: '#5566aa',
      // dot: '#5566aa', // ezplan blue
      dot: '#1773C9', // original
    },
    bad: {
      stop0: '#CE6A8C',
      stop1: '#993355', // vinoez bordeaux
      // dot: '#E5A0BF', // original
      dot: 'rgba(229, 160, 191, 0.7)', // original light
      // dot: 'rgba(153, 51, 85, 0.4)', // transparent stop1
    },
  },
  bottleWave: {
    bottlePath: null,
    wavePoints: null,
    lift: null,
    liftTarget: null,
    r: null,
    n: 20,
    xWaveScale: null,
    waveLine: null,
    waveAlpha: null,
  },
  lolli: {
    data: null,
    values: null,
    radiusTarget: null,
    area: null,
    x: null,
    y: null,
  },
  blackBox: {
    box: null,
    boxDims: null,
    model: null,
    xOffset: null,
  },
  animals: {
    data: null,
    // box info for each animal added in `init`.
  },
  bottleGrid: {
    baseData: null,
    dataOrigin: null,
    dataTarget: null,
    dataSorted: null,
    dataOut: null,
    colour: {
      // initially base colours.
      good: { ...baseStops },
      bad: { ...baseStops },
    },
  },
  dataset: {
    info: null,
    box: null,
    // all the column path data
    // are being added in `init`
  },
  globe: {
    data: null,
    scroll: {
      progress: null,
      direction: null,
    },
  },
  stats: {
    data: null,
    links: null,
    current: [],
    alpha: { value: 1 },
    colourDots: false,
    lr: false, // linear regression
    progress: {
      draw: 0,
      extend: 0,
      point: 0,
      logistic: 0,
    },
    pointTickInfo: null,
  },
  varImp: {
    data: null,
  },
  model: {
    intercept: null,
    weights: null,
    values: null,
    ranges: null,
    probability: 0,
  },
  modelBottle: {
    paths: null,
    maxLength: null,
    dashOffset: null,
    alpha: 0,
    points: false,
    info: [''],
    infoColour: '#777',
  },
  modelWave: {
    alpha: 0,
  },
};
