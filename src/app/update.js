/* eslint-disable no-return-assign */
/* eslint-disable import/no-duplicates */
/* eslint-disable no-param-reassign */

// External.
import { gsap } from 'gsap/all';
import { ScrollTrigger } from 'gsap/src/ScrollTrigger';
import { CustomWiggle } from 'gsap/src/CustomWiggle';
import { CustomEase } from 'gsap/src/CustomEase';
import { timeout } from 'd3-timer';
import cloneDeep from 'lodash.clonedeep';
import rough from 'roughjs/bundled/rough.esm';

// Internal.
import state from './state';
import { clear, getTransform, isMobile, resizeCanvas } from './utils';
import setupLolliSlider from '../lollislider/lollislider';
import buildModelControls from '../model/buildModel';

// Tweens
import tweenBottleWave, { startWave, stopWave } from '../tweens/bottleWave';
import tweenWineScape from '../tweens/wineScape';
import tweenGlassBottle from '../tweens/glassBottle';
import tweenBottleText from '../tweens/bottleText';
import tweenLolliChart from '../tweens/lolliChart';
import tweenBlackBox, { arrows } from '../tweens/blackBox';
import tweenCleanup from '../tweens/cleanup';
import tweenBottleEmpty from '../tweens/bottleEmpty';
import tweenBottleTextOut from '../tweens/bottleTextOut';
import tweenAnimals, { animalPaths } from '../tweens/animals';
import tweenBottleFill from '../tweens/bottleFill';
import tweenBottleColour, { bottleColours } from '../tweens/bottleColour';
import tweenBottleGrid from '../tweens/bottleGrid';
import tweenBottleGridColour from '../tweens/bottleGridColour';
import tweenBottleGridSort from '../tweens/bottleGridSort';
import tweenBottleGridOut from '../tweens/bottleGridOut';
import tweenDataset from '../tweens/dataset';
import tweenGlobe from '../tweens/globe';
import tweenStats, { renderStats, tweenStatsAlpha, sim } from '../tweens/stats';
import {
  simulateGlobePosition,
  simulateLattice,
  simulateAlcohol,
  simulateDensity,
  simulateFixed,
  simulatePh,
  simulateVolatile,
  simulateQuality,
} from '../tweens/statsFrequencies';
import {
  simulateQualAlc,
  simulateQualVol,
  simulateQualBinAlc,
  simulateRemove,
} from '../tweens/statsScatter';
import tweenImportance from '../tweens/importance';
import tweenModelBottle from '../tweens/modelBottle';
import {
  updateModelWave,
  stopModelWave,
  checkModelWave,
} from '../tweens/modelWaveInit';
import { stopWaveMarkers } from '../tweens/modelWaveMarker';

import { renderLolliChart } from '../tweens/lolliChart';

gsap.registerPlugin(CustomEase, CustomWiggle);

// Helpers.
function getTriggerPositions() {
  const visual = document.querySelector('#visual-container');
  const visualHeight = parseInt(window.getComputedStyle(visual).height, 10);
  const windowHeight = window.innerHeight;
  const textHeight = windowHeight - visualHeight;

  if (!isMobile()) {
    return {
      start: 'top center',
      end: 'center center',
      endElement: 'center',
      endContainer: 'center',
    };
  }
  // If we're on mobile.
  const offset = visualHeight + textHeight / 2;
  return {
    start: `top top+=${offset}px`,
    end: `center top+=${offset}px`,
    endElement: 'center',
    endContainer: `top+=${offset}px`,
  };
}

function lerp(a, b, t) {
  return a * (1 - t) + b * t;
}

// Set ScrollTrigger defaults.
ScrollTrigger.defaults({
  scroller: '#container',
  start: 'top center',
  end: 'center center',
  scrub: true,
  toggleActions: 'play none none reverse',
  markers: false,
});

CustomWiggle.create('sliderWiggle', { wiggles: 4 });

function updateDimensions() {
  const container = document.querySelector('#canvas-main-container');
  state.width = container.clientWidth;
  state.height = container.clientHeight;
}

