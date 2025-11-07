import React, { useState, useEffect, useMemo, useReducer } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  FlatList,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import axios from "axios";
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Feather, MaterialIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const BACKEND_URL = "https://backend-gis-1.onrender.com/api";

// Manual debounce function to avoid adding lodash dependency
const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

// Theme object for consistent styling
const theme = {
  colors: {
    primary: "#0277bd",
    danger: "#d32f2f",
    success: "#4caf50",
    background: "#f5f5f5",
    textPrimary: "#212121",
    textSecondary: "#666",
    border: "#ddd",
    error: "#d32f2f",
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
  },
  typography: {
    title: {
      fontSize: 20,
      fontWeight: "bold",
    },
    body: {
      fontSize: 16,
      color: "#424242",
    },
  },
};

// Common button styles
const commonButton = {
  padding: theme.spacing.medium,
  borderRadius: 12,
  alignItems: "center",
  justifyContent: "center",
};

// Form reducer for managing form state
const initialFormState = {
  values: {
    id: null,
    nombre_producto: "",
    descripcion: "",
    precio: "",
    stock: "",
    id_categoria: "",
    id_color: "",
    id_talla: "",
    id_genero: "",
  },
  errors: {},
};

const formReducer = (state, action) => {
  switch (action.type) {
    case "SET_VALUES":
      return { ...state, values: { ...state.values, ...action.payload } };
    case "SET_ERRORS":
      return { ...state, errors: action.payload };
    case "RESET":
      return initialFormState;
    default:
      return state;
  }
};

// ProductList Component
const ProductList = ({
  productos,
  tableLoading,
  handleOpenDetalles,
  fetchProductoById,
  handleOpenDeleteDialog,
  processColor,
}) => {
  const renderProducto = ({ item }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleOpenDetalles(item.id)}
    >
      <View style={styles.productHeader}>
        <Text style={styles.productName} numberOfLines={1}>{item.nombre_producto}</Text>
        <View style={styles.productActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              fetchProductoById(item.id);
            }}
          >
            <Feather name="edit" size={18} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={(e) => {
              e.stopPropagation();
              handleOpenDeleteDialog(item.id);
            }}
          >
            <Feather name="trash-2" size={18} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.productDescription} numberOfLines={2}>
        {item.descripcion}
      </Text>
      
      <View style={styles.productDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Precio:</Text>
          <Text style={styles.detailValue}>${Number(item.precio).toFixed(2)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Stock:</Text>
          <View style={[styles.stockBadge, item.stock > 0 ? styles.stockAvailable : styles.stockUnavailable]}>
            <Text style={styles.stockText}>{item.stock}</Text>
          </View>
        </View>
      </View>

      <View style={styles.productTags}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.categoria}</Text>
        </View>
        <View style={[styles.colorDot, { backgroundColor: processColor(item.color?.toLowerCase()) }]} />
        <Text style={styles.tagText}>{item.talla} | {item.genero}</Text>
      </View>
    </TouchableOpacity>
  );

  return tableLoading ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.loadingText}>Cargando productos...</Text>
    </View>
  ) : (
    <FlatList
      data={productos}
      renderItem={renderProducto}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <MaterialIcons name="inventory-2" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No se encontraron productos</Text>
        </View>
      }
    />
  );
};

