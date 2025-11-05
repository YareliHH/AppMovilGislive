const BACKEND_URL = "https://backend-gis-1.onrender.com/api";

// Obtener todos los productos
export async function fetchProductos() {
  const response = await fetch(
    `${BACKEND_URL}/obtener`,
    { method: 'GET', headers: { 'Content-Type': 'application/json' } }
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error al cargar productos: ${response.status} ${text}`);
  }
  return response.json();
}

// Obtener un producto por ID
export async function fetchProductoById(id) {
  const response = await fetch(
    `${BACKEND_URL}/obtener/${id}`,
    { method: 'GET', headers: { 'Content-Type': 'application/json' } }
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error al cargar el producto: ${response.status} ${text}`);
  }
  return response.json();
}

// Obtener imágenes de un producto
export async function fetchImagenesProducto(id) {
  const response = await fetch(
    `${BACKEND_URL}/imagenes/${id}`,
    { method: 'GET', headers: { 'Content-Type': 'application/json' } }
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error al cargar imágenes: ${response.status} ${text}`);
  }
  return response.json();
}

// Obtener categorías
export async function fetchCategorias() {
  const response = await fetch(
    `${BACKEND_URL}/obtenercat`,
    { method: 'GET', headers: { 'Content-Type': 'application/json' } }
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error al cargar categorías: ${response.status} ${text}`);
  }
  return response.json();
}

// Obtener colores
export async function fetchColores() {
  const response = await fetch(
    `${BACKEND_URL}/colores`,
    { method: 'GET', headers: { 'Content-Type': 'application/json' } }
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error al cargar colores: ${response.status} ${text}`);
  }
  return response.json();
}

// Obtener tallas
export async function fetchTallas() {
  const response = await fetch(
    `${BACKEND_URL}/tallas`,
    { method: 'GET', headers: { 'Content-Type': 'application/json' } }
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error al cargar tallas: ${response.status} ${text}`);
  }
  return response.json();
}

// Obtener géneros
export async function fetchGeneros() {
  const response = await fetch(
    `${BACKEND_URL}/generos`,
    { method: 'GET', headers: { 'Content-Type': 'application/json' } }
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error al cargar géneros: ${response.status} ${text}`);
  }
  return response.json();
}

// Crear un nuevo producto
export async function createProducto(formData) {
  const response = await fetch(
    `${BACKEND_URL}/agregarproducto`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data' },
      body: formData,
    }
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error al crear producto: ${response.status} ${text}`);
  }
  return response.json();
}

// Actualizar un producto
export async function updateProducto(id, formData) {
  const response = await fetch(
    `${BACKEND_URL}/actualizar/${id}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'multipart/form-data' },
      body: formData,
    }
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error al actualizar producto: ${response.status} ${text}`);
  }
  return response.json();
}

// Eliminar un producto
export async function deleteProducto(id) {
  const response = await fetch(
    `${BACKEND_URL}/eliminar/${id}`,
    { method: 'DELETE', headers: { 'Content-Type': 'application/json' } }
  );
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Error al eliminar producto: ${response.status} ${text}`);
  }
  return response.json();
}