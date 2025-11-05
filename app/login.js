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
  Alert,
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
        // ✅ AQUÍ ESTÁ EL CAMBIO IMPORTANTE
        await signIn({
          id: data.id,
          tipo: data.tipo,
          correo: email.trim(),
          ...data // Guarda cualquier otro dato que venga del backend
        });
        // La navegación se hace automáticamente por el AuthContext
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
    marginTop: 60,
  },
  logo: {
    width: 160,
    height: 160,
    borderRadius: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 17,
    color: "#fff",
    textAlign: "center",
    marginTop: 5,
    paddingHorizontal: 25,
  },
  footer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 45,
    borderTopRightRadius: 45,
    paddingVertical: 40,
    paddingHorizontal: 35,
    marginTop: 40,
    elevation: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 14,
    marginBottom: 20,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#000",
  },
  iconButton: {
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertBox: {
    backgroundColor: "#fff",
    width: "80%",
    padding: 25,
    borderRadius: 20,
    alignItems: "center",
    elevation: 10,
  },
  alertIcon: {
    marginBottom: 10,
  },
  alertTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#007AFF",
    textAlign: "center",
    marginBottom: 5,
  },
  alertMessage: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  alertButton: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 25,
  },
  alertButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
