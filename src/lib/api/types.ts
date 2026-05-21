export type UUID = string;

export interface Barbershop {
  id: UUID;
  slug: string;
  name: string;
  address: string;
  phone: string;
  description?: string;
  logoUrl?: string;
  rating?: number;
  reviewsCount?: number;
  photos?: string[];
  hours?: { weekday: number; open: string; close: string }[];
}

export interface Barber {
  id: UUID;
  barbershopId: UUID;
  name: string;
  avatarUrl?: string;
  specialties: string[];
  commissionPct: number;
  workingDays: number[]; // 0..6
  workStart: string; // "09:00"
  workEnd: string;   // "19:00"
}

export interface Service {
  id: UUID;
  barbershopId: UUID;
  name: string;
  description?: string;
  durationMin: number;
  priceCents: number;
  barberIds: UUID[];
}

export interface Client {
  id: UUID;
  barbershopId: UUID;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  createdAt: string;
  totalAppointments: number;
  totalSpentCents: number;
}

export type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "no_show";

export interface Appointment {
  id: UUID;
  barbershopId: UUID;
  barberId: UUID;
  serviceId: UUID;
  clientId: UUID;
  start: string; // ISO
  end: string;   // ISO
  status: AppointmentStatus;
  priceCents: number;
  notes?: string;
}

export interface FinanceEntry {
  id: UUID;
  barbershopId: UUID;
  type: "income" | "expense";
  category: string;
  description: string;
  amountCents: number;
  date: string;
}

export interface AuthUser {
  id: UUID;
  name: string;
  email: string;
  barbershopId: UUID;
}
