export interface Category {
    id: string;
    name: string;
    image: any;
    gender: 'men' | 'women' | 'unisex';
}

export interface Product {
    id: string;
    title: string;
    name?: string;
    price: number;
    oldPrice?: number;
    rating: number;
    reviews: number;
    images: any[];
    categoryId: string;
    tags: string[];
    colors: string[];
    sizes: string[];
    isExclusive?: boolean;
    description?: string;
    isNewArrival?: boolean;
    isPopular?: boolean;
    isPriceDropping?: boolean;
    discountPercent?: number;
}

import { MOCK_PRODUCTS } from './mockProducts';

export const mockCategories: Category[] = [];

// Helper to map category name to ID
const getCatId = (name: string) => {
    return 'c1'; // Fallback when no mock categories exist
};

// All products now come from API via /products endpoint
export const mockProducts: Product[] = [
    {
        id: 'feat_1',
        title: 'Premium Leather Watch',
        price: 12500,
        rating: 4.9,
        reviews: 120,
        images: [require('../../assets/images/categories/men/watches.jpg')],
        categoryId: 'cat_accessories',
        tags: ['watch', 'luxury'],
        colors: ['#8B4513'],
        sizes: ['One Size'],
        isExclusive: true,
    }
];