// Get contexts and rezize canvases.
function updateContexts(names) {
  const canvases = document.querySelectorAll('canvas');
  names.forEach((name, i) => {
    state.ctx[name] = canvases[i].getContext('2d');
    resizeCanvas(canvases[i], state.width, state.height);
  });
}

function setRoughCanvases() {
  state.rough.chart = rough.canvas(state.ctx.chart.canvas);
  state.rough.globe = rough.canvas(state.ctx.globe.canvas);
}

// Set off canvas factory.
function setVisualStructure() {
  // Get contexts.
  const contextnames = [
    'scape',
    'glassBottle',
    'bottleText',
    'bottleWave',
    'chart',
    'blackBox',
    'globe',
  ];

  updateContexts(contextnames);
  setRoughCanvases();
}

function updateTransforms() {
  // Update all necessary transforms.

  // Update winescape image (and glass) transform.
  const scapeDim = {
    width: state.scape.image.width,
    height: state.scape.image.height,
  };
  state.transform.scape = getTransform(scapeDim, {
    width: 1,
    height: 0,
  });
  state.transform.shape = cloneDeep(state.transform.scape);

  // There's no mathemtacial connection between the bottle's
  // ideal height and the aspect ratio, but using the ar
  // fits quite nicely in this case.
  const sizeFactor = isMobile() ? 135 : 100;
  state.glassBottle.bottleTop = Math.min(
    Math.floor((state.width / state.height) * 100) / sizeFactor,
    0.8
  );
  state.glassBottle.bottleLeft = 0.25;
  state.transform.bottle = getTransform(
    state.glassBottle.bottleBox,
    { width: 0, height: state.glassBottle.bottleTop },
    { x: state.glassBottle.bottleLeft, height: null }
  );

  // Animals.
  // Get a transform for each animal based on its getBBox dimensions.
  state.animals.data.forEach(animal => {
    state.transform[animal.name] = getTransform(
      state.animals[animal.name],
      animal.fit
    );
  });

  // Update the dataset transform.
  state.transform.dataset = getTransform(state.dataset.box, {
    width: 0.9,
    height: 0,
  });
}

// Scroll helper.
function clearAllContexts() {
  // Stop all potentially moving parts.
  stopWave();
  stopModelWave();
  stopWaveMarkers();
  sim.stop();
  // Clear all contexts with an additional timeout
  // to make sure all above things have been stopped.
  timeout(() => {
    Object.entries(state.ctx).forEach(d => clear(d[1]));
  }, 50);
}

