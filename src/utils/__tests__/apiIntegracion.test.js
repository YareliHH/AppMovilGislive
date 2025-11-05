/* eslint-disable no-undef */
/* eslint-disable import/no-unresolved */
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
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
  deleteProducto,
} from '@/api/productos';

describe('Integración Frontend-Backend para Productos', () => {
  let axiosMock;

  beforeEach(() => {
    global.fetch.mockClear();
    axiosMock = new MockAdapter(axios);
  });

  afterEach(() => {
    axiosMock.reset();
  });

  // Productos - Obtener todos
  test('Positiva: carga productos correctamente', async () => {
    const mockProductos = [
      { 
        id: 1, 
        nombre_producto: 'Uniforme Clínico', 
        descripcion: 'Uniforme de alta calidad',
        precio: 500,
        stock: 10,
        id_categoria: 1,
        id_color: 1,
        id_talla: 1,
        id_genero: 1
      },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(mockProductos),
      text: jest.fn().mockResolvedValue(JSON.stringify(mockProductos)),
    });

    const response = await fetchProductos();

    expect(global.fetch).toHaveBeenCalledWith(
      'https://backend-gis-1.onrender.com/api/obtener',
      expect.objectContaining({ method: 'GET', headers: { 'Content-Type': 'application/json' } })
    );
    expect(response).toEqual(mockProductos);
  });

  test('Negativa: maneja error al cargar productos', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: jest.fn().mockResolvedValue('Server error'),
    });

    await expect(fetchProductos()).rejects.toThrow('Error al cargar productos: 500 Server error');
  });

  // Productos - Obtener por ID
  test('Positiva: carga producto por ID correctamente', async () => {
    const mockProducto = { 
      id: 1, 
      nombre_producto: 'Uniforme Clínico', 
      descripcion: 'Uniforme de alta calidad',
      precio: 500,
      stock: 10
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(mockProducto),
      text: jest.fn().mockResolvedValue(JSON.stringify(mockProducto)),
    });

    const id = 1;
    const response = await fetchProductoById(id);

    expect(global.fetch).toHaveBeenCalledWith(
      `https://backend-gis-1.onrender.com/api/obtener/${id}`,
      expect.objectContaining({ method: 'GET', headers: { 'Content-Type': 'application/json' } })
    );
    expect(response).toEqual(mockProducto);
  });

  test('Negativa: maneja error al cargar producto por ID', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: jest.fn().mockResolvedValue('Producto no encontrado'),
    });

    const id = 999;
    await expect(fetchProductoById(id)).rejects.toThrow('Error al cargar el producto: 404 Producto no encontrado');
  });

  // Imágenes - Obtener por producto
  test('Positiva: carga imágenes de producto correctamente', async () => {
    const mockImagenes = [
      { id: 1, url: 'https://example.com/image1.jpg', id_producto: 1 },
      { id: 2, url: 'https://example.com/image2.jpg', id_producto: 1 }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(mockImagenes),
      text: jest.fn().mockResolvedValue(JSON.stringify(mockImagenes)),
    });

    const id = 1;
    const response = await fetchImagenesProducto(id);

    expect(global.fetch).toHaveBeenCalledWith(
      `https://backend-gis-1.onrender.com/api/imagenes/${id}`,
      expect.objectContaining({ method: 'GET', headers: { 'Content-Type': 'application/json' } })
    );
    expect(response).toEqual(mockImagenes);
  });

  test('Negativa: maneja error al cargar imágenes', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: jest.fn().mockResolvedValue('Server error'),
    });

    const id = 1;
    await expect(fetchImagenesProducto(id)).rejects.toThrow('Error al cargar imágenes: 500 Server error');
  });

  // Categorías
  test('Positiva: carga categorías correctamente', async () => {
    const mockCategorias = [
      { id_categoria: 1, nombre: 'Uniformes Médicos' },
      { id_categoria: 2, nombre: 'Accesorios' }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(mockCategorias),
      text: jest.fn().mockResolvedValue(JSON.stringify(mockCategorias)),
    });

    const response = await fetchCategorias();

    expect(global.fetch).toHaveBeenCalledWith(
      'https://backend-gis-1.onrender.com/api/obtenercat',
      expect.objectContaining({ method: 'GET', headers: { 'Content-Type': 'application/json' } })
    );
    expect(response).toEqual(mockCategorias);
  });

  test('Negativa: maneja error al cargar categorías', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: jest.fn().mockResolvedValue('Server error'),
    });

    await expect(fetchCategorias()).rejects.toThrow('Error al cargar categorías: 500 Server error');
  });

  // Colores
  test('Positiva: carga colores correctamente', async () => {
    const mockColores = [
      { id: 1, color: 'Azul' },
      { id: 2, color: 'Blanco' }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(mockColores),
      text: jest.fn().mockResolvedValue(JSON.stringify(mockColores)),
    });

    const response = await fetchColores();

    expect(global.fetch).toHaveBeenCalledWith(
      'https://backend-gis-1.onrender.com/api/colores',
      expect.objectContaining({ method: 'GET', headers: { 'Content-Type': 'application/json' } })
    );
    expect(response).toEqual(mockColores);
  });

  test('Negativa: maneja error al cargar colores', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: jest.fn().mockResolvedValue('Server error'),
    });

    await expect(fetchColores()).rejects.toThrow('Error al cargar colores: 500 Server error');
  });

  // Tallas
  test('Positiva: carga tallas correctamente', async () => {
    const mockTallas = [
      { id: 1, talla: 'S' },
      { id: 2, talla: 'M' },
      { id: 3, talla: 'L' }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(mockTallas),
      text: jest.fn().mockResolvedValue(JSON.stringify(mockTallas)),
    });

    const response = await fetchTallas();

    expect(global.fetch).toHaveBeenCalledWith(
      'https://backend-gis-1.onrender.com/api/tallas',
      expect.objectContaining({ method: 'GET', headers: { 'Content-Type': 'application/json' } })
    );
    expect(response).toEqual(mockTallas);
  });

  test('Negativa: maneja error al cargar tallas', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: jest.fn().mockResolvedValue('Server error'),
    });

    await expect(fetchTallas()).rejects.toThrow('Error al cargar tallas: 500 Server error');
  });

  // Géneros
  test('Positiva: carga géneros correctamente', async () => {
    const mockGeneros = [
      { id: 1, genero: 'Hombre' },
      { id: 2, genero: 'Mujer' }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(mockGeneros),
      text: jest.fn().mockResolvedValue(JSON.stringify(mockGeneros)),
    });

    const response = await fetchGeneros();

    expect(global.fetch).toHaveBeenCalledWith(
      'https://backend-gis-1.onrender.com/api/generos',
      expect.objectContaining({ method: 'GET', headers: { 'Content-Type': 'application/json' } })
    );
    expect(response).toEqual(mockGeneros);
  });

  test('Negativa: maneja error al cargar géneros', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: jest.fn().mockResolvedValue('Server error'),
    });

    await expect(fetchGeneros()).rejects.toThrow('Error al cargar géneros: 500 Server error');
  });

  // Crear Producto
  test('Positiva: crea producto correctamente', async () => {
    const mockProducto = { 
      id: 1, 
      nombre_producto: 'Nuevo Uniforme',
      descripcion: 'Uniforme nuevo',
      precio: 600,
      stock: 15
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: jest.fn().mockResolvedValue(mockProducto),
      text: jest.fn().mockResolvedValue(JSON.stringify(mockProducto)),
    });

    const formData = new FormData();
    formData.append('nombre_producto', 'Nuevo Uniforme');
    formData.append('descripcion', 'Uniforme nuevo');
    formData.append('precio', '600');
    formData.append('stock', '15');

    const response = await createProducto(formData);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://backend-gis-1.onrender.com/api/agregarproducto',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formData,
      })
    );
    expect(response).toEqual(mockProducto);
  });

  test('Negativa: maneja error al crear producto', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: jest.fn().mockResolvedValue('Datos inválidos'),
    });

    const formData = new FormData();
    await expect(createProducto(formData)).rejects.toThrow('Error al crear producto: 400 Datos inválidos');
  });

  // Actualizar Producto
  test('Positiva: actualiza producto correctamente', async () => {
    const mockProducto = { 
      id: 1, 
      nombre_producto: 'Uniforme Actualizado',
      descripcion: 'Descripción actualizada',
      precio: 650,
      stock: 20
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(mockProducto),
      text: jest.fn().mockResolvedValue(JSON.stringify(mockProducto)),
    });

    const id = 1;
    const formData = new FormData();
    formData.append('nombre_producto', 'Uniforme Actualizado');
    formData.append('precio', '650');

    const response = await updateProducto(id, formData);

    expect(global.fetch).toHaveBeenCalledWith(
      `https://backend-gis-1.onrender.com/api/actualizar/${id}`,
      expect.objectContaining({
        method: 'PUT',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formData,
      })
    );
    expect(response).toEqual(mockProducto);
  });

  test('Negativa: maneja error al actualizar producto', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: jest.fn().mockResolvedValue('Producto no encontrado'),
    });

    const id = 999;
    const formData = new FormData();
    await expect(updateProducto(id, formData)).rejects.toThrow('Error al actualizar producto: 404 Producto no encontrado');
  });

  // Eliminar Producto
  test('Positiva: elimina producto correctamente', async () => {
    const mockResponse = { message: 'Producto eliminado exitosamente' };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue(mockResponse),
      text: jest.fn().mockResolvedValue(JSON.stringify(mockResponse)),
    });

    const id = 1;
    const response = await deleteProducto(id);

    expect(global.fetch).toHaveBeenCalledWith(
      `https://backend-gis-1.onrender.com/api/eliminar/${id}`,
      expect.objectContaining({ method: 'DELETE', headers: { 'Content-Type': 'application/json' } })
    );
    expect(response).toEqual(mockResponse);
  });

  test('Negativa: maneja error al eliminar producto', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: jest.fn().mockResolvedValue('Producto no encontrado'),
    });

    const id = 999;
    await expect(deleteProducto(id)).rejects.toThrow('Error al eliminar producto: 404 Producto no encontrado');
  });
});