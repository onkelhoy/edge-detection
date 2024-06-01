// import { BoundaryMap } from 'edge';
import { Moore } from "moore-neighbour"

const SIZE = 80;

function getPixels(name) {
  return new Promise(res => {
    const img = new Image();
    img.src = `./images/${name}.png`;
    img.onload = () => {
      canvas.width = img.width * SIZE;
      canvas.height = img.height * SIZE;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      const pixels = ctx.getImageData(0, 0, img.width, img.height);
      
      // display purpose
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, img.width * SIZE, img.height * SIZE);

      ctx.fillStyle = "#888"
      for (let i=0; i<img.width; i++) {
        const x = i * SIZE;
        for (let j=0; j<img.height; j++) {
          const y = j * SIZE;

          ctx.fillText(`${j}x${i}`, x + SIZE/4, y + SIZE/2)
        }
      }
      
      res(pixels);
    }
  })
}

let canvas, ctx;
async function load() {
  canvas = document.querySelector('canvas');
  ctx = canvas.getContext('2d');

  const pixels = await getPixels(8); // works for case 0 not 6, 8
  const shapes = Moore(pixels);
  console.log(shapes);
  // const boundary = new BoundaryMap(pixels);
  // console.log(boundary);
}

window.onload = () => load();

