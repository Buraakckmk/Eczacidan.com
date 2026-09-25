import React, { useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { FinancialTransaction, OrderItem } from '../types/api';

export function AccountScreen() {
  const [tab, setTab] = useState<'listings' | 'orders' | 'transactions'>('listings');

  const orders: OrderItem[] = [
    {
      id: 'ord-101',
      orderNumber: 'ECZ-20260807-001',
      date: '07 Ağustos 2026',
      sellerPharmacy: 'Güneş Eczanesi (Ankara)',
      productName: 'Parol 500 mg 20 Tablet',
      quantity: 50,
      unitPrice: 31.0,
      totalPrice: 1550.0,
      status: 'Kargoda',
      trackingNumber: 'YURT-94827104',
    },
  ];

  const transactions: FinancialTransaction[] = [
    {
      id: 'tx-1',
      date: '07 Ağustos 2026 - 16:40',
      type: 'gelir',
      title: 'İlan Satış Geliri',
      description: 'Şifa Eczanesi 20 Adet Agavit Şurup Satın Aldı',
      amount: 570.0,
      balanceAfter: 1450.0,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>ŞE</Text>
        </View>
        <View>
          <Text style={styles.pharmacyName}>Kadıköy Şifa Eczanesi</Text>
          <Text style={styles.glnText}>GLN: 3245676600002</Text>
          <Text style={styles.balanceText}>Cari Bakiye: 1.450,00 TL</Text>
        </View>
      </View>

      {/* TABS */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          onPress={() => setTab('listings')}
          style={[styles.tabBtn, tab === 'listings' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, tab === 'listings' && styles.tabTextActive]}>İlanlarım</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab('orders')}
          style={[styles.tabBtn, tab === 'orders' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, tab === 'orders' && styles.tabTextActive]}>Siparişlerim</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab('transactions')}
          style={[styles.tabBtn, tab === 'transactions' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabText, tab === 'transactions' && styles.tabTextActive]}>Hareketler</Text>
        </TouchableOpacity>
      </View>

      {tab === 'orders' && (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.ordNum}>{item.orderNumber}</Text>
                <Text style={styles.statusBadge}>{item.status}</Text>
              </View>
              <Text style={styles.prodName}>{item.productName} ({item.quantity} Adet)</Text>
              <Text style={styles.sellerName}>{item.sellerPharmacy}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.price}>{item.totalPrice.toFixed(2)} TL</Text>
                <Text style={styles.date}>{item.date}</Text>
              </View>
            </View>
          )}
        />
      )}

      {tab === 'transactions' && (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.txTitle}>{item.title}</Text>
                <Text
                  style={[
                    styles.txAmount,
                    item.type === 'gelir' ? styles.income : styles.expense,
                  ]}
                >
                  {item.type === 'gelir' ? '+' : '-'}{item.amount.toFixed(2)} TL
                </Text>
              </View>
              <Text style={styles.txDesc}>{item.description}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
          )}
        />
      )}

      {tab === 'listings' && (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Yayındaki İlan Sayınız: 3</Text>
          <Text style={styles.subText}>Yeni ilan ekleme ve yönetimi yapabilirsiniz.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#EA580C',
  },
  pharmacyName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  glnText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  balanceText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
    marginTop: 2,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#EA580C',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#EA580C',
    fontWeight: '800',
  },
  list: {
    padding: 16,
  },
  card: {
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
  ordNum: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  prodName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 6,
  },
  sellerName: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
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
  date: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '800',
  },
  income: {
    color: '#16A34A',
  },
  expense: {
    color: '#DC2626',
  },
  txDesc: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 4,
  },
  emptyBox: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  subText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
});
