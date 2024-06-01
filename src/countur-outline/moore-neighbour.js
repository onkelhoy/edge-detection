import { Pixels } from 'pixel';

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
function* MooreNeighbour(pixels, boundary, previous_white) {
  const dx = previous_white.x - boundary.x;
  const dy = previous_white.y - boundary.y;
  const offset = DIRECTION[`${dy},${dx}`] || 0; // Default to 0 if not found (case 0,0)
  
  for (let i=0; i<8; i++)
  {
    const d = boundary.pixels[ORDER[(offset + i) % 8]];
    yield pixels.get(d.row, d.col);
  }

  yield null;
}

export function Moore(rawdata) {
  const pixels = new Pixels(rawdata);
  const visited = {};
  const shapes = [];

  let start = scan(pixels, visited);
  let k=0;
  while (k<10 && start !== null)
  {
    k++;
    let hitstart = 0;

    let b = start; // denote current boundary pixel
    let p = pixels.get(start.y, start.x - 1); // denotes previous pixel 
    const start_previous = p.key;
    const B = [start.position];

    let l=0;
    while (l<100)
    {
      l++;
      let terminate = false;
      const M = MooreNeighbour(pixels, b, p);
      for (let c of M)
      {
        // check termination rules 
        if (c.key === start.key)
        {
          console.log('hit', p.key, start_previous);
          hitstart++;

          // extended termination rule, hit start twice 
          if (hitstart > 1)
          {
            console.log("HIT TWICE", c.key)
            terminate = true;
            break;
          }

          console.log('hit', p.key, start_previous);


          // Jacob Eliosoff termination rule 
          if (p.key === start_previous)
          {
            console.log("JACBS", p.key)
            terminate = true;
            break;
          }

          // Henry Pap termination rule : check if all options has already been visited 
          if (!p.pixels.reduce((c, p) => p && c.isEdge && !visited[c.key]), true)
          {
            console.log("HENRY", p.key);
            terminate = true;
            break;
          }
        }

        if (c.black)
        {
          visited[c.key] = true;
          B.push(c.position);
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
    console.log("L:",l, start.key);

    shapes.push(B);
    start = scan(pixels, visited, start.row, start.col);
  }

  console.log("K:",k);
  return shapes;
}

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