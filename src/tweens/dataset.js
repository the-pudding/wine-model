import { gsap } from 'gsap/all';
import { ScrollTrigger } from 'gsap/src/ScrollTrigger';
import state from '../app/state';

function drawPath(ctx, paths, t, length, offset) {
  ctx.save();

  ctx.translate(t.x, t.y);
  ctx.scale(t.scale, t.scale);
  ctx.setLineDash([length - offset, offset]);
  // eslint-disable-next-line no-unused-expressions
  Array.isArray(paths)
    ? paths.forEach(path => ctx.stroke(path))
    : ctx.stroke(paths);
  ctx.restore();
}

function renderPath() {
  requestAnimationFrame(() => {
    // Change global styles savely.
    state.ctx.glassBottle.save();
    state.ctx.glassBottle.globalAlpha = state.glassBottle.alpha; // 1
    state.ctx.glassBottle.strokeStyle = '#000000';
    state.ctx.glassBottle.lineWidth = 1.2;
    // We clear the canvas before we draw each column (and the grid).
    state.ctx.glassBottle.clearRect(0, 0, state.width, state.height);
    // We draw the grid and each dataset column with their very own
    // path offsets, that are tweened one by one by the scrolltriggers.
    state.dataset.info.forEach(d => {
      drawPath(
        state.ctx.glassBottle,
        state.dataset[d.name].paths,
        state.transform.dataset,
        state.dataset[d.name].length,
        state.dataset[d.name].offset
      );
    });
    state.ctx.glassBottle.restore();
  });
}

function defineTweenDataset(pathInfo) {
  const tl = gsap.timeline({ onUpdate: renderPath });

  const offset = gsap.fromTo(
    pathInfo,
    { offset: pathInfo.length },
    { offset: 0 }
  );

  return tl.add(offset);
}

function tweenDataset() {
  // We buld a tween for each dataset element (the grid and each column).
  state.dataset.info.forEach(d => {
    // Capture current progress.
    const scroll = ScrollTrigger.getById(d.tween);
    const progress = scroll ? scroll.progress : 0;

    // Kill old - set up new timeline.
    if (state.tween[d.tween]) state.tween[d.tween].kill();
    state.tween[d.tween] = defineTweenDataset(state.dataset[d.name]);
    state.tween[d.tween].totalProgress(progress);
  });
}

export default tweenDataset;

// 1. The dataset gets drawn randomly on resize. To counteract this we
//    set the alpha value to 1 in the scrolltriggers when drawing the
//    dataset as well as setting it to 0 and clearing it before and after.
