import { gsap } from 'gsap/all';
import { ScrollTrigger } from 'gsap/src/ScrollTrigger';
import state from '../app/state';

// The morphs to get through (also exported to be used
// in the update function to set up the scroll triggers).
const animalPaths = [
  { id: '#bottle-path', name: 'bottle' },
  { id: '#animalPig', name: 'animalPig' },
  { id: '#animalCroc', name: 'animalCroc' },
  { id: '#animalGiraffe', name: 'animalGiraffe' },
  { id: '#animalSloth1', name: 'animalSloth1' },
  { id: '#animalWhale', name: 'animalWhale' },
  { id: '#animalBird', name: 'animalBird' },
  { id: '#animalSloth2a', name: 'animalSloth2a' },
  { id: '#bottle-path', name: 'bottle' },
];

function drawAnimals(ctx, path, t) {
  ctx.clearRect(0, 0, state.width, state.height);
  ctx.save();
  ctx.strokeStyle = state.glassBottle.colour;
  ctx.translate(t.x, t.y);
  ctx.scale(t.scale, t.scale);
  ctx.beginPath();
  for (let i = 0; i < path.length; i++) {
    const segment = path[i];
    const l = segment.length;
    ctx.moveTo(segment[0], segment[1]);
    for (let j = 2; j < l; j += 6) {
      ctx.bezierCurveTo(
        segment[j],
        segment[j + 1],
        segment[j + 2],
        segment[j + 3],
        segment[j + 4],
        segment[j + 5]
      );
    }
    if (segment.closed) {
      ctx.closePath();
    }
  }
  ctx.stroke();
  ctx.restore();
}

function renderAnimals() {
  requestAnimationFrame(() => {
    drawAnimals(
      state.ctx.glassBottle,
      state.glassBottle.path,
      state.transform.shape
    );
  });
}

function defineTweenAnimals(from, to) {
  // The timeline.
  const tl = gsap.timeline({ onUpdate: renderAnimals });

  // The path morph.
  const morph = gsap.to(from.id, {
    morphSVG: {
      shape: to.id,
      map: 'complexity',
      updateTarget: false,
      render(path) {
        state.glassBottle.path = path;
      },
    },
  });

  // The path's transforms.
  const trans = gsap.fromTo(
    state.transform.shape,
    {
      x: state.transform[from.name].x,
      y: state.transform[from.name].y,
      scale: state.transform[from.name].scale,
    },
    {
      x: state.transform[to.name].x,
      y: state.transform[to.name].y,
      scale: state.transform[to.name].scale,
      ease: 'none',
    }
  );

  tl.add(morph, from.pos).add(trans, '<');

  return tl;
}

function tweenAnimals() {
  // Build a tween for each path transition (1 less than
  // the array as each tween has a from and a to path).
  for (let i = 0; i < animalPaths.length - 1; i++) {
    // Get the from and the to element.
    const from = animalPaths[i];
    const to = animalPaths[i + 1];

    // Capture current progress.
    const scroll = ScrollTrigger.getById(from.name);
    const progress = scroll ? scroll.progress : 0;

    // Kill old - set up new timeline.
    if (state.tween[from.name]) state.tween[from.name].kill();
    state.tween[from.name] = defineTweenAnimals(from, to);
    state.tween[from.name].totalProgress(progress);
  }
}

export default tweenAnimals;
export { animalPaths, renderAnimals };
