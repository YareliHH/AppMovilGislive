// src/utils/productosutils.js

/**
 * Valida si un producto tiene todos los campos requeridos
 * @param {Object} producto - El producto a validar
 * @returns {Object} - { valido: boolean, errores: string[] }
 */
export const validarProducto = (producto) => {
  const errores = [];

  if (!producto) {
    return { valido: false, errores: ['El producto es requerido'] };
  }

  // Validar nombre
  if (!producto.nombre || typeof producto.nombre !== 'string') {
    errores.push('El nombre es requerido');
  } else if (producto.nombre.trim().length < 3) {
    errores.push('El nombre debe tener al menos 3 caracteres');
  }

  // Validar precio
  if (producto.precio === undefined || producto.precio === null) {
    errores.push('El precio es requerido');
  } else if (typeof producto.precio !== 'number' && typeof producto.precio !== 'string') {
    errores.push('El precio debe ser un número');
  } else if (Number(producto.precio) <= 0) {
    errores.push('El precio debe ser mayor a 0');
  }

  // Validar stock
  if (producto.stock !== undefined && producto.stock !== null) {
    if (Number(producto.stock) < 0) {
      errores.push('El stock no puede ser negativo');
    }
  }

  // Validar imagen (si existe)
  if (producto.imagen) {
    const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
    if (!urlRegex.test(producto.imagen)) {
      errores.push('La URL de la imagen no es válida');
    }
  }

  return {
    valido: errores.length === 0,
    errores
  };
};

/**
 * Calcula el precio con descuento aplicado
 * @param {number} precio - Precio original
 * @param {number} descuento - Porcentaje de descuento (0-100)
 * @returns {number} - Precio con descuento aplicado
 */
export const calcularPrecioConDescuento = (precio, descuento) => {
  if (typeof precio !== 'number' || precio < 0) {
    throw new Error('El precio debe ser un número positivo');
  }

  if (typeof descuento !== 'number' || descuento < 0 || descuento > 100) {
    throw new Error('El descuento debe estar entre 0 y 100');
  }

  const precioConDescuento = precio - (precio * descuento / 100);
  return Number(precioConDescuento.toFixed(2));
};

/**
 * Filtra productos por categoría
 * @param {Array} productos - Array de productos
 * @param {string} categoria - Categoría a filtrar
 * @returns {Array} - Productos filtrados
 */
export const filtrarProductosPorCategoria = (productos, categoria) => {
  if (!Array.isArray(productos)) {
    return [];
  }

  if (!categoria || typeof categoria !== 'string') {
    return productos;
  }

  return productos.filter(producto => 
    producto.categoria && 
    producto.categoria.toLowerCase() === categoria.toLowerCase()
  );
};

/**
 * Ordena productos por precio
 * @param {Array} productos - Array de productos
 * @param {string} orden - 'asc' o 'desc'
 * @returns {Array} - Productos ordenados
 */
export const ordenarProductosPorPrecio = (productos, orden = 'asc') => {
  if (!Array.isArray(productos)) {
    return [];
  }

  const productosOrdenados = [...productos];

  productosOrdenados.sort((a, b) => {
    const precioA = Number(a.precio) || 0;
    const precioB = Number(b.precio) || 0;

    if (orden === 'desc') {
      return precioB - precioA;
    }
    return precioA - precioB;
  });

  return productosOrdenados;
};

/**
 * Formatea un precio con símbolo de moneda
 * @param {number} precio - Precio a formatear
 * @param {string} moneda - Símbolo de moneda (default: '$')
 * @returns {string} - Precio formateado
 */
