import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
} from "react-native";
import imagen from "../assets/images/gislive.jpg";
import { useAuth } from './AuthContext';

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
  });
  

  const showCustomAlert = (title, message) => {
    setAlert({ visible: true, title, message });
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      showCustomAlert("Campos vacíos", "Por favor, ingresa tus credenciales.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://backend-gis-1.onrender.com/api/loginMovil",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            correo: email.trim(),
            password: password.trim(),
          }),
        }
      );

      let data;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      setLoading(false);

      if (!response.ok) {
        showCustomAlert(
          "Error",
          data?.error || "Usuario o contraseña incorrectos."
        );
        return;
      }

      if (!data || !data.tipo || !data.id) {
        showCustomAlert(
          "Error de autenticación",
          "No se recibió información completa del usuario."
        );
        return;
      }

      // Validación de tipo de usuario
      if (data.tipo === "admin") {
        await signIn({
          id: data.id,
          tipo: data.tipo,
          correo: email.trim(),
          ...data
        });
      } else {
        showCustomAlert(
          "Acceso denegado",
          "Solo los administradores pueden ingresar a esta aplicación."
        );
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setLoading(false);
      showCustomAlert(
        "Error de conexión",
        "No se pudo conectar con el servidor. Intenta más tarde."
      );
    }
  };


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado */}
        <View style={styles.topContainer}>
          <Image source={imagen} style={styles.logo} resizeMode="cover" />
          <Text style={styles.title}>Bienvenido a GisLive</Text>
          <Text style={styles.subtitle}>
            La mejor boutique de uniformes clínicos de alta calidad
          </Text>
        </View>

        {/* Formulario */}
        <View style={styles.footer}>
          <View style={styles.inputContainer}>
            <Ionicons
              name="mail-outline"
              size={22}
              color="#007AFF"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#aaa"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={22}
              color="#007AFF"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Contraseña"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#aaa"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.iconButton}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={22}
                color="#007AFF"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Iniciar sesión</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Alerta personalizada */}
      <Modal transparent visible={alert.visible} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.alertBox}>
            <Ionicons
              name="alert-circle"
              size={60}
              color="#007AFF"
              style={styles.alertIcon}
            />
            <Text style={styles.alertTitle}>{alert.title}</Text>
            <Text style={styles.alertMessage}>{alert.message}</Text>
            <TouchableOpacity
              style={styles.alertButton}
              onPress={() => setAlert({ ...alert, visible: false })}
            >
              <Text style={styles.alertButtonText}>Aceptar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#5AD2E8",
  },
  topContainer: {
    alignItems: "center",
    marginTop: 70,
    marginBottom: 20,
  },
  logo: {
    width: 170,
    height: 170,
    borderRadius: 85,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 30,
    lineHeight: 22,
  },
  footer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingVertical: 50,
    paddingHorizontal: 30,
    marginTop: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#e0e0e0",
    borderWidth: 1.5,
    borderRadius: 15,
    marginBottom: 18,
    backgroundColor: "#fafafa",
    paddingHorizontal: 15,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  iconButton: {
    padding: 8,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 15,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertBox: {
    backgroundColor: "#fff",
    width: "85%",
    padding: 30,
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
  },
  alertIcon: {
    marginBottom: 15,
  },
  alertTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#007AFF",
    textAlign: "center",
    marginBottom: 8,
  },
  alertMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
  },
  alertButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 40,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  alertButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});