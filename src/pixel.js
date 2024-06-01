export class Pixels {
  
  // imagedata: ImageData 
  constructor(imagedata) {
    this.pixels = imagedata;
    this.point_matrix = new Map();
  }

  get width() {
    return this.pixels.width;
  }
  get height() {
    return this.pixels.height;
  }
  get data() {
    return this.pixels.data;
  }

  get(row, col) {
    if (typeof row === "string")
    {
      const [r, c] = row.split(",");
      return this.point(r, c);
    }
    return this.point(row, col);
  }

  isEmpty(row, col) {
    const pixel = this.individual(row, col);
    return pixel.r === 255 && pixel.g === 255 && pixel.b === 255;
  }

  individual_index(i) {

    return {
      outofbounds: false,
      index: i,
      r: this.pixels.data[i],
      g: this.pixels.data[i + 1],
      b: this.pixels.data[i + 2],
      a: this.pixels.data[i + 3],
    }
  }

  clear() {
    this.point_matrix.clear();
  }
  individual(row, col) {
    if (row < 0 || col < 0 || row >= this.height || col >= this.width) {
      return {
        outofbounds: true,
        r: 255, // this will be considered as empty (?)
        g: 255,
        b: 255,
        a: 255,
      }
    }

    const index = row * this.width + col;
    return this.individual_index(index * 4); // rgba
  }
  point(row, col) {
    const key = `${col},${row}`;
    if (this.point_matrix.has(key))
    {
      return this.point_matrix.get(key);
    }

    let foundempty = false;
    const data = {
      pixels: [],
      row,
      col,
      key,
      isEdge: !this.isEmpty(row, col),
      black: !this.isEmpty(row, col),
    };

    for (let j=0; j<9; j++) {
      const rl =  Math.floor(j / 3);
      const cl = (j % 3);
      const r = row - 1 + rl;
      const c = col - 1 + cl;

      if (!foundempty && this.isEmpty(r, c)) foundempty = true;
      const pixel = this.individual(r, c);
      pixel.row = r;
      pixel.col = c;
      pixel.row_local = rl;
      pixel.col_local = cl;
      pixel.key = `${c},${r}`;

      data.pixels.push(pixel)
    }
    data.isEdge = data.isEdge && foundempty;
    this.point_matrix.set(key, data);
    
    return data;
  }
}