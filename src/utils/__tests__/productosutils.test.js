/* eslint-disable no-undef */
// src/utils/__tests__/productosutils.test.js
import {
  validarProducto,
  calcularPrecioConDescuento,
  filtrarProductosPorCategoria,
  ordenarProductosPorPrecio,
  formatearPrecio,
  calcularTotal,
  aplicarImpuesto,
  filtrarPorRangoPrecio,
  buscarProductos,
  tieneStock,
  calcularPorcentajeDescuento,
  generarSlug,
  agruparPorCategoria,
  validarStockDisponible
} from '../productosutils';

describe('pruebas unitarias de Productos', () => {

  // ============================================
  // VALIDAR PRODUCTO
  // ============================================

  describe('validarProducto', () => {
    test('Positiva: valida un producto correcto', () => {
      const productoValido = {
        nombre: 'Camiseta Nike',
        precio: 599.99,
        categoria: 'Ropa',
        stock: 10,
        imagen: 'https://example.com/imagen.jpg'
      };

      const resultado = validarProducto(productoValido);

      expect(resultado.valido).toBe(true);
      expect(resultado.errores).toHaveLength(0);
    });

    test('Negativa: rechaza producto sin nombre', () => {
      const productoInvalido = {
        precio: 599.99,
        categoria: 'Ropa'
      };

      const resultado = validarProducto(productoInvalido);

      expect(resultado.valido).toBe(false);
      expect(resultado.errores).toContain('El nombre es requerido');
    });

    test('Negativa: rechaza producto con nombre muy corto', () => {
      const productoInvalido = {
        nombre: 'AB',
        precio: 599.99
      };

      const resultado = validarProducto(productoInvalido);

      expect(resultado.valido).toBe(false);
      expect(resultado.errores).toContain('El nombre debe tener al menos 3 caracteres');
    });

    test('Negativa: rechaza producto con precio negativo', () => {
      const productoInvalido = {
        nombre: 'Camiseta',
        precio: -100
      };

      const resultado = validarProducto(productoInvalido);

      expect(resultado.valido).toBe(false);
      expect(resultado.errores).toContain('El precio debe ser mayor a 0');
    });

    test('Negativa: rechaza producto con stock negativo', () => {
      const productoInvalido = {
        nombre: 'Camiseta',
        precio: 500,
        stock: -5
      };

      const resultado = validarProducto(productoInvalido);

      expect(resultado.valido).toBe(false);
      expect(resultado.errores).toContain('El stock no puede ser negativo');
    });

    test('Negativa: rechaza producto con URL de imagen inválida', () => {
      const productoInvalido = {
        nombre: 'Camiseta',
        precio: 500,
        imagen: 'imagen-invalida'
      };

      const resultado = validarProducto(productoInvalido);

      expect(resultado.valido).toBe(false);
      expect(resultado.errores).toContain('La URL de la imagen no es válida');
    });

    test('Negativa: rechaza producto null', () => {
      const resultado = validarProducto(null);

      expect(resultado.valido).toBe(false);
      expect(resultado.errores).toContain('El producto es requerido');
    });
  });

  // ============================================
  // CALCULAR PRECIO CON DESCUENTO
  // ============================================

  describe('calcularPrecioConDescuento', () => {
    test('Positiva: calcula descuento del 10% correctamente', () => {
      const resultado = calcularPrecioConDescuento(1000, 10);

      expect(resultado).toBe(900);
    });

    test('Positiva: calcula descuento del 25% correctamente', () => {
      const resultado = calcularPrecioConDescuento(200, 25);

      expect(resultado).toBe(150);
    });

    test('Positiva: retorna precio original con descuento 0%', () => {
      const resultado = calcularPrecioConDescuento(1000, 0);

      expect(resultado).toBe(1000);
    });

    test('Positiva: calcula descuento del 100%', () => {
      const resultado = calcularPrecioConDescuento(1000, 100);

      expect(resultado).toBe(0);
    });

    test('Positiva: redondea correctamente a 2 decimales', () => {
      const resultado = calcularPrecioConDescuento(99.99, 15);

      expect(resultado).toBe(84.99);
    });

    test('Negativa: lanza error con precio negativo', () => {
      expect(() => calcularPrecioConDescuento(-100, 10)).toThrow(
        'El precio debe ser un número positivo'
      );
    });

    test('Negativa: lanza error con descuento inválido', () => {
      expect(() => calcularPrecioConDescuento(1000, -10)).toThrow(
        'El descuento debe estar entre 0 y 100'
      );
      expect(() => calcularPrecioConDescuento(1000, 150)).toThrow(
        'El descuento debe estar entre 0 y 100'
      );
    });
  });

  // ============================================
  // FILTRAR PRODUCTOS POR CATEGORÍA
  // ============================================

  describe('filtrarProductosPorCategoria', () => {
    const productos = [
      { id: 1, nombre: 'Camiseta', categoria: 'Ropa', precio: 500 },
      { id: 2, nombre: 'Pantalón', categoria: 'Ropa', precio: 800 },
      { id: 3, nombre: 'Tenis', categoria: 'Calzado', precio: 1200 },
      { id: 4, nombre: 'Gorra', categoria: 'Accesorios', precio: 300 }
    ];

    test('Positiva: filtra productos por categoría Ropa', () => {
      const resultado = filtrarProductosPorCategoria(productos, 'Ropa');

      expect(resultado).toHaveLength(2);
      expect(resultado.every(p => p.categoria === 'Ropa')).toBe(true);
    });

    test('Positiva: filtra productos por categoría Calzado', () => {
      const resultado = filtrarProductosPorCategoria(productos, 'Calzado');

      expect(resultado).toHaveLength(1);
      expect(resultado[0].nombre).toBe('Tenis');
    });

    test('Positiva: es case-insensitive', () => {
      const resultado = filtrarProductosPorCategoria(productos, 'ropa');

      expect(resultado).toHaveLength(2);
    });

    test('Negativa: retorna array vacío si no hay productos de la categoría', () => {
      const resultado = filtrarProductosPorCategoria(productos, 'Deportes');

      expect(resultado).toHaveLength(0);
      expect(resultado).toEqual([]);
    });

    test('Negativa: retorna array vacío si productos no es array', () => {
      const resultado = filtrarProductosPorCategoria(null, 'Ropa');

      expect(resultado).toEqual([]);
    });

    test('Positiva: retorna todos los productos si categoría es inválida', () => {
      const resultado = filtrarProductosPorCategoria(productos, null);

      expect(resultado).toEqual(productos);
    });
  });

  // ============================================
  // ORDENAR PRODUCTOS POR PRECIO
  // ============================================

  describe('ordenarProductosPorPrecio', () => {
    const productos = [
      { id: 1, nombre: 'Producto A', precio: 1500 },
      { id: 2, nombre: 'Producto B', precio: 200 },
      { id: 3, nombre: 'Producto C', precio: 500 }
    ];

    test('Positiva: ordena de menor a mayor (asc)', () => {
      const resultado = ordenarProductosPorPrecio(productos, 'asc');

      expect(resultado[0].precio).toBe(200);
      expect(resultado[1].precio).toBe(500);
      expect(resultado[2].precio).toBe(1500);
    });

    test('Positiva: ordena de mayor a menor (desc)', () => {
      const resultado = ordenarProductosPorPrecio(productos, 'desc');

      expect(resultado[0].precio).toBe(1500);
      expect(resultado[1].precio).toBe(500);
      expect(resultado[2].precio).toBe(200);
    });

    test('Positiva: no modifica el array original', () => {
      const productosOriginales = [...productos];
      ordenarProductosPorPrecio(productos, 'asc');

      expect(productos).toEqual(productosOriginales);
    });

    test('Negativa: retorna array vacío si productos no es array', () => {
      const resultado = ordenarProductosPorPrecio(null, 'asc');

      expect(resultado).toEqual([]);
    });
  });

  // ============================================
  // FORMATEAR PRECIO
  // ============================================

  describe('formatearPrecio', () => {
    test('Positiva: formatea precio con símbolo de pesos', () => {
      const resultado = formatearPrecio(1000);

      expect(resultado).toBe('$1,000.00');
    });

    test('Positiva: formatea precio con decimales', () => {
      const resultado = formatearPrecio(1234.56);

      expect(resultado).toBe('$1,234.56');
    });

    test('Positiva: formatea precios grandes', () => {
      const resultado = formatearPrecio(1234567.89);

      expect(resultado).toBe('$1,234,567.89');
    });

    test('Positiva: formatea precio cero', () => {
      const resultado = formatearPrecio(0);

      expect(resultado).toBe('$0.00');
    });

    test('Positiva: usa símbolo de moneda personalizado', () => {
      const resultado = formatearPrecio(100, '€');

      expect(resultado).toContain('€');
      expect(resultado).toContain('100.00');
    });

    test('Negativa: maneja valores NaN', () => {
      const resultado = formatearPrecio(NaN);

      expect(resultado).toBe('$0.00');
    });
  });

  // ============================================
  // CALCULAR TOTAL
  // ============================================

  describe('calcularTotal', () => {
    test('Positiva: calcula total del carrito correctamente', () => {
      const carrito = [
        { precio: 500, cantidad: 2 },
        { precio: 300, cantidad: 1 },
        { precio: 800, cantidad: 3 }
      ];

      const resultado = calcularTotal(carrito);

      expect(resultado).toBe(3700); // 1000 + 300 + 2400
    });

    test('Positiva: maneja items sin cantidad (cantidad = 1)', () => {
      const carrito = [
        { precio: 100 },
        { precio: 200 }
      ];

      const resultado = calcularTotal(carrito);

      expect(resultado).toBe(300);
    });

    test('Positiva: retorna 0 para carrito vacío', () => {
      const resultado = calcularTotal([]);

      expect(resultado).toBe(0);
    });

    test('Negativa: retorna 0 si carrito no es array', () => {
      const resultado = calcularTotal(null);

      expect(resultado).toBe(0);
    });

    test('Positiva: ignora valores inválidos', () => {
      const carrito = [
        { precio: 100, cantidad: 2 },
        { precio: 'invalido', cantidad: 1 },
        { precio: 200, cantidad: 1 }
      ];

      const resultado = calcularTotal(carrito);

      expect(resultado).toBe(400); // 200 + 0 + 200
    });
  });

  // ============================================
  // APLICAR IMPUESTO
  // ============================================

  describe('aplicarImpuesto', () => {
    test('Positiva: aplica IVA del 16% correctamente', () => {
      const resultado = aplicarImpuesto(1000, 16);

      expect(resultado).toEqual({
        subtotal: 1000,
        iva: 160,
        total: 1160
      });
    });

    test('Positiva: calcula impuesto con decimales', () => {
      const resultado = aplicarImpuesto(99.99, 16);

      expect(resultado.subtotal).toBe(99.99);
      expect(resultado.iva).toBeCloseTo(16.00, 2);
      expect(resultado.total).toBeCloseTo(115.99, 2);
    });

    test('Positiva: maneja impuesto 0%', () => {
      const resultado = aplicarImpuesto(1000, 0);

      expect(resultado.iva).toBe(0);
      expect(resultado.total).toBe(1000);
    });

    test('Negativa: lanza error con subtotal negativo', () => {
      expect(() => aplicarImpuesto(-100, 16)).toThrow(
        'El subtotal debe ser un número positivo'
      );
    });
  });

  // ============================================
  // FILTRAR POR RANGO DE PRECIO
  // ============================================

  describe('filtrarPorRangoPrecio', () => {
    const productos = [
      { id: 1, nombre: 'Producto A', precio: 100 },
      { id: 2, nombre: 'Producto B', precio: 500 },
      { id: 3, nombre: 'Producto C', precio: 1000 },
      { id: 4, nombre: 'Producto D', precio: 1500 }
    ];

    test('Positiva: filtra productos en rango de precio', () => {
      const resultado = filtrarPorRangoPrecio(productos, 200, 1200);

      expect(resultado).toHaveLength(2);
      expect(resultado[0].precio).toBe(500);
      expect(resultado[1].precio).toBe(1000);
    });

    test('Positiva: incluye productos en los límites del rango', () => {
      const resultado = filtrarPorRangoPrecio(productos, 100, 500);

      expect(resultado).toHaveLength(2);
    });

    test('Negativa: retorna array vacío si no es array', () => {
      const resultado = filtrarPorRangoPrecio(null, 100, 500);

      expect(resultado).toEqual([]);
    });
  });

  // ============================================
  // BUSCAR PRODUCTOS
  // ============================================

  describe('buscarProductos', () => {
    const productos = [
      { id: 1, nombre: 'Camiseta Nike', descripcion: 'Camiseta deportiva' },
      { id: 2, nombre: 'Pantalón Adidas', descripcion: 'Pantalón deportivo' },
      { id: 3, nombre: 'Tenis Puma', descripcion: 'Calzado deportivo' }
    ];

    test('Positiva: busca por nombre', () => {
      const resultado = buscarProductos(productos, 'nike');

      expect(resultado).toHaveLength(1);
      expect(resultado[0].nombre).toContain('Nike');
    });

    test('Positiva: busca por descripción', () => {
      const resultado = buscarProductos(productos, 'deportiv');

      expect(resultado).toHaveLength(3);
    });

    test('Positiva: búsqueda es case-insensitive', () => {
      const resultado = buscarProductos(productos, 'NIKE');

      expect(resultado).toHaveLength(1);
    });

    test('Negativa: retorna array vacío si no hay coincidencias', () => {
      const resultado = buscarProductos(productos, 'inexistente');

      expect(resultado).toHaveLength(0);
    });

    test('Negativa: retorna productos originales si término es inválido', () => {
      const resultado = buscarProductos(productos, null);

      expect(resultado).toEqual(productos);
    });
  });

  // ============================================
  // TIENE STOCK
  // ============================================

  describe('tieneStock', () => {
    test('Positiva: retorna true si hay stock', () => {
      const producto = { stock: 5 };

      expect(tieneStock(producto)).toBe(true);
    });

    test('Negativa: retorna false si stock es 0', () => {
      const producto = { stock: 0 };

      expect(tieneStock(producto)).toBe(false);
    });

    test('Negativa: retorna false si stock es negativo', () => {
      const producto = { stock: -1 };

      expect(tieneStock(producto)).toBe(false);
    });

    test('Negativa: retorna false si producto es null', () => {
      expect(tieneStock(null)).toBe(false);
    });

    test('Negativa: retorna false si stock es undefined', () => {
      const producto = {};

      expect(tieneStock(producto)).toBe(false);
    });
  });

  // ============================================
  // CALCULAR PORCENTAJE DE DESCUENTO
  // ============================================

  describe('calcularPorcentajeDescuento', () => {
    test('Positiva: calcula porcentaje de descuento correctamente', () => {
      const resultado = calcularPorcentajeDescuento(1000, 800);

      expect(resultado).toBe(20);
    });

    test('Positiva: calcula descuento del 50%', () => {
      const resultado = calcularPorcentajeDescuento(200, 100);

      expect(resultado).toBe(50);
    });

    test('Negativa: retorna 0 si precio con descuento es mayor', () => {
      const resultado = calcularPorcentajeDescuento(100, 150);

      expect(resultado).toBe(0);
    });

    test('Negativa: retorna 0 si precio original es 0', () => {
      const resultado = calcularPorcentajeDescuento(0, 50);

      expect(resultado).toBe(0);
    });
  });

  // ============================================
  // GENERAR SLUG
  // ============================================

  describe('generarSlug', () => {
    test('Positiva: genera slug correctamente', () => {
      const resultado = generarSlug('Camiseta Nike Deportiva');

      expect(resultado).toBe('camiseta-nike-deportiva');
    });

    test('Positiva: elimina acentos', () => {
      const resultado = generarSlug('Pantalón Élite');

      expect(resultado).toBe('pantalon-elite');
    });

    test('Positiva: elimina caracteres especiales', () => {
      const resultado = generarSlug('Producto #1 - Nueva versión!');

      expect(resultado).toBe('producto-1--nueva-version');
    });

    test('Negativa: retorna string vacío si nombre es inválido', () => {
      expect(generarSlug(null)).toBe('');
      expect(generarSlug('')).toBe('');
    });
  });

  // ============================================
  // AGRUPAR POR CATEGORÍA
  // ============================================

  describe('agruparPorCategoria', () => {
    const productos = [
      { id: 1, nombre: 'Camiseta', categoria: 'Ropa' },
      { id: 2, nombre: 'Pantalón', categoria: 'Ropa' },
      { id: 3, nombre: 'Tenis', categoria: 'Calzado' }
    ];

    test('Positiva: agrupa productos por categoría', () => {
      const resultado = agruparPorCategoria(productos);

      expect(resultado).toHaveProperty('Ropa');
      expect(resultado).toHaveProperty('Calzado');
      expect(resultado.Ropa).toHaveLength(2);
      expect(resultado.Calzado).toHaveLength(1);
    });

    test('Positiva: maneja productos sin categoría', () => {
      const productosConSinCategoria = [
        ...productos,
        { id: 4, nombre: 'Producto sin categoría' }
      ];

      const resultado = agruparPorCategoria(productosConSinCategoria);

      expect(resultado).toHaveProperty('Sin categoría');
      expect(resultado['Sin categoría']).toHaveLength(1);
    });

    test('Negativa: retorna objeto vacío si no es array', () => {
      const resultado = agruparPorCategoria(null);

      expect(resultado).toEqual({});
    });
  });

  // ============================================
  // VALIDAR STOCK DISPONIBLE
  // ============================================

  describe('validarStockDisponible', () => {
    test('Positiva: stock disponible suficiente', () => {
      const producto = { stock: 10 };
      const resultado = validarStockDisponible(producto, 5);

      expect(resultado.disponible).toBe(true);
      expect(resultado.mensaje).toBe('Stock disponible');
    });

    test('Negativa: stock insuficiente', () => {
      const producto = { stock: 3 };
      const resultado = validarStockDisponible(producto, 5);

      expect(resultado.disponible).toBe(false);
      expect(resultado.mensaje).toBe('Solo hay 3 unidades disponibles');
    });

    test('Negativa: producto agotado', () => {
      const producto = { stock: 0 };
      const resultado = validarStockDisponible(producto, 1);

      expect(resultado.disponible).toBe(false);
      expect(resultado.mensaje).toBe('Producto agotado');
    });

    test('Negativa: producto inválido', () => {
      const resultado = validarStockDisponible(null, 5);

      expect(resultado.disponible).toBe(false);
      expect(resultado.mensaje).toBe('Producto no válido');
    });

    test('Negativa: cantidad inválida', () => {
      const producto = { stock: 10 };
      const resultado = validarStockDisponible(producto, -1);

      expect(resultado.disponible).toBe(false);
      expect(resultado.mensaje).toBe('Cantidad no válida');
    });
  });
});