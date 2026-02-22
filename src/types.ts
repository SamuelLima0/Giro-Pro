export type ProductStatus = 'Em estoque' | 'Vendido';

export interface Product {
  id: string;
  name: string;
  category: string;
  purchaseDate: string;
  costValue: number;
  salePrice: number;
  quantity: number;
  taxPercentage: number;
  observations: string;
  image?: string; // Base64
  status: ProductStatus;
  createdAt: number;
  soldAt?: number;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  saleDate: string;
  salePrice: number;
  costValue: number;
  taxPercentage: number;
  profit: number;
}

export interface AppSettings {
  monthlyGoal: number;
}
