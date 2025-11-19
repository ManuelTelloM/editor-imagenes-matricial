// ============================================
// EDITOR DE IMÁGENES CON ÁLGEBRA MATRICIAL
// ============================================
// Nombre del estudiante: _________________
// Fecha: _________________
// Grupo: _________________

const { PNG } = require('pngjs');
const fs = require('fs');
const path = require('path');

// Importar funciones auxiliares (puedes usarlas)
const {
  crearMatrizVacia,
  validarMatriz,
  obtenerDimensiones,
  limitarValorColor,
  crearPixel,
  copiarMatriz,
  asegurarDirectorio
} = require('./utilidades');

// Importar operaciones matriciales (puedes usarlas)
const {
  sumarMatrices,
  restarMatrices,
  multiplicarPorEscalar,
  multiplicarMatrices,
  transponerMatriz
} = require('./matriz');

// ============================================
// SECCIÓN 1: FUNDAMENTOS (20 puntos)
// Conversión entre imágenes y matrices
// ============================================

function imagenAMatriz(rutaImagen) {
  const buffer = fs.readFileSync(rutaImagen);
  const png = PNG.sync.read(buffer);

  const matriz = [];

  for (let y = 0; y < png.height; y++) {
    const fila = [];
    for (let x = 0; x < png.width; x++) {
      const idx = (png.width * y + x) << 2;

      const pixel = {
        r: png.data[idx],
        g: png.data[idx + 1],
        b: png.data[idx + 2],
        a: png.data[idx + 3]
      };

      fila.push(pixel);
    }
    matriz.push(fila);
  }

  return matriz;
}

function matrizAImagen(matriz, rutaSalida) {
  validarMatriz(matriz);
  const dims = obtenerDimensiones(matriz);

  const png = new PNG({
    width: dims.columnas,
    height: dims.filas
  });

  for (let y = 0; y < dims.filas; y++) {
    for (let x = 0; x < dims.columnas; x++) {
      const idx = (dims.columnas * y + x) << 2;
      const pixel = matriz[y][x];

      png.data[idx] = limitarValorColor(pixel.r);
      png.data[idx + 1] = limitarValorColor(pixel.g);
      png.data[idx + 2] = limitarValorColor(pixel.b);
      png.data[idx + 3] = limitarValorColor(pixel.a);
    }
  }

  asegurarDirectorio(path.dirname(rutaSalida));

  const buffer = PNG.sync.write(png);
  fs.writeFileSync(rutaSalida, buffer);
}

function obtenerCanal(matriz, canal) {
  if (!['r', 'g', 'b'].includes(canal)) {
    throw new Error("El canal debe ser 'r', 'g', o 'b'");
  }

  const resultado = copiarMatriz(matriz);

  for (let i = 0; i < resultado.length; i++) {
    for (let j = 0; j < resultado[i].length; j++) {
      const valor = matriz[i][j][canal];
      resultado[i][j] = {
        r: valor,
        g: valor,
        b: valor,
        a: matriz[i][j].a
      };
    }
  }

  return resultado;
}

function obtenerDimensionesImagen(rutaImagen) {
  const buffer = fs.readFileSync(rutaImagen);
  const png = PNG.sync.read(buffer);

  return {
    ancho: png.width,
    alto: png.height,
    totalPixeles: png.width * png.height
  };
}

// ============================================
// SECCIÓN 2: OPERACIONES BÁSICAS (25 puntos)
// Aplicar álgebra matricial a píxeles
// ============================================

function ajustarBrillo(matriz, factor) {
  const resultado = copiarMatriz(matriz);

  for (let i = 0; i < resultado.length; i++) {
    for (let j = 0; j < resultado[i].length; j++) {
      resultado[i][j].r = limitarValorColor(matriz[i][j].r * factor);
      resultado[i][j].g = limitarValorColor(matriz[i][j].g * factor);
      resultado[i][j].b = limitarValorColor(matriz[i][j].b * factor);
    }
  }

  return resultado;
}

function invertirColores(matriz) {
  const resultado = copiarMatriz(matriz);

  for (let i = 0; i < resultado.length; i++) {
    for (let j = 0; j < resultado[i].length; j++) {
      resultado[i][j].r = 255 - matriz[i][j].r;
      resultado[i][j].g = 255 - matriz[i][j].g;
      resultado[i][j].b = 255 - matriz[i][j].b;
    }
  }

  return resultado;
}

