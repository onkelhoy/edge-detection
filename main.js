import { getBoundary } from "edge"

let canvas, ctx;
async function load() {
  canvas = document.querySelector('canvas');
  ctx = canvas.getContext('2d');

  const polygons = await getBoundary(ctx, "images/12.png");

  let maxx = Number.MIN_SAFE_INTEGER
  let maxy = Number.MIN_SAFE_INTEGER
  polygons.forEach(p => {
    p.scale(2)
    p.add(50, 50);
    const b = p.boundary;
    if (b.x + b.w > maxx) maxx = b.x + b.w;
    if (b.y + b.h > maxy) maxy = b.y + b.h;
  });
  
  canvas.width = maxx + 100;
  canvas.height = maxy + 100;

  polygons.forEach(p => p.draw(ctx));
}

window.onload = () => load();

