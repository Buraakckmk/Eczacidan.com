import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export function LoginScreen({ navigation }: any) {
  const [username, setUsername] = useState('demo');
  const [password, setPassword] = useState('demo123');

  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    Alert.alert('Giriş Başarılı', 'Eczacıdan.com B2B Paneline Hoş Geldiniz!', [
      { text: 'Tamam', onPress: () => navigation.navigate('PazaryeriTab') },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.logoText}>
          eczacıdan<Text style={styles.logoAccent}>.com</Text>
        </Text>
        <Text style={styles.subTitle}>B2B Eczacı Kurumsal Giriş</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>GLN veya Kullanıcı Adı</Text>
          <TextInput
            style={styles.input}
            placeholder="örn. 3245676600002"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Şifre</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.btnLogin} onPress={handleLogin}>
          <Text style={styles.btnLoginText}>Giriş Yap</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 3,
  },
  logoText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
  },
  logoAccent: {
    color: '#EA580C',
  },
  subTitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#111827',
  },
  btnLogin: {
    backgroundColor: '#EA580C',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  btnLoginText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