function convertirEscalaGrises(matriz) {
  const resultado = copiarMatriz(matriz);

  for (let i = 0; i < resultado.length; i++) {
    for (let j = 0; j < resultado[i].length; j++) {
      const p = matriz[i][j];
      const gris = limitarValorColor(0.299 * p.r + 0.587 * p.g + 0.114 * p.b);

      resultado[i][j] = {
        r: gris,
        g: gris,
        b: gris,
        a: p.a
      };
    }
  }

  return resultado;
}

// ============================================
// SECCIÓN 3: TRANSFORMACIONES GEOMÉTRICAS
// ============================================

function voltearHorizontal(matriz) {
  const resultado = copiarMatriz(matriz);

  for (let i = 0; i < resultado.length; i++) {
    resultado[i].reverse();
  }

  return resultado;
}

function voltearVertical(matriz) {
  const resultado = copiarMatriz(matriz);
  resultado.reverse();
  return resultado;
}

function rotar90Grados(matriz) {
  const filas = matriz.length;
  const columnas = matriz[0].length;

  const nueva = crearMatrizVacia(columnas, filas);

  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < columnas; j++) {
      nueva[j][filas - 1 - i] = matriz[i][j];
    }
  }

  return nueva;
}

// ============================================
// SECCIÓN 4: FILTROS AVANZADOS
// ============================================

function mezclarImagenes(matriz1, matriz2, factor) {
  const dims1 = obtenerDimensiones(matriz1);
  const dims2 = obtenerDimensiones(matriz2);

  if (dims1.filas !== dims2.filas || dims1.columnas !== dims2.columnas) {
    throw new Error('Las imágenes deben tener el mismo tamaño');
  }

  const resultado = crearMatrizVacia(dims1.filas, dims1.columnas);

  for (let i = 0; i < dims1.filas; i++) {
    for (let j = 0; j < dims1.columnas; j++) {
      const p1 = matriz1[i][j];
      const p2 = matriz2[i][j];

      resultado[i][j] = {
        r: limitarValorColor(p1.r * (1 - factor) + p2.r * factor),
        g: limitarValorColor(p1.g * (1 - factor) + p2.g * factor),
        b: limitarValorColor(p1.b * (1 - factor) + p2.b * factor),
        a: p1.a
      };
    }
  }

  return resultado;
}

function aplicarSepia(matriz) {
  const resultado = copiarMatriz(matriz);

  for (let i = 0; i < resultado.length; i++) {
    for (let j = 0; j < resultado[i].length; j++) {
      const p = matriz[i][j];

      const r = limitarValorColor(0.393 * p.r + 0.769 * p.g + 0.189 * p.b);
      const g = limitarValorColor(0.349 * p.r + 0.686 * p.g + 0.168 * p.b);
      const b = limitarValorColor(0.272 * p.r + 0.534 * p.g + 0.131 * p.b);

      resultado[i][j] = { r, g, b, a: p.a };
    }
  }

  return resultado;
}

function detectarBordes(matriz, umbral = 50) {
  const gris = convertirEscalaGrises(matriz);
  const filas = gris.length;
  const columnas = gris[0].length;

  const salida = crearMatrizVacia(filas, columnas);

  for (let i = 0; i < filas; i++) {
    for (let j = 0; j < columnas; j++) {
      if (i === 0 || j === 0 || i === filas - 1 || j === columnas - 1) {
        salida[i][j] = { r: 0, g: 0, b: 0, a: 255 };
        continue;
      }

      const actual = gris[i][j].r;
      const derecha = gris[i][j + 1].r;
      const abajo = gris[i + 1][j].r;

      const dif = Math.max(
        Math.abs(actual - derecha),
        Math.abs(actual - abajo)
      );

      const color = dif > umbral ? 255 : 0;

      salida[i][j] = { r: color, g: color, b: color, a: 255 };
    }
  }

  return salida;
}

// ============================================
// NO MODIFICAR - Exportación de funciones
// ============================================
module.exports = {
  imagenAMatriz,
  matrizAImagen,
  obtenerCanal,
  obtenerDimensionesImagen,

  ajustarBrillo,
  invertirColores,
  convertirEscalaGrises,

  voltearHorizontal,
  voltearVertical,
  rotar90Grados,

  mezclarImagenes,
  aplicarSepia,
  detectarBordes
};


