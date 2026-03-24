
import { ServiceType, OrderStatus } from './types';

export const SERVICES: ServiceType[] = [
  { 
    id: '1', 
    name: 'Stitching', 
    description: 'Bespoke tailoring for your fabric.', 
    icon: 'Shirt',
    subServices: ['Shirt', 'Pants', 'Blouse', 'Kurta', 'Custom Design']
  },
  { 
    id: '2', 
    name: 'Alteration', 
    description: 'Expert resizing and fit corrections.', 
    icon: 'Scissors',
    subServices: ['Length Adjustment', 'Waist Fit', 'Sleeve Shortening', 'Repair']
  },
  { 
    id: '3', 
    name: 'Saree Work', 
    description: 'Give your sarees a modern twist.', 
    icon: 'Sparkles',
    subServices: ['Kuchu Work', 'Fall & Zigzag', 'Embroidery']
  },
  { 
    id: '4', 
    name: 'Dry Cleaning', 
    description: 'Professional premium garment care.', 
    icon: 'Wind',
    subServices: ['Silk Saree', 'Suit', 'Lehenga', 'Premium Wear']
  },
];

export const STATUS_MAP: Record<OrderStatus, { label: string, color: string, description: string }> = {
  [OrderStatus.PENDING_TAILOR_APPROVAL]: { label: 'Pending Approval', color: 'bg-amber-100 text-amber-700', description: 'Waiting for the tailor to accept your request.' },
  [OrderStatus.TAILOR_REJECTED]: { label: 'Rejected', color: 'bg-red-100 text-red-700', description: 'Tailor could not accept this request.' },
  [OrderStatus.TAILOR_ACCEPTED]: { label: 'Tailor Accepted', color: 'bg-emerald-100 text-emerald-700', description: 'Great! Tailor has accepted. Please schedule pickup.' },
  [OrderStatus.PICKUP_SCHEDULED]: { label: 'Pickup Scheduled', color: 'bg-blue-100 text-blue-700', description: 'Our bee is assigned for collection.' },
  [OrderStatus.DELIVERY_EN_ROUTE_TO_CUSTOMER]: { label: 'Bee is arriving', color: 'bg-indigo-100 text-indigo-700', description: 'Logistics partner is on the way to you.' },
  [OrderStatus.PICKED_UP_FROM_CUSTOMER]: { label: 'Item Collected', color: 'bg-indigo-200 text-indigo-800', description: 'Item is moving to the workshop.' },
  [OrderStatus.DELIVERED_TO_TAILOR]: { label: 'At Workshop', color: 'bg-slate-100 text-slate-700', description: 'Item reached the tailor shop.' },
  [OrderStatus.RECEIVED_BY_TAILOR]: { label: 'Received', color: 'bg-slate-200 text-slate-800', description: 'Tailor has confirmed receipt.' },
  [OrderStatus.IN_PROGRESS]: { label: 'In Progress', color: 'bg-amber-100 text-amber-700', description: 'Your garment is being worked on.' },
  [OrderStatus.READY_FOR_DELIVERY]: { label: 'Ready', color: 'bg-emerald-100 text-emerald-700', description: 'Stitching/Service completed!' },
  [OrderStatus.PICKED_UP_FROM_TAILOR]: { label: 'Picked Up', color: 'bg-purple-100 text-purple-700', description: 'Bee collected your items from tailor.' },
  [OrderStatus.OUT_FOR_DELIVERY]: { label: 'Out for Delivery', color: 'bg-purple-200 text-purple-800', description: 'Coming back to your doorstep.' },
  [OrderStatus.DELIVERED]: { label: 'Delivered', color: 'bg-slate-300 text-slate-900', description: 'Order completed. Enjoy!' },
};