// PaginationControls Component
const PaginationControls = ({ page, totalItems, rowsPerPage, setPage }) => {
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  return (
    <View style={styles.paginationContainer}>
      <TouchableOpacity
        style={[styles.paginationButton, page === 0 && styles.disabledButton]}
        onPress={() => setPage(page - 1)}
        disabled={page === 0}
      >
        <Feather name="chevron-left" size={24} color={page === 0 ? "#ccc" : theme.colors.primary} />
      </TouchableOpacity>
      <Text style={styles.paginationText}>
        Página {page + 1} de {totalPages}
      </Text>
      <TouchableOpacity
        style={[styles.paginationButton, page >= totalPages - 1 && styles.disabledButton]}
        onPress={() => setPage(page + 1)}
        disabled={page >= totalPages - 1}
      >
        <Feather name="chevron-right" size={24} color={page >= totalPages - 1 ? "#ccc" : theme.colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

// ProductFormModal Component
const ProductFormModal = ({
  openDialog,
  setOpenDialog,
  editMode,
  categorias,
  colores,
  tallas,
  generos,
  formState,
  dispatchForm,
  selectedImages,
  setSelectedImages,
  loading,
  handleSubmit,
  pickImages,
  removeImage,
}) => {
  const { values, errors } = formState;

  return (
    <Modal
      visible={openDialog}
      animationType="slide"
      transparent={false}
      onRequestClose={() => setOpenDialog(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {editMode ? "Editar Producto" : "Nuevo Producto"}
          </Text>
          <TouchableOpacity onPress={() => setOpenDialog(false)}>
            <Feather name="x" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <TextInput
            style={[styles.input, errors.nombre_producto && styles.inputError]}
            placeholder="Nombre del producto *"
            value={values.nombre_producto}
            onChangeText={(text) => dispatchForm({ type: "SET_VALUES", payload: { nombre_producto: text } })}
          />
          {errors.nombre_producto && (
            <Text style={styles.errorText}>{errors.nombre_producto}</Text>
          )}

          <TextInput
            style={[styles.input, styles.textArea, errors.descripcion && styles.inputError]}
            placeholder="Descripción *"
            value={values.descripcion}
            onChangeText={(text) => dispatchForm({ type: "SET_VALUES", payload: { descripcion: text } })}
            multiline
            numberOfLines={4}
          />
          {errors.descripcion && (
            <Text style={styles.errorText}>{errors.descripcion}</Text>
          )}

          <TextInput
            style={[styles.input, errors.precio && styles.inputError]}
            placeholder="Precio *"
            value={values.precio}
            onChangeText={(text) => dispatchForm({ type: "SET_VALUES", payload: { precio: text } })}
            keyboardType="numeric"
          />
          {errors.precio && (
            <Text style={styles.errorText}>{errors.precio}</Text>
          )}

          <TextInput
            style={[styles.input, errors.stock && styles.inputError]}
            placeholder="Stock *"
            value={values.stock}
            onChangeText={(text) => dispatchForm({ type: "SET_VALUES", payload: { stock: text } })}
            keyboardType="numeric"
          />
          {errors.stock && (
            <Text style={styles.errorText}>{errors.stock}</Text>
          )}

          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Categoría *</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={values.id_categoria}
                onValueChange={(value) => dispatchForm({ type: "SET_VALUES", payload: { id_categoria: value } })}
                style={styles.picker}
              >
                <Picker.Item label="Seleccione una categoría" value="" />
                {categorias.map((cat) => (
                  <Picker.Item key={cat.id_categoria} label={cat.nombre} value={cat.id_categoria} />
                ))}
              </Picker>
            </View>
          </View>
          {errors.id_categoria && <Text style={styles.errorText}>{errors.id_categoria}</Text>}

          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Color *</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={values.id_color}
                onValueChange={(value) => dispatchForm({ type: "SET_VALUES", payload: { id_color: value } })}
                style={styles.picker}
              >
                <Picker.Item label="Seleccione un color" value="" />
                {colores.map((color) => (
                  <Picker.Item key={color.id} label={color.color} value={color.id} />
                ))}
              </Picker>
            </View>
          </View>
          {errors.id_color && <Text style={styles.errorText}>{errors.id_color}</Text>}

          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Talla *</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={values.id_talla}
                onValueChange={(value) => dispatchForm({ type: "SET_VALUES", payload: { id_talla: value } })}
                style={styles.picker}
              >
                <Picker.Item label="Seleccione una talla" value="" />
                {tallas.map((talla) => (
                  <Picker.Item key={talla.id} label={talla.talla} value={talla.id} />
                ))}
              </Picker>
            </View>
          </View>
          {errors.id_talla && <Text style={styles.errorText}>{errors.id_talla}</Text>}

          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Género *</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={values.id_genero}
                onValueChange={(value) => dispatchForm({ type: "SET_VALUES", payload: { id_genero: value } })}
                style={styles.picker}
              >
                <Picker.Item label="Seleccione un género" value="" />
                {generos.map((genero) => (
                  <Picker.Item key={genero.id} label={genero.genero} value={genero.id} />
                ))}
              </Picker>
            </View>
          </View>
          {errors.id_genero && <Text style={styles.errorText}>{errors.id_genero}</Text>}

          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Imágenes del Producto</Text>
            
            <TouchableOpacity style={styles.imagePickerButton} onPress={pickImages}>
              <Feather name="image" size={24} color={theme.colors.primary} />
              <Text style={styles.imagePickerText}>Seleccionar Imágenes</Text>
            </TouchableOpacity>

            {selectedImages.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageGridScroll}>
                <View style={styles.imageGrid}>
                  {selectedImages.map((image, index) => (
                    <View key={index} style={styles.imagePreview}>
                      <Image
                        source={{ uri: image.uri || image.url }}
                        style={styles.previewImage}
                      />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => removeImage(index)}
                      >
                        <Feather name="x" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => setOpenDialog(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {editMode ? "Actualizar" : "Guardar"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

// ProductDetailsModal Component
const ProductDetailsModal = ({
  detallesOpen,
  handleCloseDetalles,
  productoDetalles,
  loading,
  processColor,
  openImagePreview,
  fetchProductoById,
}) => {
  return (
    <Modal
      visible={detallesOpen}
      animationType="slide"
      transparent={false}
      onRequestClose={handleCloseDetalles}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Detalles del Producto</Text>
          <TouchableOpacity onPress={handleCloseDetalles}>
            <Feather name="x" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.skeletonContainer}>
            <View style={styles.skeletonImage} />
            <View style={styles.skeletonText} />
            <View style={styles.skeletonText} />
            <View style={styles.skeletonText} />
          </View>
        ) : productoDetalles ? (
          <ScrollView style={styles.modalContent}>
            <View style={styles.detailsContainer}>
              {productoDetalles.imagenes && productoDetalles.imagenes.length > 0 && (
                <Image
                  source={{ uri: productoDetalles.imagenes[0].url }}
                  style={styles.detailsImage}
                />
              )}

              <Text style={styles.detailsTitle}>{productoDetalles.nombre_producto}</Text>
              <Text style={styles.detailsPrice}>${Number(productoDetalles.precio).toFixed(2)}</Text>
              
              <View style={styles.detailsInfo}>
                <Text style={styles.detailsLabel}>Descripción:</Text>
                <Text style={styles.detailsText}>{productoDetalles.descripcion}</Text>
              </View>

              <View style={styles.detailsInfo}>
                <Text style={styles.detailsLabel}>Stock:</Text>
                <Text style={styles.detailsText}>{productoDetalles.stock}</Text>
              </View>

              <View style={styles.detailsInfo}>
                <Text style={styles.detailsLabel}>Categoría:</Text>
                <Text style={styles.detailsText}>{productoDetalles.categoria}</Text>
              </View>

              <View style={styles.detailsInfo}>
                <Text style={styles.detailsLabel}>Color:</Text>
                <View style={styles.colorRow}>
                  <View style={[styles.colorIndicator, { backgroundColor: processColor(productoDetalles.color?.toLowerCase()) }]} />
                  <Text style={styles.detailsText}>{productoDetalles.color}</Text>
                </View>
              </View>

              <View style={styles.detailsInfo}>
                <Text style={styles.detailsLabel}>Talla:</Text>
                <Text style={styles.detailsText}>{productoDetalles.talla}</Text>
              </View>

              <View style={styles.detailsInfo}>
                <Text style={styles.detailsLabel}>Género:</Text>
                <Text style={styles.detailsText}>{productoDetalles.genero}</Text>
              </View>

              {productoDetalles.imagenes && productoDetalles.imagenes.length > 1 && (
                <View style={styles.imageGallery}>
                  <Text style={styles.detailsLabel}>Galería de Imágenes:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {productoDetalles.imagenes.map((img, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => openImagePreview(productoDetalles.imagenes)}
                      >
                        <Image
                          source={{ uri: img.url }}
                          style={styles.galleryImage}
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.button, styles.submitButton, { width: '100%', marginTop: 20, marginBottom: 40 }]}
              onPress={() => {
                handleCloseDetalles();
                fetchProductoById(productoDetalles.id);
              }}
            >
              <Text style={styles.submitButtonText}>Editar Producto</Text>
            </TouchableOpacity>
          </ScrollView>
        ) : null}
      </SafeAreaView>
    </Modal>
  );
};

// DeleteConfirmationModal Component
const DeleteConfirmationModal = ({
  deleteDialogOpen,
  handleCloseDeleteDialog,
  handleEliminarProducto,
}) => {
  return (
    <Modal
      visible={deleteDialogOpen}
      animationType="fade"
      transparent={true}
      onRequestClose={handleCloseDeleteDialog}
    >
      <View style={styles.deleteModalOverlay}>
        <View style={styles.deleteModalContent}>
          <View style={styles.deleteModalHeader}>
            <Feather name="alert-triangle" size={48} color={theme.colors.danger} />
            <Text style={styles.deleteModalTitle}>Confirmar Eliminación</Text>
          </View>
          
          <Text style={styles.deleteModalText}>
            ¿Está seguro que desea eliminar este producto? Esta acción no se puede deshacer.
          </Text>

          <View style={styles.deleteModalActions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCloseDeleteDialog}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.deleteButtonModal]}
              onPress={handleEliminarProducto}
            >
              <Text style={styles.submitButtonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ImagePreviewModal Component
const ImagePreviewModal = ({
  previewOpen,
  closeImagePreview,
  previewImages,
}) => {
  return (
    <Modal
      visible={previewOpen}
      animationType="fade"
      transparent={true}
      onRequestClose={closeImagePreview}
    >
      <View style={styles.previewModalOverlay}>
        <TouchableOpacity
          style={styles.previewCloseButton}
          onPress={closeImagePreview}
        >
          <Feather name="x" size={32} color="#fff" />
        </TouchableOpacity>
        
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.previewScrollContent}
        >
          {previewImages.map((img, index) => (
            <View key={index} style={styles.previewImageContainer}>
              <Image
                source={{ uri: img.url }}
                style={styles.previewFullImage}
                resizeMode="contain"
              />
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
};

// Main Component
const ProductoFormMejorado = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [colores, setColores] = useState([]);
  const [tallas, setTallas] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [filters, setFilters] = useState({
    nombre: "",
    categoria: "",
    color: "",
    talla: "",
    genero: "",
  });
  const [openFilters, setOpenFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [editMode, setEditMode] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [detallesOpen, setDetallesOpen] = useState(false);
  const [productoDetalles, setProductoDetalles] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const [formState, dispatchForm] = useReducer(formReducer, initialFormState);

  // Centralized error handler
  const handleApiError = (error, defaultMessage) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      defaultMessage;
    setSnackbar({
      open: true,
      message,
      severity: "error",
    });
  };

  const validateForm = () => {
    const errors = {};
    const { values } = formState;
    if (!values.nombre_producto || values.nombre_producto.length < 2) {
      errors.nombre_producto = "El nombre debe tener al menos 2 caracteres";
    }
    if (!values.descripcion || values.descripcion.length < 10) {
      errors.descripcion = "La descripción debe tener al menos 10 caracteres";
    }
    if (!values.precio || parseFloat(values.precio) <= 0) {
      errors.precio = "El precio debe ser mayor que 0";
    }
    if (!values.stock || parseInt(values.stock) < 0) {
      errors.stock = "El stock no puede ser negativo";
    }
    if (!values.id_categoria) errors.id_categoria = "Debe seleccionar una categoría";
    if (!values.id_color) errors.id_color = "Debe seleccionar un color";
    if (!values.id_talla) errors.id_talla = "Debe seleccionar una talla";
    if (!values.id_genero) errors.id_genero = "Debe seleccionar un género";
    
    dispatchForm({ type: "SET_ERRORS", payload: errors });
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: "Por favor corrija los errores del formulario",
        severity: "error",
      });
      return;
    }

    if (selectedImages.length === 0 && !editMode) {
      setSnackbar({
        open: true,
        message: "Debe subir al menos una imagen",
        severity: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      const { values } = formState;

      Object.keys(values).forEach((key) => {
        if (key !== "id" && values[key] !== null && values[key] !== undefined) {
          formData.append(key, values[key]);
        }
      });

      selectedImages.forEach((img) => {
        if (!img.isExisting && img.file) {
          formData.append("imagenes", {
            uri: img.uri,
            type: img.type || 'image/jpeg',
            name: img.fileName || `image_${Date.now()}.jpg`
          });
        }
      });

      const existingImageIds = selectedImages
        .filter((img) => img.isExisting)
        .map((img) => img.id);

      if (existingImageIds.length > 0) {
        formData.append("mantenerImagenes", JSON.stringify(existingImageIds));
      }

      if (editMode) {
        await axios.put(`${BACKEND_URL}/actualizar/${values.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSnackbar({
          open: true,
          message: "Producto actualizado con éxito",
          severity: "success",
        });
      } else {
        await axios.post(`${BACKEND_URL}/agregarproducto`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setSnackbar({
          open: true,
          message: "Producto creado con éxito",
          severity: "success",
        });
      }

      resetForm();
      setSelectedImages([]);
      setEditMode(false);
      setOpenDialog(false);
      fetchProductos();
    } catch (error) {
      handleApiError(error, `Error al ${editMode ? "actualizar" : "crear"} el producto`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    dispatchForm({ type: "RESET" });
  };

  const pickImages = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permiso denegado", "Se requiere permiso para acceder a la galería");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.filter((asset) => {
        const isValidType = ["image/jpeg", "image/png"].includes(asset.mimeType);
        const isValidSize = asset.fileSize <= 5 * 1024 * 1024; // 5MB limit
        if (!isValidType) {
          setSnackbar({
            open: true,
            message: "Solo se permiten imágenes JPEG o PNG",
            severity: "error",
          });
        }
        if (!isValidSize) {
          setSnackbar({
            open: true,
            message: "La imagen excede el tamaño máximo de 5MB",
            severity: "error",
          });
        }
        return isValidType && isValidSize;
      }).map((asset) => ({
        uri: asset.uri,
        type: asset.mimeType || 'image/jpeg',
        fileName: asset.fileName || `image_${Date.now()}.jpg`,
        file: asset,
      }));
      setSelectedImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const filteredProductos = useMemo(() => {
    let filtered = [...productos];

    if (filters.nombre) {
      filtered = filtered.filter(item =>
        item.nombre_producto.toLowerCase().includes(filters.nombre.toLowerCase())
      );
    }

    if (filters.categoria) {
      filtered = filtered.filter(item =>
        item.id_categoria === filters.categoria
      );
    }

    if (filters.color) {
      filtered = filtered.filter(item =>
        item.id_color === filters.color
      );
    }

    if (filters.talla) {
      filtered = filtered.filter(item =>
        item.id_talla === filters.talla
      );
    }

    if (filters.genero) {
      filtered = filtered.filter(item =>
        item.id_genero === filters.genero
      );
    }

    return filtered;
  }, [productos, filters]);

  const paginatedProductos = useMemo(() => {
    return filteredProductos.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredProductos, page, rowsPerPage]);

  const fetchProductos = async () => {
    setTableLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/obtener`);
      setProductos(response.data);
    } catch (error) {
      handleApiError(error, "Error al cargar los productos");
    } finally {
      setTableLoading(false);
    }
  };

  const fetchCatalogos = async () => {
    try {
      const [categoriasRes, coloresRes, tallasRes, generosRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/obtenercat`),
        axios.get(`${BACKEND_URL}/colores`),
        axios.get(`${BACKEND_URL}/tallas`),
        axios.get(`${BACKEND_URL}/generos`),
      ]);

      setCategorias(categoriasRes.data);
      setColores(coloresRes.data);
      setTallas(tallasRes.data);
      setGeneros(generosRes.data);
    } catch (error) {
      handleApiError(error, "Error al cargar los catálogos");
    }
  };

  const fetchProductoById = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/obtener/${id}`);
      const producto = response.data;

      const imagenesResponse = await axios.get(`${BACKEND_URL}/imagenes/${id}`);
      const imagenes = imagenesResponse.data;

      dispatchForm({
        type: "SET_VALUES",
        payload: {
          id: producto.id,
          nombre_producto: producto.nombre_producto,
          descripcion: producto.descripcion,
          precio: producto.precio.toString(),
          stock: producto.stock.toString(),
          id_categoria: producto.id_categoria,
          id_color: producto.id_color,
          id_talla: producto.id_talla,
          id_genero: producto.id_genero,
        },
      });

      setSelectedImages(
        imagenes.map((img) => ({
          id: img.id,
          url: img.url,
          uri: img.url,
          isExisting: true,
        }))
      );

      setEditMode(true);
      setOpenDialog(true);
    } catch (error) {
      handleApiError(error, "Error al cargar el producto");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDeleteDialog = (id) => {
    setProductToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const handleEliminarProducto = async () => {
    if (!productToDelete) return;

    setLoading(true);
    try {
      await axios.delete(`${BACKEND_URL}/eliminar/${productToDelete}`);
      setSnackbar({
        open: true,
        message: "Producto eliminado con éxito",
        severity: "success",
      });
      fetchProductos();
    } catch (error) {
      handleApiError(error, "Error al eliminar el producto");
    } finally {
      setLoading(false);
      handleCloseDeleteDialog();
    }
  };

  const processColor = (colorString) => {
    if (colorString?.startsWith('#') || colorString?.startsWith('rgb')) {
      return colorString;
    }

    const colorMap = {
      'rojo': '#ff0000',
      'azul': '#0000ff',
      'verde': '#008000',
      'amarillo': '#ffff00',
      'negro': '#000000',
      'blanco': '#ffffff',
      'gris': '#808080',
      'naranja': '#ffa500',
      'morado': '#800080',
      'rosa': '#ffc0cb',
      'marrón': '#a52a2a',
      'cyan': '#00ffff',
      'beige': '#f5f5dc',
      'turquesa': '#40e0d0',
      'dorado': '#ffd700',
      'plateado': '#c0c0c0'
    };

    if (colorString && typeof colorString === 'string') {
      const normalizedColor = colorString.toLowerCase();
      if (colorMap[normalizedColor]) {
        return colorMap[normalizedColor];
      }
    }

    return '#cccccc';
  };

  const handleFilterChange = debounce((name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(0); // Reset page on filter change
  }, 300);

  const clearFilters = () => {
    setFilters({
      nombre: "",
      categoria: "",
      color: "",
      talla: "",
      genero: "",
    });
    setPage(0);
  };

  const handleOpenDetalles = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/obtener/${id}`);
      const imagenesResponse = await axios.get(`${BACKEND_URL}/imagenes/${id}`);

      const producto = response.data;
      producto.imagenes = imagenesResponse.data;

      setProductoDetalles(producto);
      setDetallesOpen(true);
    } catch (error) {
      handleApiError(error, "Error al cargar los detalles del producto");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDetalles = () => {
    setDetallesOpen(false);
    setProductoDetalles(null);
  };

  const openImagePreview = (images) => {
    setPreviewImages(images);
    setPreviewOpen(true);
  };

  const closeImagePreview = () => {
    setPreviewOpen(false);
    setPreviewImages([]);
  };

  const handleOpenDialog = () => {
    resetForm();
    setSelectedImages([]);
    setEditMode(false);
    setOpenDialog(true);
  };

  useEffect(() => {
    fetchProductos();
    fetchCatalogos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (snackbar.open) {
      const timer = setTimeout(() => {
        setSnackbar({ ...snackbar, open: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [snackbar]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Gestión de Productoos</Text>
        <TouchableOpacity 
          accessible={true}
          accessibilityLabel="Agregar nuevo producto"
          style={styles.addButton} 
          onPress={handleOpenDialog}
        >
          <Feather name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.filterHeader}>
          <TouchableOpacity
            style={styles.filterToggle}
            onPress={() => setOpenFilters(!openFilters)}
          >
            <Feather name="filter" size={20} color={theme.colors.primary} />
            <Text style={styles.filterText}>
              {openFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
            </Text>
          </TouchableOpacity>

          <View style={styles.genderButtons}>
            <TouchableOpacity
              style={[
                styles.genderButton,
                filters.genero === generos.find(g => g.genero.toLowerCase() === 'hombre')?.id && styles.genderButtonActive
              ]}
              onPress={() => {
                const hombreGenero = generos.find(g => g.genero.toLowerCase() === 'hombre');
                if (hombreGenero) {
                  const newValue = filters.genero === hombreGenero.id ? '' : hombreGenero.id;
                  setFilters((prev) => ({ ...prev, genero: newValue }));
                  setPage(0);
                }
              }}
            >
              <MaterialIcons 
                name="male" 
                size={20} 
                color={filters.genero === generos.find(g => g.genero.toLowerCase() === 'hombre')?.id ? '#fff' : theme.colors.primary} 
              />
              <Text style={[
                styles.genderButtonText,
                filters.genero === generos.find(g => g.genero.toLowerCase() === 'hombre')?.id && styles.genderButtonTextActive
              ]}>
                Hombre
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.genderButton,
                filters.genero === generos.find(g => g.genero.toLowerCase() === 'mujer')?.id && styles.genderButtonActive
              ]}
              onPress={() => {
                const mujerGenero = generos.find(g => g.genero.toLowerCase() === 'mujer');
                if (mujerGenero) {
                  const newValue = filters.genero === mujerGenero.id ? '' : mujerGenero.id;
                  setFilters((prev) => ({ ...prev, genero: newValue }));
                  setPage(0);
                }
              }}
            >
              <MaterialIcons 
                name="female" 
                size={20} 
                color={filters.genero === generos.find(g => g.genero.toLowerCase() === 'mujer')?.id ? '#fff' : theme.colors.primary} 
              />
              <Text style={[
                styles.genderButtonText,
                filters.genero === generos.find(g => g.genero.toLowerCase() === 'mujer')?.id && styles.genderButtonTextActive
              ]}>
                Mujer
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {openFilters && (
          <View style={styles.filtersContent}>
            <TextInput
              style={styles.input}
              placeholder="Buscar por nombre"
              value={filters.nombre}
              onChangeText={(text) => handleFilterChange('nombre', text)}
            />
            
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearFilters}
            >
              <Text style={styles.clearButtonText}>Limpiar Filtros</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ProductList
        productos={paginatedProductos}
        tableLoading={tableLoading}
        handleOpenDetalles={handleOpenDetalles}
        fetchProductoById={fetchProductoById}
        handleOpenDeleteDialog={handleOpenDeleteDialog}
        processColor={processColor}
      />

      <PaginationControls
        page={page}
        totalItems={filteredProductos.length}
        rowsPerPage={rowsPerPage}
        setPage={setPage}
      />

      <ProductFormModal
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        editMode={editMode}
        categorias={categorias}
        colores={colores}
        tallas={tallas}
        generos={generos}
        formState={formState}
        dispatchForm={dispatchForm}
        selectedImages={selectedImages}
        setSelectedImages={setSelectedImages}
        loading={loading}
        handleSubmit={handleSubmit}
        pickImages={pickImages}
        removeImage={removeImage}
      />

      <ProductDetailsModal
        detallesOpen={detallesOpen}
        handleCloseDetalles={handleCloseDetalles}
        productoDetalles={productoDetalles}
        loading={loading}
        processColor={processColor}
        openImagePreview={openImagePreview}
        fetchProductoById={fetchProductoById}
      />

      <DeleteConfirmationModal
        deleteDialogOpen={deleteDialogOpen}
        handleCloseDeleteDialog={handleCloseDeleteDialog}
        handleEliminarProducto={handleEliminarProducto}
      />

      <ImagePreviewModal
        previewOpen={previewOpen}
        closeImagePreview={closeImagePreview}
        previewImages={previewImages}
      />

      {snackbar.open && (
        <View style={[
          styles.snackbar,
          snackbar.severity === 'success' ? styles.snackbarSuccess : styles.snackbarError
        ]}>
          <Text style={styles.snackbarText}>{snackbar.message}</Text>
        </View>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingOverlayText}>Procesando...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.medium,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    backgroundColor: '#fff',
    padding: theme.spacing.medium,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: theme.spacing.small,
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: '#fff',
  },
  genderButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: 4,
  },
  genderButtonTextActive: {
    color: '#fff',
  },
  filtersContent: {
    marginTop: theme.spacing.medium,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 4,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  clearButton: {
    backgroundColor: theme.colors.danger,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    padding: theme.spacing.medium,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    flex: 1,
    marginRight: theme.spacing.small,
  },
  productActions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `rgba(${theme.colors.primary.replace('#', '')}, 0.1)`,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.small,
  },
  deleteButton: {
    backgroundColor: `rgba(${theme.colors.danger.replace('#', '')}, 0.1)`,
  },
  productDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  productDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.small,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  stockBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockAvailable: {
    backgroundColor: theme.colors.success,
  },
  stockUnavailable: {
    backgroundColor: theme.colors.danger,
  },
  stockText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  productTags: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: `rgba(${theme.colors.primary.replace('#', '')}, 0.1)`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: theme.spacing.small,
  },
  tagText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.small,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.medium,
    backgroundColor: '#fff',
  },
  paginationButton: {
    padding: theme.spacing.small,
  },
  disabledButton: {
    opacity: 0.5,
  },
  paginationText: {
    fontSize: 16,
    color: '#424242',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.medium,
    paddingHorizontal: theme.spacing.medium,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  pickerContainer: {
    marginBottom: theme.spacing.medium,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: theme.spacing.small,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  imageSection: {
    marginTop: theme.spacing.medium,
    marginBottom: theme.spacing.large,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 12,
  },
  imagePickerButton: {
    backgroundColor: `rgba(${theme.colors.primary.replace('#', '')}, 0.1)`,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  imagePickerText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    marginTop: theme.spacing.small,
  },
  imageGridScroll: {
    marginTop: theme.spacing.medium,
  },
  imageGrid: {
    flexDirection: 'row',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: theme.spacing.small,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: `rgba(${theme.colors.danger.replace('#', '')}, 0.9)`,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: theme.spacing.large,
    marginBottom: 40,
  },
  button: {
    ...commonButton,
    flex: 1,
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  cancelButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButtonModal: {
    backgroundColor: theme.colors.danger,
  },
  detailsContainer: {
    padding: theme.spacing.small,
  },
  detailsImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.small,
  },
  detailsPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.success,
    marginBottom: 20,
  },
  detailsInfo: {
    marginBottom: theme.spacing.medium,
  },
  detailsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginBottom: theme.spacing.small,
  },
  detailsText: {
    fontSize: 16,
    color: '#424242',
    lineHeight: 24,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.small,
  },
  imageGallery: {
    marginTop: 20,
  },
  galleryImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 12,
  },
  skeletonContainer: {
    padding: 20,
  },
  skeletonImage: {
    width: "100%",
    height: 300,
    backgroundColor: "#e0e0e0",
    borderRadius: 12,
    marginBottom: 20,
  },
  skeletonText: {
    width: "80%",
    height: 20,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    marginBottom: 12,
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  deleteModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  deleteModalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  deleteModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.danger,
    marginTop: 12,
  },
  deleteModalText: {
    fontSize: 16,
    color: '#424242',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  deleteModalActions: {
    flexDirection: 'row',
  },
  previewModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
  },
  previewCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewScrollContent: {
    alignItems: 'center',
  },
  previewImageContainer: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewFullImage: {
    width: width,
    height: height * 0.8,
  },
  snackbar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 8,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  snackbarSuccess: {
    backgroundColor: theme.colors.success,
  },
  snackbarError: {
    backgroundColor: theme.colors.danger,
  },
  snackbarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingOverlayText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 12,
  },
});

export default ProductoFormMejorado;