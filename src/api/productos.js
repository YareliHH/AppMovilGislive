// src/api/productos.js
const API_BASE_URL = 'https://backend-gis-1.onrender.com/api';

export const fetchProductos = async () => {
  const response = await fetch(`${API_BASE_URL}/obtener`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al cargar productos: ${response.status} ${errorText}`);
  }

  return response.json();
};

export const fetchProductoById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/obtener/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al cargar el producto: ${response.status} ${errorText}`);
  }

  return response.json();
};

export const fetchImagenesProducto = async (id) => {
  const response = await fetch(`${API_BASE_URL}/imagenes/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al cargar imágenes: ${response.status} ${errorText}`);
  }

  return response.json();
};

export const fetchCategorias = async () => {
  const response = await fetch(`${API_BASE_URL}/obtenercat`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al cargar categorías: ${response.status} ${errorText}`);
  }

  return response.json();
};

export const fetchColores = async () => {
  const response = await fetch(`${API_BASE_URL}/colores`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al cargar colores: ${response.status} ${errorText}`);
  }

  return response.json();
};

export const fetchTallas = async () => {
  const response = await fetch(`${API_BASE_URL}/tallas`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al cargar tallas: ${response.status} ${errorText}`);
  }

  return response.json();
};

export const fetchGeneros = async () => {
  const response = await fetch(`${API_BASE_URL}/generos`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al cargar géneros: ${response.status} ${errorText}`);
  }

  return response.json();
};

export const createProducto = async (formData) => {
  const response = await fetch(`${API_BASE_URL}/agregarproducto`, {
    method: 'POST',
    headers: { 'Content-Type': 'multipart/form-data' },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al crear producto: ${response.status} ${errorText}`);
  }

  return response.json();
};

export const updateProducto = async (id, formData) => {
  const response = await fetch(`${API_BASE_URL}/actualizar/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'multipart/form-data' },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al actualizar producto: ${response.status} ${errorText}`);
  }

  return response.json();
};

export const deleteProducto = async (id) => {
  const response = await fetch(`${API_BASE_URL}/eliminar/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al eliminar producto: ${response.status} ${errorText}`);
  }

  return response.json();
};