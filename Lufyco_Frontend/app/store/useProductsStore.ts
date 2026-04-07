import { create } from 'zustand';
import { MOCK_PRODUCTS } from '../data/mockProducts';

export type Product = typeof MOCK_PRODUCTS[0];

type ProductsState = {
    products: Product[];
    getProductById: (id: string) => Product | undefined;
};

export const useProductsStore = create<ProductsState>((set, get) => ({
    products: MOCK_PRODUCTS,
    getProductById: (id) => MOCK_PRODUCTS.find(p => p._id === id)
}));
