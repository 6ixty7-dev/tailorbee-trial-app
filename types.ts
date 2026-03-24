
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  TAILOR = 'TAILOR',
  DELIVERY = 'DELIVERY',
  ADMIN = 'ADMIN'
}

export enum OrderStatus {
  PENDING_TAILOR_APPROVAL = 'PENDING_TAILOR_APPROVAL',
  TAILOR_REJECTED = 'TAILOR_REJECTED',
  TAILOR_ACCEPTED = 'TAILOR_ACCEPTED',
  PICKUP_SCHEDULED = 'PICKUP_SCHEDULED',
  DELIVERY_EN_ROUTE_TO_CUSTOMER = 'DELIVERY_EN_ROUTE_TO_CUSTOMER',
  PICKED_UP_FROM_CUSTOMER = 'PICKED_UP_FROM_CUSTOMER',
  DELIVERED_TO_TAILOR = 'DELIVERED_TO_TAILOR',
  RECEIVED_BY_TAILOR = 'RECEIVED_BY_TAILOR',
  IN_PROGRESS = 'IN_PROGRESS',
  READY_FOR_DELIVERY = 'READY_FOR_DELIVERY',
  PICKED_UP_FROM_TAILOR = 'PICKED_UP_FROM_TAILOR',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  address?: string;
  isOnboarded?: boolean;
}

export interface CatalogueItem {
  id: string;
  tailorId: string;
  categoryId: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface CatalogueCategory {
  id: string;
  tailorId: string;
  name: string;
}

export interface AISuggestion {
  title: string;
  description: string;
  redesignStyle: string;
}

export interface Order {
  id: string;
  customerId: string;
  tailorId: string;
  serviceId: string;
  subService: string;
  status: OrderStatus;
  
  // Design/Catalogue
  designSource: 'CATALOGUE' | 'UPLOAD' | 'AI';
  catalogueItemId?: string;
  referenceImageUrl?: string;
  aiSuggestion?: AISuggestion;
  
  // Customization
  fabricType: string;
  measurementMode: 'SAVED' | 'SAMPLE' | 'AT_PICKUP';

  pickupAddress: string;
  pickupDate?: string;
  pickupTime?: string;
  
  priceEstimate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TailorShop {
  id: string;
  name: string;
  ownerName: string;
  address: string;
  specialization: string[]; 
  rating: number;
  workingDays: string[];
  workingHours: string;
  imageUrl?: string;
}

export interface ServiceType {
  id: string;
  name: string;
  description: string;
  icon: string;
  subServices?: string[];
}
