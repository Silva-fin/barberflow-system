import type {
  Appointment, Barber, Barbershop, Client, FinanceEntry, Service,
} from "@/lib/api/types";

export const mockBarbershop: Barbershop = {
  id: "shop-1",
  slug: "barbearia-do-zeca",
  name: "Barbearia do Zeca",
  address: "Rua Augusta, 1500 — São Paulo, SP",
  phone: "(11) 99876-5432",
  description: "Tradição e estilo desde 1998. Cortes clássicos e modernos.",
};

export const mockBarbers: Barber[] = [
  { id: "b-1", barbershopId: "shop-1", name: "Zeca Almeida", specialties: ["Corte clássico", "Barba"], commissionPct: 50, workingDays: [1,2,3,4,5,6], workStart: "09:00", workEnd: "19:00" },
  { id: "b-2", barbershopId: "shop-1", name: "Rafa Mendes", specialties: ["Degradê", "Pigmentação"], commissionPct: 45, workingDays: [2,3,4,5,6], workStart: "10:00", workEnd: "20:00" },
  { id: "b-3", barbershopId: "shop-1", name: "Caio Souza", specialties: ["Navalhado", "Barba"], commissionPct: 45, workingDays: [1,3,4,5,6], workStart: "09:00", workEnd: "18:00" },
  { id: "b-4", barbershopId: "shop-1", name: "Bruno Lima", specialties: ["Infantil", "Corte social"], commissionPct: 40, workingDays: [2,3,4,5,6], workStart: "11:00", workEnd: "20:00" },
];

export const mockServices: Service[] = [
  { id: "s-1", barbershopId: "shop-1", name: "Corte masculino", description: "Corte na máquina e tesoura", durationMin: 30, priceCents: 5000, barberIds: ["b-1","b-2","b-3","b-4"] },
  { id: "s-2", barbershopId: "shop-1", name: "Barba completa", description: "Toalha quente, óleo e navalha", durationMin: 30, priceCents: 4000, barberIds: ["b-1","b-3"] },
  { id: "s-3", barbershopId: "shop-1", name: "Corte + Barba", description: "Combo completo", durationMin: 60, priceCents: 8000, barberIds: ["b-1","b-3"] },
  { id: "s-4", barbershopId: "shop-1", name: "Degradê navalhado", description: "Acabamento na navalha", durationMin: 45, priceCents: 6500, barberIds: ["b-2","b-3"] },
  { id: "s-5", barbershopId: "shop-1", name: "Pigmentação", description: "Disfarce de falhas", durationMin: 60, priceCents: 9000, barberIds: ["b-2"] },
  { id: "s-6", barbershopId: "shop-1", name: "Corte infantil", description: "Até 10 anos", durationMin: 30, priceCents: 4000, barberIds: ["b-4"] },
];

const firstNames = ["André","Bruno","Carlos","Daniel","Eduardo","Felipe","Gustavo","Henrique","Igor","João","Lucas","Marcos","Nelson","Otávio","Paulo","Rafael","Sérgio","Tiago","Vitor","Wagner"];
const lastNames = ["Silva","Santos","Oliveira","Souza","Lima","Pereira","Costa","Almeida","Ferreira","Rodrigues","Carvalho","Martins","Gomes","Ribeiro","Barbosa"];

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random()*arr.length)]; }

export const mockClients: Client[] = Array.from({ length: 24 }, (_, i) => ({
  id: `c-${i+1}`,
  barbershopId: "shop-1",
  name: `${rand(firstNames)} ${rand(lastNames)}`,
  phone: `(11) 9${String(80000000 + Math.floor(Math.random()*19999999))}`,
  email: i % 3 === 0 ? `cliente${i+1}@email.com` : undefined,
  notes: i % 5 === 0 ? "Prefere corte mais curto nas laterais" : undefined,
  createdAt: new Date(Date.now() - Math.random()*1000*60*60*24*365).toISOString(),
  totalAppointments: 1 + Math.floor(Math.random()*30),
  totalSpentCents: (1 + Math.floor(Math.random()*40)) * 5000,
}));

// Generate appointments around today
function buildAppointments(): Appointment[] {
  const out: Appointment[] = [];
  const today = new Date();
  today.setMinutes(0,0,0);
  let id = 1;
  for (let dayOffset = -7; dayOffset <= 7; dayOffset++) {
    const day = new Date(today);
    day.setDate(today.getDate() + dayOffset);
    if (day.getDay() === 0) continue; // closed sun
    for (const barber of mockBarbers) {
      const startHour = parseInt(barber.workStart.split(":")[0], 10);
      const endHour = parseInt(barber.workEnd.split(":")[0], 10);
      for (let h = startHour; h < endHour; h++) {
        if (Math.random() > 0.45) continue;
        const svc = rand(mockServices.filter(s => s.barberIds.includes(barber.id)));
        const client = rand(mockClients);
        const start = new Date(day);
        start.setHours(h, Math.random() > 0.5 ? 0 : 30, 0, 0);
        const end = new Date(start.getTime() + svc.durationMin*60000);
        const status: Appointment["status"] = dayOffset < 0
          ? (Math.random() > 0.1 ? "completed" : "no_show")
          : "scheduled";
        out.push({
          id: `a-${id++}`,
          barbershopId: "shop-1",
          barberId: barber.id,
          serviceId: svc.id,
          clientId: client.id,
          start: start.toISOString(),
          end: end.toISOString(),
          status,
          priceCents: svc.priceCents,
        });
      }
    }
  }
  return out;
}

export let mockAppointments: Appointment[] = buildAppointments();

export const mockFinance: FinanceEntry[] = [
  ...Array.from({ length: 30 }, (_, i) => ({
    id: `f-i-${i}`, barbershopId: "shop-1", type: "income" as const,
    category: "Serviços", description: "Receita do dia",
    amountCents: 80000 + Math.floor(Math.random()*60000),
    date: new Date(Date.now() - i*86400000).toISOString(),
  })),
  { id: "f-e-1", barbershopId: "shop-1", type: "expense", category: "Aluguel", description: "Aluguel do salão", amountCents: 350000, date: new Date().toISOString() },
  { id: "f-e-2", barbershopId: "shop-1", type: "expense", category: "Produtos", description: "Pomadas e shampoos", amountCents: 80000, date: new Date(Date.now()-3*86400000).toISOString() },
  { id: "f-e-3", barbershopId: "shop-1", type: "expense", category: "Energia", description: "Conta de luz", amountCents: 65000, date: new Date(Date.now()-7*86400000).toISOString() },
];

export function pushAppointment(a: Appointment) {
  mockAppointments = [...mockAppointments, a];
}
export function updateAppointment(id: string, patch: Partial<Appointment>) {
  mockAppointments = mockAppointments.map(a => a.id === id ? { ...a, ...patch } : a);
}
export function removeAppointment(id: string) {
  mockAppointments = mockAppointments.filter(a => a.id !== id);
}
