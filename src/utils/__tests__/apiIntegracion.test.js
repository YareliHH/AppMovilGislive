/* eslint-disable no-undef */
/* eslint-disable import/no-unresolved */
// ❌ ELIMINA ESTAS DOS LÍNEAS
// import MockAdapter from 'axios-mock-adapter';
// import axios from 'axios';

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

// Mock de fetch
global.fetch = jest.fn();

describe('Integración Frontend-Backend para Productos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // axiosMock = new MockAdapter(axios);
  });

  afterEach(() => {
    // axiosMock.reset();
  });

  
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

  // ... resto de tus tests
});