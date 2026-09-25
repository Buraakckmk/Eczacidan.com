import React, { useEffect, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { mobileApi } from '../services/api';
import { Listing, Product } from '../types/api';

export function HomeScreen({ navigation }: any) {
  const [products, setProducts] = useState<Product[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Tümü');

  const categories = ['Tümü', 'Besin Takviyesi', 'Medikal', 'Kişisel Bakım', 'Anne & Bebek'];

  useEffect(() => {
    (async () => {
      const prods = await mobileApi.getProducts();
      const lists = await mobileApi.getListings();
      setProducts(prods);
      setListings(lists);
    })();
  }, []);

  const filteredListings = listings.filter((l) => {
    const matchesCat = activeCategory === 'Tümü' || l.category === activeCategory;
    const matchesSearch =
      !search.trim() ||
      (l.productName && l.productName.toLowerCase().includes(search.toLowerCase())) ||
      l.sellerName.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.logoText}>
          eczacıdan<Text style={styles.logoAccent}>.com</Text>
        </Text>
        <Text style={styles.subLogo}>B2B Eczane Pazaryeri</Text>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Ürün, barkod veya eczane ara..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* CATEGORY BAR */}
      <View style={styles.catWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={categories}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveCategory(item)}
              style={[
                styles.catChip,
                activeCategory === item && styles.catChipActive,
              ]}
            >
              <Text
                style={[
                  styles.catText,
                  activeCategory === item && styles.catTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* LISTINGS FEED */}
      <FlatList
        data={filteredListings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ProductDetail', { listing: item })}
          >
            {item.isSponsored && (
              <View style={styles.sponsoredBadge}>
                <Text style={styles.sponsoredText}>⭐ SPONSORLU İLAN</Text>
              </View>
            )}

            <View style={styles.cardHeader}>
              <Text style={styles.productName}>{item.productName || 'İlaç / Takviye'}</Text>
              <Text style={styles.badgeDiscount}>%{item.discountPercentage} İskonto</Text>
            </View>

            <Text style={styles.sellerText}>
              🏢 Satıcı: {item.sellerName} ({item.sellerCity})
            </Text>

            <View style={styles.detailRow}>
              <Text style={styles.metaText}>SKT: {item.skt}</Text>
              <Text style={styles.metaText}>MF: {item.mfRatio}</Text>
              <Text style={styles.metaText}>Min: {item.minOrderQty} Adet</Text>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.price}>{item.unitPrice.toFixed(2)} TL</Text>
              <TouchableOpacity
                style={styles.btnDetail}
                onPress={() => navigation.navigate('ProductDetail', { listing: item })}
              >
                <Text style={styles.btnDetailText}>İncele & Al</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  logoAccent: {
    color: '#F97316',
  },
  subLogo: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 8,
  },
  searchContainer: {
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
    color: '#111827',
  },
  catWrapper: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 10,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    marginLeft: 12,
  },
  catChipActive: {
    backgroundColor: '#F97316',
  },
  catText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },
  catTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  sponsoredBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  sponsoredText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  badgeDiscount: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sellerText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    backgroundColor: '#F9FAFB',
    padding: 6,
    borderRadius: 6,
  },
  metaText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '500',
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
    fontSize: 16,
    fontWeight: '800',
    color: '#EA580C',
  },
  btnDetail: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnDetailText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
