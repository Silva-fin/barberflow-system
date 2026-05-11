import {
  mockAppointments, mockBarbers, mockBarbershop, mockClients, mockFinance,
  mockServices, pushAppointment, removeAppointment, updateAppointment,
} from "@/lib/mock/data";
import type { Appointment, Barber, Barbershop, Client, FinanceEntry, Service } from "./types";

const delay = (ms = 250) => new Promise(r => setTimeout(r, ms));

export const api = {
  // Barbershop
  async getBarbershopBySlug(slug: string): Promise<Barbershop | null> {
    await delay();
    return mockBarbershop.slug === slug ? mockBarbershop : null;
  },
  async getMyBarbershop(): Promise<Barbershop> {
    await delay();
    return mockBarbershop;
  },
  // Barbers
  async listBarbers(barbershopId: string): Promise<Barber[]> {
    await delay();
    return mockBarbers.filter(b => b.barbershopId === barbershopId);
  },
  // Services
  async listServices(barbershopId: string): Promise<Service[]> {
    await delay();
    return mockServices.filter(s => s.barbershopId === barbershopId);
  },
  // Clients
  async listClients(barbershopId: string): Promise<Client[]> {
    await delay();
    return mockClients.filter(c => c.barbershopId === barbershopId);
  },
  async getClient(id: string): Promise<Client | null> {
    await delay();
    return mockClients.find(c => c.id === id) ?? null;
  },
  // Appointments
  async listAppointments(barbershopId: string, opts?: { from?: Date; to?: Date }): Promise<Appointment[]> {
    await delay();
    return mockAppointments
      .filter(a => a.barbershopId === barbershopId)
      .filter(a => {
        if (opts?.from && new Date(a.start) < opts.from) return false;
        if (opts?.to && new Date(a.start) > opts.to) return false;
        return true;
      });
  },
  async createAppointment(input: Omit<Appointment, "id">): Promise<Appointment> {
    await delay();
    const a: Appointment = { ...input, id: `a-${Date.now()}` };
    pushAppointment(a);
    return a;
  },
  async updateAppointment(id: string, patch: Partial<Appointment>): Promise<void> {
    await delay();
    updateAppointment(id, patch);
  },
  async deleteAppointment(id: string): Promise<void> {
    await delay();
    removeAppointment(id);
  },
  // Finance
  async listFinance(barbershopId: string): Promise<FinanceEntry[]> {
    await delay();
    return mockFinance.filter(f => f.barbershopId === barbershopId);
  },
  // Availability
  async getAvailableSlots(opts: { barbershopId: string; barberId: string | "any"; serviceId: string; date: Date }): Promise<string[]> {
    await delay();
    const svc = mockServices.find(s => s.id === opts.serviceId);
    if (!svc) return [];
    const barbers = opts.barberId === "any"
      ? mockBarbers.filter(b => svc.barberIds.includes(b.id))
      : mockBarbers.filter(b => b.id === opts.barberId);
    const day = new Date(opts.date); day.setHours(0,0,0,0);
    const slots: Set<string> = new Set();
    for (const barber of barbers) {
      if (!barber.workingDays.includes(day.getDay())) continue;
      const startH = parseInt(barber.workStart.split(":")[0], 10);
      const endH = parseInt(barber.workEnd.split(":")[0], 10);
      for (let h = startH; h < endH; h++) {
        for (const m of [0, 30]) {
          const slot = new Date(day); slot.setHours(h, m, 0, 0);
          const slotEnd = new Date(slot.getTime() + svc.durationMin*60000);
          if (slot < new Date()) continue;
          const conflict = mockAppointments.some(a =>
            a.barberId === barber.id && a.status !== "cancelled" &&
            !(new Date(a.end) <= slot || new Date(a.start) >= slotEnd)
          );
          if (!conflict) slots.add(slot.toISOString());
        }
      }
    }
    return Array.from(slots).sort();
  },
};
