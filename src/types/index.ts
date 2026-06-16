// ============================================================
// TIPOS DO SISTEMA EDIFICA LOCAÇÃO
// ============================================================

export interface User {
  uid: string;
  name: string;
  email: string;
  cpf: string;
  role: string; // cargo
  createdAt?: string;
}

export interface Machine {
  id: string;
  userId: string;
  name: string;
  type: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  dailyRate: number;
  status: 'available' | 'rented' | 'maintenance';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  cpf?: string;
  cnpj?: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Rental {
  id: string;
  userId: string;
  clientId: string;
  clientName: string;
  machineId: string;
  machineName: string;
  machineType: string;
  startDate: string;   // DD/MM/AAAA
  endDate: string;     // DD/MM/AAAA
  dailyRate: number;
  totalDays: number;
  totalAmount: number;
  status: 'active' | 'completed' | 'cancelled';
  depositAmount?: number;
  hasDiscount?: boolean;
  originalAmount?: number;
  notes?: string;
  deliveryAddress?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface MachineGroup {
  name: string;
  type: string;
  total: number;
  available: number;
  rented: number;
  maintenance: number;
  machines: Machine[];
}

export interface DashboardStats {
  totalMachines: number;
  availableMachines: number;
  rentedMachines: number;
  totalClients: number;
  activeRentals: number;
  completedRentals: number;
  monthlyRevenue: number;
  totalRevenue: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export type ThemeMode = 'light' | 'dark';