// Set scroll.
function setScrollBase() {
  const { start, end, endContainer } = getTriggerPositions();

  ScrollTrigger.create({
    trigger: '.section-0',
    start,
    id: 'triggerPositionRefresh',
    onEnter() {
      // The scroll trigger positions need to be calculated when all content
      // has loaded. Giving the first trigger no other job than refreshing
      // the scroll trigger positions seems the best way to guarantee this.
      ScrollTrigger.refresh();
    },
  });

  ScrollTrigger.create({
    animation: state.tween.wineScape,
    trigger: '.section-1',
    start,
    end,
    id: 'wineScape',
    onLeaveBack() {
      // Stop all and clear all contexts if users scroll up to top.
      timeout(clearAllContexts, 50);
    },
  });

  ScrollTrigger.create({
    animation: state.tween.glassBottle,
    trigger: '.section-2',
    start,
    end,
    id: 'glassBottle',
  });

  ScrollTrigger.create({
    animation: state.tween.bottleText,
    trigger: '.section-3',
    start,
    end,
    id: 'bottleText',
  });

  ScrollTrigger.create({
    animation: state.tween.bottleWave,
    trigger: '.section-4',
    start,
    end,
    id: 'bottleWave',
  });

  ScrollTrigger.create({
    trigger: '#slider-tool',
    start: 'top 75%',
    onEnter() {
      gsap.to('#slider-alcohol', {
        duration: 0.5,
        scale: 1.1,
        x: 10,
        ease: 'sliderWiggle',
      });
      gsap.to('#slider-acids', {
        duration: 0.5,
        delay: 0.1,
        scale: 1.1,
        x: 10,
        ease: 'sliderWiggle',
      });
      gsap.to('#slider-sugars', {
        duration: 0.5,
        delay: 0.2,
        scale: 1.1,
        x: 10,
        ease: 'sliderWiggle',
      });
    },
  });

  ScrollTrigger.create({
    // The initial transition is done via tween...
    animation: state.tween.lolliChart,
    trigger: '.section-5',
    start,
    end,
    id: 'lolliChart',
  });

  ScrollTrigger.create({
    // ...all others lolli transitions are done manually to have
    // better access to the possibly changed  slider values.
    trigger: '.section-6',
    start,
    end,
    id: 'lolliUpdate1',
    onUpdate({ progress }) {
      // Lines.
      state.lolli.keys.forEach(d => {
        const a = state.lolli.data[d].values[1];
        const b = state.lolli.data[d].values[2];
        const current = lerp(a, b, progress);

        state.lolli.data[d].value = current;
      });
      renderLolliChart();
    },
  });

  // trigger bottom for the 2nd lolli update a little different.
  ScrollTrigger.create({
    trigger: '.section-7',
    start,
    end: 'center bottom',
    id: 'lolliUpdate2',
    onUpdate({ progress }) {
      // Lines.
      state.lolli.keys.forEach(d => {
        const a = state.lolli.data[d].values[2];
        const b = state.lolli.data[d].values[3];
        const current = lerp(a, b, progress);

        state.lolli.data[d].value = current;
      });
      renderLolliChart();
    },
  });

  ScrollTrigger.create({
    trigger: '.section-8',
    start,
    end,
    id: 'lolliUpdate3',
    onUpdate({ progress }) {
      // Circle radius.
      const startRadius = state.lolli.radiusTarget;
      const endRadius = 0;
      const currentRadius = lerp(startRadius, endRadius, progress);

      // Lines.
      state.lolli.keys.forEach(d => {
        const startValue = state.lolli.data[d].values[3];
        const endValue = state.lolli.data[d].values[4];
        const currentValue = lerp(startValue, endValue, progress);

        state.lolli.data[d].value = currentValue;
        state.lolli.data[d].radius = currentRadius;
      });

      // Quality text.
      const { quality } = state.lolli.data;
      const startOffset = 0;
      const endOffset = quality.text.length;
      const currentOffset = lerp(startOffset, endOffset, progress);
      quality.text.offset = currentOffset;

      renderLolliChart();
    },
    onEnterBack() {
      clear(state.ctx.blackBox);
    },
  });

  // 2 items.
  arrows.forEach((d, i) => {
    ScrollTrigger.create({
      animation: state.tween[d],
      trigger: `.section-${9 + i}`,
      start,
      end,
      id: d,
    });
  });

  ScrollTrigger.create({
    animation: state.tween.cleanup,
    trigger: '.section-11',
    start,
    end,
    id: 'cleanup',
  });

  ScrollTrigger.create({
    animation: state.tween.bottleTextOut,
    trigger: '.section-12',
    start,
    end,
    id: 'bottleTextOut',
  });

  ScrollTrigger.create({
    animation: state.tween.bottleEmpty,
    trigger: '.section-13',
    start,
    end,
    id: 'bottleEmpty',
    onLeave() {
      stopWave();
      clear(state.ctx.bottleWave);
      clear(state.ctx.blackBox); // extra clean for Safari.
    },
    onEnterBack: startWave,
  });

  // Setting up all the scrolltriggers for the animals.
  // 8 items.
  for (let i = 0; i < animalPaths.length - 1; i++) {
    const animal = animalPaths[i];
    ScrollTrigger.create({
      animation: state.tween[animal.name],
      trigger: `.section-${14 + i}`,
      start,
      end,
      id: animal.name,
    });
  }

  ScrollTrigger.create({
    animation: state.tween.bottleFill,
    trigger: '.section-22',
    start,
    end,
    id: 'bottleFill',
    onLeave: stopWave,
    onEnterBack: startWave,
  });

  // 3 items.
  bottleColours.forEach((d, i) => {
    ScrollTrigger.create({
      animation: state.tween[d.name],
      trigger: `.section-${23 + i}`,
      start,
      end,
      id: d.name,
    });
  });

  ScrollTrigger.create({
    animation: state.tween.bottleGrid,
    trigger: '.section-26',
    start,
    end: `bottom-=10% ${endContainer}`, // the grids need seom more space..
    id: 'bottleGrid',
  });

  ScrollTrigger.create({
    animation: state.tween.bottleGridColour,
    trigger: '.section-27',
    start,
    end,
    id: 'bottleGridColour',
  });

  ScrollTrigger.create({
    animation: state.tween.bottleGridSort,
    trigger: '.section-28',
    start,
    end: `bottom-=10% ${endContainer}`,
    id: 'bottleGridSort',
  });

  ScrollTrigger.create({
    animation: state.tween.bottleGridOut,
    trigger: '.section-29',
    start,
    end: `bottom-=10% ${endContainer}`,
    id: 'bottleGridOut',
    // Shut the glassBottle context up.
    onEnterBack() {
      state.glassBottle.alpha = 0;
      clear(state.ctx.glassBottle);
    },
  });

  // Setting up all the scrolltriggers for the dataset.
  // We set up a scrolltrigger/tween for each column and the grid.
  // 13 items.
  state.dataset.info.forEach((d, i) => {
    ScrollTrigger.create({
      animation: state.tween[d.tween],
      trigger: `.section-${30 + i}`,
      start,
      end,
      id: d.tween,
      onEnter: () => (state.glassBottle.alpha = 1),
      onEnterBack: () => (state.glassBottle.alpha = 1),
    });
  });

  ScrollTrigger.create({
    animation: state.tween.globe,
    trigger: '.section-43',
    start,
    end: 'bottom+=10% center', // the globe needs some extra screen time 🥂
    id: 'globe',
    onEnter() {
      // Shut the glassBottle context up.
      state.glassBottle.alpha = 0;
      clear(state.ctx.glassBottle);
    },
    onUpdate: self => (state.globe.scroll.progress = self.progress),
  });

  ScrollTrigger.create({
    trigger: '.section-44',
    start,
    end,
    id: 'statsLattice',
    onLeaveBack: simulateGlobePosition,
    onEnter: simulateLattice,
  });

  ScrollTrigger.create({
    trigger: '.section-45',
    start,
    end,
    id: 'statsAlcohol',
    onLeaveBack: simulateLattice,
    onEnter: simulateAlcohol,
  });

  ScrollTrigger.create({
    trigger: '.section-46',
    start,
    end,
    id: 'statsDensity',
    onLeaveBack: simulateAlcohol,
    onEnter: simulateDensity,
  });

  ScrollTrigger.create({
    trigger: '.section-47',
    start,
    end,
    id: 'statsFixed',
    onLeaveBack: simulateDensity,
    onEnter: simulateFixed,
  });

  ScrollTrigger.create({
    trigger: '.section-48',
    start,
    end,
    id: 'statsPh',
    onLeaveBack: simulateFixed,
    onEnter: simulatePh,
  });

  ScrollTrigger.create({
    trigger: '.section-49',
    start,
    end,
    id: 'statsVolatile',
    onLeaveBack: simulatePh,
    onEnter: simulateVolatile,
  });

  ScrollTrigger.create({
    trigger: '.section-50',
    start,
    end,
    id: 'statsQuality',
    onLeaveBack: simulateVolatile,
    onEnter: simulateQuality,
  });

  ScrollTrigger.create({
    trigger: '.section-51',
    start,
    end,
    id: 'qualityDots',
    onLeaveBack: () => (state.stats.colourDots = false),
    onEnter: () => {
      state.stats.colourDots = true;
      sim.restart(); // ...won't change colours if it's cold.
    },
  });

  ScrollTrigger.create({
    trigger: '.section-52',
    start,
    end,
    id: 'statsAlcoholColoured',
    onLeaveBack: simulateQuality,
    onEnter: simulateVolatile,
  });

  ScrollTrigger.create({
    trigger: '.section-53',
    start,
    end,
    id: 'statsAlcoholColoured',
    onLeaveBack: simulateVolatile,
    onEnter: simulateQualVol,
  });

  ScrollTrigger.create({
    trigger: '.section-54',
    start,
    end,
    id: 'statsAlcoholColoured',
    onLeaveBack: simulateQualVol,
    onEnter: simulateAlcohol,
  });

  ScrollTrigger.create({
    trigger: '.section-55',
    start,
    end,
    id: 'statsAlcoholQuality',
    onLeaveBack: simulateAlcohol,
    onEnter: simulateQualAlc,
  });

  ScrollTrigger.create({
    trigger: '.section-56',
    start,
    end,
    id: 'statsDrawLR',
    onLeaveBack: () => {
      state.stats.lr = false;
      simulateQualAlc();
    },
    onEnter: () => (state.stats.lr = true),
    onUpdate(self) {
      state.stats.progress.draw = self.progress;
      renderStats();
    },
  });

  ScrollTrigger.create({
    trigger: '.section-57',
    start,
    end,
    id: 'statsDrawLRPoint',
    onUpdate(self) {
      state.stats.progress.point = self.progress;
      renderStats();
    },
  });

  ScrollTrigger.create({
    trigger: '.section-58',
    start,
    end,
    id: 'statsExtendLR',
    onUpdate(self) {
      state.stats.progress.extend = self.progress;
      renderStats();
    },
  });

  ScrollTrigger.create({
    trigger: '.section-59',
    start,
    end,
    id: 'statsQualityBinaryAlcohol',
    onLeaveBack: simulateQualAlc,
    onEnter: simulateQualBinAlc,
  });

  ScrollTrigger.create({
    trigger: '.section-60',
    start,
    end,
    id: 'statsLogisticLine',
    onLeaveBack: simulateQualBinAlc,
    onUpdate(self) {
      state.stats.progress.logistic = self.progress;
      renderStats();
    },
  });

  ScrollTrigger.create({
    trigger: '.section-61',
    start,
    end,
    id: 'statsRemove',
    onLeaveBack() {
      state.stats.lr = true;
      tweenStatsAlpha(1); // Switch the global alpha back on.
      simulateQualBinAlc();
    },
    onEnter() {
      state.stats.lr = false;
      simulateRemove();
    },
  });

  ScrollTrigger.create({
    animation: state.tween.importance,
    trigger: '.section-62',
    start,
    end,
    id: 'importance',
    // Stop the simulation as it would otherwise
    // continue to draw on the context.
    onEnter: () => sim.stop(),
    onEnterBack: () => clear(state.ctx.bottleWave), // 1
  });

  ScrollTrigger.create({
    animation: state.tween.importanceRemove,
    trigger: '.section-63',
    start,
    end,
    id: 'importanceRemove',
  });

  ScrollTrigger.create({
    animation: state.tween.modelBottleIn,
    trigger: '.section-64',
    start,
    end,
    id: 'modelBottleIn',
    onEnterBack: () => clear(state.ctx.bottleWave), // 1
  });

  ScrollTrigger.create({
    trigger: '.section-65',
    start,
    end,
    id: 'modelWaveInit',
    onLeaveBack: () => stopModelWave(),
    onUpdate: self => updateModelWave(self),
  });
}

