import { Pixels } from 'pixel';
import { Vector } from 'vector';
import { Polygon } from 'polygon';

/**
 * Renders desired image to HTMLCanvas
 * then extracts raw pixels and turns into shape using Moore's algorithm
 * then from shapes it converts into polygon 
 * @param {CanvasRenderingContext2D} context 
 */
export async function getBoundary(context, imageurl) {
  const rawpixels = await getpixels(context, imageurl);
  const shapes = moore(rawpixels);
  console.log('shapes', shapes);
  const polygons = shapes.map(shape => new Polygon(...shape));
  console.log('polygons', polygons);

  return polygons;
}

//########### MOORE NEIGHBOURHOOD ALGORITHM

const ORDER = [6, 3, 0, 1, 2, 5, 8, 7]; 
const DIRECTION = {
  '1,-1':  0, // Bottom-left
  '0,-1':  1, // Left
  '-1,-1': 2, // Top-left
  '-1,0':  3, // Top
  '-1,1':  4, // Top-right
  '0,1':   5, // Right
  '1,1':   6, // Bottom-right
  '1,0':   7, // Bottom
};

/**
 * Generator function to get Moore set 
 * kinda useless generator function and can just use the loop instead..
 * @param {Array<Pixel>} pixels 
 * @param {Pixel} boundary current boundary pixel
 * @param {Pixel} previous_white the previous white pixel
 */
function* MooreSet(pixels, boundary, previous_white) {
  const dx = previous_white.col - boundary.col;
  const dy = previous_white.row - boundary.row;
  const offset = DIRECTION[`${dy},${dx}`] || 0; // Default to 0 if not found (case 0,0)
  
  for (let i=0; i<8; i++)
  {
    const d = boundary.pixels[ORDER[(offset + i) % 8]];
    yield pixels.get(d.row, d.col);
  }

  yield null;
}

/**
 * This is a implementation of the Moore Neighbourhood Algorithm
 * slighly adapted for useing the Pixel class for its ease of control 
 * @param {ImageData} rawdata standard output from CanvasRenderingContext2D image snapshot 
 * @param {Boolean} verbose \*OPTIONAL\* default = false
 * @returns {Array<Vector>} 
 */
function moore(rawdata, verbose = false) {
  const pixels = new Pixels(rawdata);
  const visited = {};
  const shapes = [];

  let start = scan(pixels, visited);
  let k=0; // safety
  while (k<1000 && start !== null)
  {
    k++;
    let hitstart = 0;

    let b = start; // denote current boundary pixel
    let p = pixels.get(start.row, start.col - 1); // denotes previous pixel 
    const start_previous = p.key;
    const B = [new Vector(start.col, start.row)];

    let l=0; // safety
    while (l<10000)
    {
      l++;
      let terminate = false;
      const M = MooreSet(pixels, b, p);

      for (let c of M)
      {
        // check termination rules 
        if (c.key === start.key)
        {
          hitstart++;

          // extended termination rule, hit start twice 
          if (hitstart > 1)
          {
            if (verbose) console.log("HIT TWICE", c.key)
            terminate = true;
            break;
          }

          // Jacob Eliosoff termination rule 
          if (p.key === start_previous)
          {
            if (verbose) console.log("JACBS", p.key)
            terminate = true;
            break;
          }

          // Henry Pap termination rule : check if all options has already been visited 
          if (!p.pixels.reduce((p, c) => p && (!c.isEdge || c.isEdge && !visited[c.key]), true))
          {
            if (verbose) console.log("HENRY", p.key);
            terminate = true;
            break;
          }
        }

        if (c.black)
        {
          visited[c.key] = true;
          B.push(new Vector(c.col, c.row));
          b = c;
          break; // this will make sure we get new M set and c will be next point 
        }
        else 
        {
          p = c;
        }
      }

      if (terminate)
      {
        break;
      }
    }
    if (verbose) console.log("L:", l, start.key);

    shapes.push(B);
    start = scan(pixels, visited, start.row, start.col);
  }

  if (verbose) console.log("K:", k);
  return shapes;
}

/**
 * helper function to scan for next edge pixel 
 * @param {Array<Pixel>} pixels 
 * @param {Set<string>} visited remember which one has been visited already
 * @param {number} row control from where row start
 * @param {number} col control from where column start
 * @returns {Pixel.point|null}
 */
function scan(pixels, visited, row=0, col=0) {
  for (let i=row; i<pixels.height; i++)
  {
    for (let j=col; j<pixels.width; j++)
    {
      const point = pixels.point(i, j);

      // if no edge found we can continue 
      if (!point.isEdge) continue;

      if (visited[point.key]) continue;

      if (point.pixels.some(p => visited[p.key])) continue;

      visited[point.key] = true;

      return point;
    }
  }

  return null;
}

/**
 * helper function to retrive RAW pixel data from desired image 
 * @param {CanvasRenderingContext2D} context 
 * @param {String} url of image to be rendered
 * @returns {Promise<ImageData>}
 */
function getpixels(context, url) {
  return new Promise(res => {
    const img = new Image();
    img.src = url;
    img.onload = () => {
      context.drawImage(img, 0, 0, img.width, img.height);
      const pixels = context.getImageData(0, 0, img.width, img.height);
      
      //#### display purpose
      // const SIZE = 80;
      // canvas.width = img.width * SIZE;
      // canvas.height = img.height * SIZE;
      // context.imageSmoothingEnabled = false;
      // context.drawImage(img, 0, 0, img.width * SIZE, img.height * SIZE);

      // context.fillStyle = "#888"
      // for (let i=0; i<img.width; i++) {
      //   const x = i * SIZE;
      //   for (let j=0; j<img.height; j++) {
      //     const y = j * SIZE;

      //     context.fillText(`${j}x${i}`, x + SIZE/4, y + SIZE/2)
      //   }
      // }
      
      res(pixels);
    }
  })
}