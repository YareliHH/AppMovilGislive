import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  RefreshControl,
  Alert,
  Dimensions,
} from "react-native";
import axios from "axios";
import { Feather, MaterialIcons } from '@expo/vector-icons';

import { StackNavigationProp } from '@react-navigation/stack';

const { width } = Dimensions.get('window');
const BACKEND_URL = "https://backend-gis-1.onrender.com/api";

const theme = {
  colors: {
    primary: "#0277bd",
    danger: "#ff6b6b",
    warning: "#ffa500",
    success: "#4caf50",
    background: "#f5f5f5",
    textPrimary: "#212121",
    textSecondary: "#666",
    border: "#ddd",
    lightBlue: "#87CEEB",
    lightPurple: "#E6D5FF",
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
  },
};

type StockBajoScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

const StockBajoScreen = ({ navigation }: StockBajoScreenProps) => {
  const [productos, setProductos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [umbralStock] = useState(5);

  const fetchProductosStockBajo = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/obtener`);
      
      // Filtrar productos con stock bajo
      const productosConStockBajo = response.data.filter(
        (producto: { stock: number; }) => producto.stock <= umbralStock && producto.stock >= 0
      );
      
      // Ordenar por stock (menor a mayor)
      productosConStockBajo.sort((a: { stock: number; }, b: { stock: number; }) => a.stock - b.stock);
      
      // Obtener imágenes para cada producto
      const productosConImagenes = await Promise.all(
        productosConStockBajo.map(async (producto: { id: any; }) => {
          try {
            const imagenesResponse = await axios.get(`${BACKEND_URL}/imagenes/${producto.id}`);
            return {
              ...producto,
              imagenes: imagenesResponse.data || [],
              imagen_url: imagenesResponse.data && imagenesResponse.data.length > 0 
                ? imagenesResponse.data[0].url 
                : null
            };
          } catch (error) {
            console.error(`Error al cargar imágenes del producto ${producto.id}:`, error);
            return {
              ...producto,
              imagenes: [],
              imagen_url: null
            };
          }
        })
      );
      
      setProductos(productosConImagenes);
    } catch (error) {
      console.error("Error al cargar productos con stock bajo:", error);
      Alert.alert("Error", "No se pudieron cargar los productos con stock bajo");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProductosStockBajo();
    setRefreshing(false);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return { 
        text: 'Sin stock', 
        color: theme.colors.danger, 
        showCircle: true 
      };
    } else if (stock <= 2) {
      return { 
        text: 'Stock bajo', 
        color: theme.colors.danger, 
        showCircle: true 
      };
    } else if (stock <= 5) {
      return { 
        text: 'Stock bajo', 
        color: theme.colors.warning, 
        showCircle: true 
      };
    }
    return { 
      text: 'En stock', 
      color: theme.colors.success, 
      showCircle: true 
    };
  };

  const handleAjustarStock = (productoId: any, nombreProducto: string) => {
    Alert.alert(
      "Información del Producto",
      `${nombreProducto}\n\nID: ${productoId}`
    );
  };

  useEffect(() => {
    fetchProductosStockBajo();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Home</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={fetchProductosStockBajo}
          >
            <Feather name="refresh-cw" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Cargando productos...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollContainer}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.productsContainer}>
            {productos.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <MaterialIcons name="inventory-2" size={72} color="#ccc" />
                </View>
                <Text style={styles.emptyText}>No hay productos con stock bajo</Text>
                <Text style={styles.emptySubtext}>
                  ¡Excelente! Todos los productos tienen stock suficiente
                </Text>
              </View>
            ) : (
              productos.map((producto) => {
                const stockStatus = getStockStatus(producto.stock);
                return (
                  <View key={producto.id} style={styles.productCard}>
                    <View style={styles.productImageContainer}>
                      {producto.imagen_url ? (
                        <Image
                          source={{ uri: producto.imagen_url }}
                          style={styles.productImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.placeholderImage}>
                          <MaterialIcons name="image" size={36} color="#ccc" />
                        </View>
                      )}
                    </View>

                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={2}>
                        {producto.nombre_producto}
                      </Text>
                      
                      <View style={styles.productDetails}>
                        <View style={styles.detailRow}>
                          <MaterialIcons name="palette" size={14} color={theme.colors.textSecondary} />
                          <Text style={styles.detailText}>
                            {producto.color || 'N/A'}
                          </Text>
                        </View>
                        <View style={styles.detailRow}>
                          <MaterialIcons name="straighten" size={14} color={theme.colors.textSecondary} />
                          <Text style={styles.detailText}>
                            {producto.talla || 'N/A'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.priceRow}>
                        <Text style={styles.priceText}>
                          ${Number(producto.precio).toFixed(2)}
                        </Text>
                        <Text style={styles.oldPrice}>
                          ${(Number(producto.precio) * 1.2).toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.productActions}>
                      <View style={[styles.stockBadge, { backgroundColor: stockStatus.color + '15' }]}>
                        {stockStatus.showCircle && (
                          <View style={[styles.statusDot, { backgroundColor: stockStatus.color }]} />
                        )}
                        <Text style={[styles.stockText, { color: stockStatus.color }]}>
                          {stockStatus.text}
                        </Text>
                      </View>

                      <View style={styles.stockCount}>
                        <Text style={styles.stockNumber}>{producto.stock}</Text>
                        <Text style={styles.stockLabel}>
                          {producto.stock === 1 ? 'unidad' : 'unidades'}
                        </Text>
                      </View>

                      <TouchableOpacity 
                        style={styles.replenishButton}
                        onPress={() => handleAjustarStock(producto.id, producto.nombre_producto)}
                      >
                        <MaterialIcons name="add-circle-outline" size={16} color={theme.colors.primary} />
                        <Text style={styles.replenishButtonText}>Reponer</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      )}

      {productos.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: theme.colors.danger + '15' }]}>
              <MaterialIcons name="warning" size={22} color={theme.colors.danger} />
            </View>
            <View>
              <Text style={styles.summaryNumber}>
                {productos.filter(p => p.stock === 0).length}
              </Text>
              <Text style={styles.summaryLabel}>Sin stock</Text>
            </View>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIcon, { backgroundColor: theme.colors.warning + '15' }]}>
              <MaterialIcons name="inventory" size={22} color={theme.colors.warning} />
            </View>
            <View>
              <Text style={styles.summaryNumber}>
                {productos.filter(p => p.stock > 0 && p.stock <= umbralStock).length}
              </Text>
              <Text style={styles.summaryLabel}>Stock bajo</Text>
            </View>
          </View>
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
    paddingVertical: 18,
    paddingHorizontal: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  productsContainer: {
    padding: 18,
    paddingBottom: 24,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  productImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 14,
    backgroundColor: '#f8f8f8',
    overflow: 'hidden',
    marginRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  productName: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: 8,
    lineHeight: 22,
  },
  productDetails: {
    marginBottom: 10,
    gap: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.primary,
    marginRight: 10,
  },
  oldPrice: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  productActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: 12,
    minWidth: 95,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  stockText: {
    fontSize: 11,
    fontWeight: '700',
  },
  stockCount: {
    alignItems: 'center',
    marginVertical: 6,
  },
  stockNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.colors.danger,
    lineHeight: 30,
  },
  stockLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: -2,
    fontWeight: '500',
  },
  replenishButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  replenishButtonText: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 19,
    fontWeight: '700',
    color: '#999',
  },
  emptySubtext: {
    marginTop: 10,
    fontSize: 15,
    color: '#bbb',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  footer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  summaryLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  summaryDivider: {
    width: 1,
    height: 45,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
});

export default StockBajoScreen;