function setScroll() {
  // Match media is needed to reset and rebuild the
  // start and end positions for the triggers on resize.
  // It also recalculates all scroll positions, I believe.
  ScrollTrigger.matchMedia({
    '(min-width: 800px)': setScrollBase,
    '(max-width: 799px)': setScrollBase,
  });

  ScrollTrigger.refresh();
}

// Main function.
function update(wineScapeImg) {
  state.scape.image = wineScapeImg;

  updateDimensions();
  setVisualStructure();
  updateTransforms();
  buildModelControls();

  setupLolliSlider();

  tweenWineScape();
  tweenGlassBottle();
  tweenBottleText();
  tweenBottleWave();
  tweenLolliChart();
  tweenBlackBox();
  tweenCleanup();
  tweenBottleEmpty();
  tweenBottleTextOut();
  tweenAnimals();
  tweenBottleFill();
  tweenBottleColour();
  tweenBottleGrid();
  tweenBottleGridColour();
  tweenBottleGridSort();
  tweenBottleGridOut();
  tweenDataset();
  tweenGlobe();
  tweenStats();
  tweenImportance();
  tweenModelBottle();

  setScroll();
  checkModelWave();
}

export default update;

// 1. A bit of a tenacious context that gets easily stuck
//    when racing back. So better safely removing it twice...
