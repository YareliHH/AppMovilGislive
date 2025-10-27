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

  const handleAjustarStock = (productoId: any) => {
    if (navigation) {
      navigation.navigate('EditarProducto', { id: productoId });
    } else {
      Alert.alert("Información", `Ajustar stock del producto ID: ${productoId}`);
    }
  };

  useEffect(() => {
    fetchProductosStockBajo();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}></Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchProductosStockBajo}
        >
          <Feather name="refresh-cw" size={22} color="#fff" />
        </TouchableOpacity>
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
        >
          <View style={styles.productsContainer}>
            {productos.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="inventory-2" size={64} color="#ccc" />
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
                          <MaterialIcons name="image" size={32} color="#ccc" />
                        </View>
                      )}
                    </View>

                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={1}>
                        {producto.nombre_producto}
                      </Text>
                      
                      <View style={styles.productDetails}>
                        <Text style={styles.detailText}>
                          Color: {producto.color || 'N/A'}
                        </Text>
                        <Text style={styles.detailText}>
                          Talla: {producto.talla || 'N/A'}
                        </Text>
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
                      <View style={[styles.stockBadge, { backgroundColor: stockStatus.color + '20' }]}>
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
                        onPress={() => handleAjustarStock(producto.id)}
                      >
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
            <View style={[styles.summaryIcon, { backgroundColor: theme.colors.danger + '20' }]}>
              <MaterialIcons name="warning" size={20} color={theme.colors.danger} />
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
            <View style={[styles.summaryIcon, { backgroundColor: theme.colors.warning + '20' }]}>
              <MaterialIcons name="inventory" size={20} color={theme.colors.warning} />
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
  headerSpacer: {
    width: 36,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  productsContainer: {
    padding: theme.spacing.medium,
    paddingBottom: 20,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
    marginRight: theme.spacing.medium,
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
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  productDetails: {
    marginBottom: 6,
  },
  detailText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginRight: 8,
  },
  oldPrice: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  productActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: theme.spacing.small,
    minWidth: 90,
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  stockText: {
    fontSize: 11,
    fontWeight: '600',
  },
  stockCount: {
    alignItems: 'center',
    marginVertical: 4,
  },
  stockNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.danger,
    lineHeight: 28,
  },
  stockLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: -2,
  },
  replenishButton: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: theme.colors.warning,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  replenishButtonText: {
    color: theme.colors.warning,
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
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
    paddingVertical: 80,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  footer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: theme.spacing.medium,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  summaryLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
  },
});

export default StockBajoScreen;