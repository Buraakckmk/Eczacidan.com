import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CartItem } from '../types/api';

export function CartScreen({ navigation }: any) {
  const [items, setItems] = useState<CartItem[]>([
    {
      listingId: 'list-1',
      productId: 'prod-1',
      productName: 'Agavit Şurup 150 ml',
      sellerName: 'Şifa Eczanesi',
      unitPrice: 28.5,
      quantity: 10,
      minOrderQty: 5,
      skt: '11/2026',
      deliveryType: 'today',
    },
    {
      listingId: 'list-5',
      productId: 'prod-2',
      productName: 'Parol 500 mg 20 Tablet',
      sellerName: 'Şifa Eczanesi',
      unitPrice: 42.0,
      quantity: 10,
      minOrderQty: 10,
      skt: '01/2028',
      deliveryType: 'today',
    },
  ]);

  const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

  const handleCheckout = () => {
    Alert.alert('Sipariş Onayı', `Toplam ${total.toFixed(2)} TL tutarındaki siparişiniz oluşturulsun mu?`, [
      {
        text: 'Onayla',
        onPress: () => {
          setItems([]);
          Alert.alert('Başarılı', 'Siparişiniz alındı!');
        },
      },
      { text: 'İptal', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alışveriş Sepetim</Text>
        <Text style={styles.headerSub}>{items.length} Kalem Ürün</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Sepetiniz boş.</Text>
          <TouchableOpacity style={styles.btnShop} onPress={() => navigation.navigate('PazaryeriTab')}>
            <Text style={styles.btnShopText}>Pazaryerine Git</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.listingId}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.cartCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.name}>{item.productName}</Text>
                  <TouchableOpacity
                    onPress={() => setItems(items.filter((i) => i.listingId !== item.listingId))}
                  >
                    <Text style={styles.deleteText}>Sil</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.seller}>Satıcı: {item.sellerName} • SKT: {item.skt}</Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.price}>{(item.quantity * item.unitPrice).toFixed(2)} TL</Text>
                  <Text style={styles.qtyLabel}>{item.quantity} Adet</Text>
                </View>
              </View>
            )}
          />

          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Genel Toplam:</Text>
              <Text style={styles.totalPrice}>{total.toFixed(2)} TL</Text>
            </View>
            <TouchableOpacity style={styles.btnCheckout} onPress={handleCheckout}>
              <Text style={styles.btnCheckoutText}>Siparişi Tamamla</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  headerSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '600',
  },
  btnShop: {
    marginTop: 12,
    backgroundColor: '#EA580C',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnShopText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  list: {
    padding: 16,
  },
  cartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  deleteText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '700',
  },
  seller: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: '#EA580C',
  },
  qtyLabel: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: '900',
    color: '#EA580C',
  },
  btnCheckout: {
    backgroundColor: '#EA580C',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnCheckoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
