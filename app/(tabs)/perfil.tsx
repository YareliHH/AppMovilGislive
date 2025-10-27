import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../AuthContext';

export default function PerfilScreen() {
  const { signOut, user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const handleLogoutConfirm = async () => {
    try {
      await signOut();
      setShowModal(false);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* ENCABEZADO */}
      <View style={styles.header}>
        <Text style={styles.title}>MI PERFIL</Text>
        <Text style={styles.subtitle}>Gestiona tu cuenta aquí</Text>

        <View style={styles.profileInfo}>
          <Ionicons name="person-circle-outline" size={70} color="#0077B6" />
          <View>
            <Text style={styles.name}>
              {user?.correo ? user.correo.split('@')[0] : 'Usuario'}
            </Text>
            <Text style={styles.email}>
              {user?.correo || 'correo@ejemplo.com'}
            </Text>
          </View>
        </View>
      </View>

      {/* CUERPO */}
      <View style={styles.body}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Información de Contacto</Text>

          <View style={styles.row}>
            <Ionicons name="mail-outline" size={24} color="#00bcd4" />
            <View style={styles.textContainer}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <Text style={styles.value}>
                {user?.correo || 'No disponible'}
              </Text>
            </View>
          </View>

          <View style={styles.row}>
            <Ionicons name="lock-closed-outline" size={24} color="#00bcd4" />
            <View style={styles.textContainer}>
              <Text style={styles.label}>Contraseña</Text>
              <Text style={styles.value}>••••••••</Text>
            </View>
          </View>
        </View>
      </View>

      {/* BOTÓN DE CERRAR SESIÓN */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="log-out-outline" size={22} color="#fff" />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      {/* MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Ionicons name="alert-circle-outline" size={60} color="#0077B6" />
            <Text style={styles.modalTitle}>¿Cerrar sesión?</Text>
            <Text style={styles.modalText}>
              ¿Estás segura de que deseas salir de tu cuenta?
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#ccc' }]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#0077B6' }]}
                onPress={handleLogoutConfirm}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>
                  Salir
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E0F7FA' },
  header: {
    backgroundColor: '#B2EBF2',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0077B6',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
    marginBottom: 20,
  },
  profileInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontWeight: 'bold', fontSize: 16, color: '#023E8A' },
  email: { fontSize: 13, color: '#555' },
  body: { flex: 1, paddingHorizontal: 20, paddingTop: 25 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 15,
    color: '#0077B6',
  },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  textContainer: { marginLeft: 10 },
  label: { fontSize: 13, color: '#777' },
  value: { fontSize: 14, fontWeight: '500', color: '#000' },

  // 🔹 BOTÓN DE CERRAR SESIÓN (alineado a la derecha)
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0077B6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    position: 'absolute',
    bottom: 25,
    right: 25, // 🔹 Alinea a la derecha
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },

  // 🔹 Estilos del Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: '80%',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 10,
    color: '#023E8A',
  },
  modalText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    borderRadius: 25,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
});