export const formatearPrecio = (precio, moneda = '$') => {
  if (typeof precio !== 'number' || isNaN(precio)) {
    return `${moneda}0.00`;
  }

  return `${moneda}${precio.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

/**
 * Calcula el total de un carrito de compras
 * @param {Array} carrito - Array de items del carrito
 * @returns {number} - Total del carrito
 */
export const calcularTotal = (carrito) => {
  if (!Array.isArray(carrito)) {
    return 0;
  }

  return carrito.reduce((total, item) => {
    const precio = Number(item.precio) || 0;
    const cantidad = Number(item.cantidad) || 1;
    return total + (precio * cantidad);
  }, 0);
};

/**
 * Aplica impuesto (IVA) a un precio
 * @param {number} subtotal - Subtotal sin impuesto
 * @param {number} porcentajeIVA - Porcentaje de IVA (default: 16)
 * @returns {Object} - { subtotal, iva, total }
 */
export const aplicarImpuesto = (subtotal, porcentajeIVA = 16) => {
  if (typeof subtotal !== 'number' || subtotal < 0) {
    throw new Error('El subtotal debe ser un número positivo');
  }

  const iva = Number((subtotal * porcentajeIVA / 100).toFixed(2));
  const total = Number((subtotal + iva).toFixed(2));

  return {
    subtotal,
    iva,
    total
  };
};

/**
 * Filtra productos por rango de precio
 * @param {Array} productos - Array de productos
 * @param {number} precioMin - Precio mínimo
 * @param {number} precioMax - Precio máximo
 * @returns {Array} - Productos filtrados
 */
export const filtrarPorRangoPrecio = (productos, precioMin, precioMax) => {
  if (!Array.isArray(productos)) {
    return [];
  }

  return productos.filter(producto => {
    const precio = Number(producto.precio) || 0;
    return precio >= precioMin && precio <= precioMax;
  });
};

/**
 * Busca productos por nombre o descripción
 * @param {Array} productos - Array de productos
 * @param {string} termino - Término de búsqueda
 * @returns {Array} - Productos que coinciden con la búsqueda
 */
export const buscarProductos = (productos, termino) => {
  if (!Array.isArray(productos) || !termino || typeof termino !== 'string') {
    return productos || [];
  }

  const terminoLower = termino.toLowerCase().trim();

  return productos.filter(producto => {
    const nombre = (producto.nombre || '').toLowerCase();
    const descripcion = (producto.descripcion || '').toLowerCase();
    
    return nombre.includes(terminoLower) || descripcion.includes(terminoLower);
  });
};

/**
 * Verifica si un producto está en stock
 * @param {Object} producto - Producto a verificar
 * @returns {boolean} - true si hay stock, false si no
 */
export const tieneStock = (producto) => {
  if (!producto || typeof producto !== 'object') {
    return false;
  }

  const stock = Number(producto.stock);
  return !isNaN(stock) && stock > 0;
};

/**
 * Calcula el porcentaje de descuento
 * @param {number} precioOriginal - Precio original
 * @param {number} precioConDescuento - Precio con descuento
 * @returns {number} - Porcentaje de descuento
 */
export const calcularPorcentajeDescuento = (precioOriginal, precioConDescuento) => {
  if (typeof precioOriginal !== 'number' || typeof precioConDescuento !== 'number') {
    return 0;
  }

  if (precioOriginal <= 0 || precioConDescuento >= precioOriginal) {
    return 0;
  }

  const descuento = ((precioOriginal - precioConDescuento) / precioOriginal) * 100;
  return Number(descuento.toFixed(2));
};

/**
 * Genera un slug para URL a partir del nombre del producto
 * @param {string} nombre - Nombre del producto
 * @returns {string} - Slug generado
 */
export const generarSlug = (nombre) => {
  if (!nombre || typeof nombre !== 'string') {
    return '';
  }

  return nombre
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
    .replace(/[^a-z0-9\s-]/g, '') // Elimina caracteres especiales
    .replace(/\s+/g, '-') // Reemplaza espacios con guiones
    .replace(/-+/g, '-'); // Elimina guiones múltiples
};

/**
 * Agrupa productos por categoría
 * @param {Array} productos - Array de productos
 * @returns {Object} - Productos agrupados por categoría
 */
export const agruparPorCategoria = (productos) => {
  if (!Array.isArray(productos)) {
    return {};
  }

  return productos.reduce((grupos, producto) => {
    const categoria = producto.categoria || 'Sin categoría';
    
    if (!grupos[categoria]) {
      grupos[categoria] = [];
    }
    
    grupos[categoria].push(producto);
    return grupos;
  }, {});
};

/**
 * Valida si hay stock suficiente para la cantidad solicitada
 * @param {Object} producto - Producto a validar
 * @param {number} cantidadSolicitada - Cantidad que se desea comprar
 * @returns {Object} - { disponible: boolean, mensaje: string }
 */
export const validarStockDisponible = (producto, cantidadSolicitada) => {
  if (!producto || typeof producto !== 'object') {
    return { disponible: false, mensaje: 'Producto no válido' };
  }

  if (typeof cantidadSolicitada !== 'number' || cantidadSolicitada <= 0) {
    return { disponible: false, mensaje: 'Cantidad no válida' };
  }

  const stock = Number(producto.stock) || 0;

  if (stock === 0) {
    return { disponible: false, mensaje: 'Producto agotado' };
  }

  if (cantidadSolicitada > stock) {
    return { 
      disponible: false, 
      mensaje: `Solo hay ${stock} unidades disponibles` 
    };
  }

  return { disponible: true, mensaje: 'Stock disponible' };
};