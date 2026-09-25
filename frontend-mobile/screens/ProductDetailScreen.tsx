import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Listing } from '../types/api';

export function ProductDetailScreen({ route, navigation }: any) {
  const listing: Listing = route.params?.listing || {
    id: 'list-1',
    productName: 'Agavit Şurup 150 ml',
    sellerName: 'Şifa Eczanesi',
    sellerCity: 'Kadıköy / İstanbul',
    unitPrice: 28.5,
    skt: '11/2026',
    mfRatio: '10+1',
    minOrderQty: 5,
    discountPercentage: 37.4,
  };

  const [qty, setQty] = useState(listing.minOrderQty || 1);

  const handleAddToCart = () => {
    Alert.alert('Sepete Eklendi', `${listing.productName} (${qty} adet) sepetinize eklendi.`, [
      { text: 'Sepete Git', onPress: () => navigation.navigate('SepetimTab') },
      { text: 'Alışverişe Devam Et' },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.category}>{listing.category || 'Besin Takviyesi'}</Text>
          <Text style={styles.title}>{listing.productName}</Text>
          <Text style={styles.discountBadge}>%{listing.discountPercentage} Net İskonto Fırsatı</Text>

          <View style={styles.sellerBox}>
            <Text style={styles.sellerTitle}>Satıcı Eczane Bilgileri</Text>
            <Text style={styles.sellerName}>🏢 {listing.sellerName}</Text>
            <Text style={styles.sellerCity}>📍 {listing.sellerCity}</Text>
            <Text style={styles.sellerRating}>⭐ Satıcı Puanı: {listing.sellerRating || 9.8} / 10</Text>
          </View>

          <View style={styles.specGrid}>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>Son Kullanma (SKT)</Text>
              <Text style={styles.specValue}>{listing.skt}</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>Mal Fazlası (MF)</Text>
              <Text style={styles.specValue}>{listing.mfRatio}</Text>
            </View>
            <View style={styles.specBox}>
              <Text style={styles.specLabel}>Min. Sipariş</Text>
              <Text style={styles.specValue}>{listing.minOrderQty} Adet</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionCard}>
          <Text style={styles.priceLabel}>B2B Birim Fiyat:</Text>
          <Text style={styles.price}>{listing.unitPrice.toFixed(2)} TL</Text>

          <View style={styles.qtyRow}>
            <Text style={styles.qtyLabel}>Adet Seçimi:</Text>
            <View style={styles.counter}>
              <TouchableOpacity
                onPress={() => setQty(Math.max(listing.minOrderQty || 1, qty - 1))}
                style={styles.counterBtn}
              >
                <Text style={styles.counterBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{qty}</Text>
              <TouchableOpacity onPress={() => setQty(qty + 1)} style={styles.counterBtn}>
                <Text style={styles.counterBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.btnCart} onPress={handleAddToCart}>
            <Text style={styles.btnCartText}>Sepete Ekle ({(qty * listing.unitPrice).toFixed(2)} TL)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scroll: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  category: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginTop: 4,
  },
  discountBadge: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '700',
    marginTop: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  sellerBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
  },
  sellerTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  sellerCity: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },
  sellerRating: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
    marginTop: 4,
  },
  specGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  specBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 10,
    color: '#6B7280',
  },
  specValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  priceLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  price: {
    fontSize: 24,
    fontWeight: '900',
    color: '#EA580C',
    marginTop: 2,
  },
  qtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  qtyLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  counterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  counterBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '800',
    paddingHorizontal: 8,
  },
  btnCart: {
    backgroundColor: '#EA580C',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  btnCartText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
