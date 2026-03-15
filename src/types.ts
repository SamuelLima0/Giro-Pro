export type AvailabilityStatus = 'Em estoque' | 'Vendido';

export type ProductCondition = 'Pronto para venda' | 'Aguardando reparo' | 'Em melhoria';

export interface PriceHistoryEntry {
  price: number;
  date: string;
  type: 'created' | 'price_update' | 'sold';
}

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
  photos?: string[];
  availability: AvailabilityStatus;
  status?: ProductCondition;
  createdAt: number;
  soldAt?: number;
  priceHistory?: PriceHistoryEntry[];
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
  paymentMethod: 'Dinheiro' | 'PIX' | 'Cartão de Débito' | 'Cartão de Crédito' | 'Troca + Volta';
  installments?: number;
  tradeItemName?: string;
  tradeItemValue?: number;
  cashDifference?: number;
  askingPrice: number;
  discount: number;
  taxAmount: number;
  profitPercentage: number;
  personalProfit: number;
  companyCash: number;
  reinvestmentCapital: number;
}

export interface AppSettings {
  monthlyGoal: number;
}

export interface AutoSearch {
  id: string;
  name: string;
  term: string;
  minPrice: number;
  maxPrice: number;
  marketplaces: string[];
  radius: number;
  frequency: number;
  isActive: boolean;
  createdAt: number;
}
