import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockProducts, mockCategories, Product, Category } from '../data/mockData';
import api from '../api/api';

export interface FilterState {
  query: string;

  // Checkbox filters
  newArrivals: boolean;
  popularThisWeek: boolean;
  priceDropping: boolean;
  discountOnly: boolean;
  popularity: boolean;

  // Explicit filters
  priceMin?: number;
  priceMax?: number;
  categoryId?: string;

  // Sorting
  priceLowToHigh?: boolean;
  priceHighToLow?: boolean;
}

type PaginationMeta = {
  page: number;
  limit: number;
  totalProducts: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

interface FetchProductsOptions {
  page?: number;
  limit?: number;
  append?: boolean;
  search?: string;
  gender?: string;
  category?: string;
  subCategory?: string;
  type?: string;
  isSale?: boolean;
  sort?: 'price_low_to_high' | 'price_high_to_low' | 'whats_new' | 'popularity';
}

interface ShopState {
  products: Product[];
  categories: Category[];
  productsLoaded: boolean;
  isFetchingProducts: boolean;
  pagination: PaginationMeta;

  activeFilters: FilterState;
  recentSearches: string[];

  setQuery: (q: string) => void;
  toggleFilter: (key: keyof FilterState) => void;
  setFilter: (updates: Partial<FilterState>) => void;
  resetFilters: () => void;
  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
  clearProducts: () => void;

  fetchProducts: (options?: FetchProductsOptions) => Promise<{
    products: Product[];
    pagination: PaginationMeta;
  } | null>;

  fetchCategories: () => Promise<void>;

  getFilteredProducts: () => Product[];
  getSaleProducts: () => Product[];
}

const initialFilters: FilterState = {
  query: '',
  newArrivals: false,
  popularThisWeek: false,
  priceDropping: false,
  discountOnly: false,
  popularity: false,
  priceLowToHigh: false,
  priceHighToLow: false,
  priceMin: undefined,
  priceMax: undefined,
  categoryId: undefined,
};

const initialPagination: PaginationMeta = {
  page: 1,
  limit: 10,
  totalProducts: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
};

const sortCategoriesByOrder = (categories: Category[]) => {
  const categoryOrder = [
    'Men',
    'Women',
    'Kids',
    'Unisex',
    'Shoes',
    'Jewellery',
    'Accessories',
    'Beauty',
  ];

  return [...categories].sort((a, b) => {
    const indexA = categoryOrder.indexOf(a.name);
    const indexB = categoryOrder.indexOf(b.name);

    if (indexA === -1 && indexB === -1) return 0;
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;

    return indexA - indexB;
  });
};

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      products: mockProducts,
      categories: mockCategories,
      productsLoaded: false,
      isFetchingProducts: false,
      pagination: initialPagination,

      activeFilters: initialFilters,
      recentSearches: [],

      fetchProducts: async (options = {}) => {
        const {
          page = 1,
          limit = 10,
          append = false,
          search,
          gender,
          category,
          subCategory,
          type,
          isSale,
          sort,
        } = options;

        try {
          set({ isFetchingProducts: true });

          const params: Record<string, string | number | boolean> = {
            page,
            limit,
          };

          if (search) params.search = search;
          if (gender) params.gender = gender;
          if (category) params.category = category;
          if (subCategory) params.subCategory = subCategory;
          if (type) params.type = type;
          if (typeof isSale === 'boolean') params.isSale = isSale;
          if (sort) params.sort = sort;

          const response = await api.get('/products', { params });

          const fetchedProducts: Product[] = response.data?.products || [];
          const pagination: PaginationMeta = response.data?.pagination || {
            page,
            limit,
            totalProducts: fetchedProducts.length,
            totalPages: fetchedProducts.length > 0 ? 1 : 0,
            hasNextPage: false,
            hasPrevPage: page > 1,
          };

          set((state) => ({
            products: append ? [...state.products, ...fetchedProducts] : fetchedProducts,
            productsLoaded: true,
            pagination,
            isFetchingProducts: false,
          }));

          return {
            products: fetchedProducts,
            pagination,
          };
        } catch (err) {
          console.warn('[ShopStore] Failed to fetch products from API, using fallback data.', err);

          if (!append) {
            set({
              products: mockProducts,
              productsLoaded: true,
              isFetchingProducts: false,
              pagination: {
                page: 1,
                limit: mockProducts.length,
                totalProducts: mockProducts.length,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false,
              },
            });
          } else {
            set({ isFetchingProducts: false });
          }

          return null;
        }
      },

      fetchCategories: async () => {
        try {
          const categoriesRes = await api.get('/products/categories');
          const fetchedCategories: Category[] =
            categoriesRes.data?.categories || categoriesRes.data || [];

          if (fetchedCategories.length > 0) {
            const sortedCategories = sortCategoriesByOrder(fetchedCategories);
            set({ categories: sortedCategories });
          }
        } catch (err) {
          console.warn('[ShopStore] Failed to fetch categories from API, using fallback data.', err);
        }
      },

      clearProducts: () =>
        set({
          products: [],
          productsLoaded: false,
          pagination: initialPagination,
        }),

      setQuery: (q) =>
        set((state) => ({
          activeFilters: { ...state.activeFilters, query: q },
        })),

      toggleFilter: (key) =>
        set((state) => {
          const val = state.activeFilters[key];

          if (typeof val === 'boolean') {
            const nextFilters = { ...state.activeFilters, [key]: !val };

            if (key === 'priceLowToHigh' && !val) {
              nextFilters.priceHighToLow = false;
              nextFilters.popularity = false;
            }

            if (key === 'priceHighToLow' && !val) {
              nextFilters.priceLowToHigh = false;
              nextFilters.popularity = false;
            }

            if (key === 'popularity' && !val) {
              nextFilters.priceLowToHigh = false;
              nextFilters.priceHighToLow = false;
            }

            return { activeFilters: nextFilters };
          }

          return state;
        }),

      setFilter: (updates) =>
        set((state) => ({
          activeFilters: { ...state.activeFilters, ...updates },
        })),

      resetFilters: () =>
        set((state) => ({
          activeFilters: {
            ...initialFilters,
            categoryId: state.activeFilters.categoryId,
            query: state.activeFilters.query,
          },
        })),

      addRecentSearch: (term) =>
        set((state) => {
          if (!term.trim()) return state;
          const newRecent = [term, ...state.recentSearches.filter((t) => t !== term)].slice(0, 8);
          return { recentSearches: newRecent };
        }),

      clearRecentSearches: () => set({ recentSearches: [] }),

      getFilteredProducts: () => {
        const { products, activeFilters } = get();
        const {
          query,
          categoryId,
          priceMin,
          priceMax,
          newArrivals,
          popularThisWeek,
          priceDropping,
          discountOnly,
          popularity,
        } = activeFilters;

        let filtered = products.filter((p: any) => {
          if (categoryId && p.categoryId !== categoryId) return false;

          if (query) {
            const q = query.toLowerCase();
            const title = (p.title || '').toLowerCase();
            const tags = Array.isArray(p.tags) ? p.tags : [];

            if (!title.includes(q) && !tags.some((t: string) => t.toLowerCase().includes(q))) {
              return false;
            }
          }

          if (priceMin !== undefined && p.price < priceMin) return false;
          if (priceMax !== undefined && p.price > priceMax) return false;

          if (newArrivals && !p.isNewArrival) return false;
          if (popularThisWeek && !p.isPopular) return false;
          if (priceDropping && !p.isPriceDropping) return false;
          if (discountOnly && (!p.oldPrice || p.oldPrice <= p.price)) return false;

          return true;
        });

        if (activeFilters.priceLowToHigh) {
          filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        } else if (activeFilters.priceHighToLow) {
          filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        } else if (popularity) {
          filtered.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
        }

        return filtered;
      },

      getSaleProducts: () => {
        const { products } = get();
        return products.filter((p) => p.oldPrice && p.oldPrice > p.price);
      },
    }),
    {
      name: 'shop-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        activeFilters: state.activeFilters,
        recentSearches: state.recentSearches,
      }),
    }
  )
);