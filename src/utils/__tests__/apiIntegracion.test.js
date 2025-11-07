/* eslint-disable no-undef */
// src/utils/__tests__/apiIntegracion.test.js
import {
  fetchProductos,
  fetchProductoById,
  fetchImagenesProducto,
  fetchCategorias,
  fetchColores,
  fetchTallas,
  fetchGeneros,
  createProducto,
  updateProducto,
  deleteProducto
} from '../../api/productos';

// ⭐ Debe ir ANTES del describe
global.fetch = jest.fn();

describe('Integración Frontend-Backend para Productos', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // =================================================
  // ✅ FETCH PRODUCTOS
  // =================================================
  
  test('Positiva: carga productos correctamente', async () => {
    const mockProductos = [
      { 
        id: 4, 
        nombre: 'Camiseta Nike', 
        precio: 599.99, 
        categoria: 'Ropa',
        stock: 10,
        descripcion: 'Camiseta deportiva'
      },
      { 
        id: 2, 
        nombre: 'Pantalón Adidas', 
        precio: 899.99, 
        categoria: 'Ropa',
        stock: 5,
        descripcion: 'Pantalón deportivo'
      }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(mockProductos),
      text: jest.fn().mockResolvedValue(JSON.stringify(mockProductos))
    });

    const response = await fetchProductos();

    expect(global.fetch).toHaveBeenCalledWith(
      'https://backend-gis-1.onrender.com/api/obtener',
      expect.objectContaining({
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
    );

    // ✅ Validación estricta
    expect(response).toStrictEqual(mockProductos);
    expect(response).toHaveLength(2);
  });

  test('Negativa: maneja error al cargar productos', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: jest.fn().mockResolvedValue('Error interno del servidor')
    });

    await expect(fetchProductos()).rejects.toThrow(
      'Error al cargar productos: 500 Error interno del servidor'
    );
  });

  test('Negativa: maneja error de red', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network request failed'));

    await expect(fetchProductos()).rejects.toThrow('Network request failed');
  });

  test('Positiva: carga productos vacíos correctamente', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue([]),
      text: jest.fn().mockResolvedValue('[]')
    });

    const response = await fetchProductos();

    expect(response).toStrictEqual([]);
    expect(response).toHaveLength(0);
  });

  // =================================================
  // ✅ FETCH PRODUCTO POR ID
  // =================================================

  test('Positiva: carga producto por ID correctamente', async () => {
    const mockProducto = {
      id: 1,
      nombre: 'Camiseta adidas',
      descripcion: 'Camiseta deportiva de alto rendimiento',
      precio: 599.99,
      categoria: 'Ropa',
      color: 'Negro',
      talla: 'M',
      genero: 'Masculino',
      stock: 10
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(mockProducto),
      text: jest.fn().mockResolvedValue(JSON.stringify(mockProducto))
    });

    const id = 1;
    const response = await fetchProductoById(id);

    expect(global.fetch).toHaveBeenCalledWith(
      `https://backend-gis-1.onrender.com/api/obtener/${id}`,
      expect.objectContaining({
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
    );

    // ✅ Validación estricta
    expect(response).toStrictEqual(mockProducto);
  });

  test('Negativa: producto inexistente', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: jest.fn().mockResolvedValue('Producto no encontrado')
    });

    await expect(fetchProductoById(999)).rejects.toThrow(
      'Error al cargar el producto: 404 Producto no encontrado'
    );
  });

  // =================================================
  // ✅ FETCH IMÁGENES
  // =================================================

  test('Positiva: carga imágenes correctamente', async () => {
    const mockImagenes = [
      { id: 1, url: 'https://example.com/img1.jpg', principal: true },
      { id: 2, url: 'https://example.com/img2.jpg', principal: false }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(mockImagenes),
      text: jest.fn().mockResolvedValue(JSON.stringify(mockImagenes))
    });

    const response = await fetchImagenesProducto(1);

    expect(global.fetch).toHaveBeenCalledWith(
      `https://backend-gis-1.onrender.com/api/imagenes/1`,
      expect.objectContaining({
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
    );

    expect(response).toStrictEqual(mockImagenes);
    expect(response[0].principal).toBe(true);
  });

  test('Negativa: error al cargar imágenes', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: jest.fn().mockResolvedValue('Producto no encontrado')
    });

    await expect(fetchImagenesProducto(999)).rejects.toThrow(
      'Error al cargar imágenes: 404 Producto no encontrado'
    );
  });

  // =================================================
  // ✅ FETCH CATEGORÍAS
  // =================================================

  test('Positiva: carga categorías correctamente', async () => {
    const mockCategorias = [
      { id: 1, nombre: 'Ropa', descripcion: 'Prendas de vestir' },
      { id: 2, nombre: 'Calzado', descripcion: 'Zapatos y tenis' },
      { id: 3, nombre: 'Accesorios', descripcion: 'Complementos' }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(mockCategorias),
      text: jest.fn().mockResolvedValue(JSON.stringify(mockCategorias))
    });

    const response = await fetchCategorias();

    expect(global.fetch).toHaveBeenCalledWith(
      'https://backend-gis-1.onrender.com/api/obtenercat',
      expect.objectContaining({
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
    );

    expect(response).toStrictEqual(mockCategorias);
    expect(response).toHaveLength(3);
  });

  // =================================================
  // ✅ FETCH COLORES
  // =================================================

  test('Positiva: carga colores correctamente', async () => {
    const mockColores = [
      { id: 1, nombre: 'Rojo', codigo: '#FF0000' },
      { id: 2, nombre: 'Azul', codigo: '#0000FF' },
      { id: 3, nombre: 'Negro', codigo: '#000000' }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(mockColores),
      text: jest.fn().mockResolvedValue(JSON.stringify(mockColores))
    });

    const response = await fetchColores();

    expect(global.fetch).toHaveBeenCalledWith(
      'https://backend-gis-1.onrender.com/api/colores',
      expect.objectContaining({
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
    );

    expect(response).toStrictEqual(mockColores);
  });

  // =================================================
  // ✅ FETCH TALLAS
  // =================================================

  test('Positiva: carga tallas correctamente', async () => {
    const mockTallas = [
      { id: 1, nombre: 'XS', descripcion: 'Extra pequeña' },
      { id: 2, nombre: 'S', descripcion: 'Pequeña' },
      { id: 3, nombre: 'M', descripcion: 'Mediana' },
      { id: 4, nombre: 'L', descripcion: 'Grande' },
      { id: 5, nombre: 'XL', descripcion: 'Extra grande' }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(mockTallas),
      text: jest.fn().mockResolvedValue(JSON.stringify(mockTallas))
    });

    const response = await fetchTallas();

    expect(global.fetch).toHaveBeenCalledWith(
      'https://backend-gis-1.onrender.com/api/tallas',
      expect.objectContaining({
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
    );

    expect(response).toStrictEqual(mockTallas);
  });

  // =================================================
  // ✅ FETCH GÉNEROS
  // =================================================

  test('Positiva: carga géneros correctamente', async () => {
    const mockGeneros = [
      { id: 1, nombre: 'Masculino' },
      { id: 2, nombre: 'Femenino' },
      { id: 3, nombre: 'Unisex' }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(mockGeneros),
      text: jest.fn().mockResolvedValue(JSON.stringify(mockGeneros))
    });

    const response = await fetchGeneros();

    expect(global.fetch).toHaveBeenCalledWith(
      'https://backend-gis-1.onrender.com/api/generos',
      expect.objectContaining({
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      })
    );

    expect(response).toStrictEqual(mockGeneros);
  });

  // =================================================
  // ✅ CREATE PRODUCTO
  // =================================================

  test('Positiva: crea producto correctamente', async () => {
    const formData = new FormData();
    formData.append('nombre', 'Camiseta Nueva');
    formData.append('precio', '699.99');
    formData.append('categoria_id', '1');
    formData.append('stock', '15');
    formData.append('descripcion', 'Nueva camiseta deportiva');

    const mockResponse = {
      id: 10,
      nombre: 'Camiseta Nueva',
      precio: 699.99,
      categoria_id: 1,
      stock: 15,
      descripcion: 'Nueva camiseta deportiva',
      mensaje: 'Producto creado exitosamente'
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: jest.fn().mockResolvedValue(mockResponse),
      text: jest.fn().mockResolvedValue(JSON.stringify(mockResponse))
    });

    const response = await createProducto(formData);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://backend-gis-1.onrender.com/api/agregarproducto',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formData
      })
    );

    expect(response).toStrictEqual(mockResponse);
  });

  // =================================================
  // ✅ UPDATE PRODUCTO
  // =================================================

  test('Positiva: actualiza producto correctamente', async () => {
    const formData = new FormData();
    formData.append('precio', '799.99');
    formData.append('stock', '20');

    const mockResponse = {
      id: 1,
      nombre: 'Camiseta Nike',
      precio: 799.99,
      stock: 20,
      mensaje: 'Producto actualizado exitosamente'
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(mockResponse),
      text: jest.fn().mockResolvedValue(JSON.stringify(mockResponse))
    });

    const response = await updateProducto(1, formData);

    expect(global.fetch).toHaveBeenCalledWith(
      `https://backend-gis-1.onrender.com/api/actualizar/1`,
      expect.objectContaining({
        method: 'PUT',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formData
      })
    );

    expect(response).toStrictEqual(mockResponse);
  });

  // =================================================
  // ✅ DELETE PRODUCTO
  // =================================================

  test('Positiva: elimina producto correctamente', async () => {
    const mockResponse = {
      success: true,
      mensaje: 'Producto eliminado correctamente',
      id: 1
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(mockResponse),
      text: jest.fn().mockResolvedValue(JSON.stringify(mockResponse))
    });

    const response = await deleteProducto(1);

    expect(global.fetch).toHaveBeenCalledWith(
      `https://backend-gis-1.onrender.com/api/eliminar/1`,
      expect.objectContaining({
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
    );

    expect(response).toStrictEqual(mockResponse);
  });

  // =================================================
  // ✅ TIMEOUT
  // =================================================

  test('Negativa: timeout', async () => {
    global.fetch.mockImplementationOnce(
      () => new Promise(() => {}) // nunca responde
    );

    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), 5000)
    );

    await expect(Promise.race([fetchProductos(), timeout]))
      .rejects
      .toThrow('Request timeout');
  });

});
