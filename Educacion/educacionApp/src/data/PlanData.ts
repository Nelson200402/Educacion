// src/data/PlanData.ts
import type { Plan } from "@/src/entidades/Plan";
import { http } from "./http";

export const PlanData = {
  getAll: () => http.get<Plan[]>("/planes/"),
  show: (id: number) => http.get<Plan>(`/planes/${id}/`),
  create: (plan: Partial<Plan>) => http.post<Plan>("/planes/", plan),
  update: (id: number, plan: Partial<Plan>) => http.put<Plan>(`/planes/${id}/`, plan),
  patch: (id: number, plan: Partial<Plan>) => http.patch<Plan>(`/planes/${id}/`, plan),
  remove: (id: number) => http.delete<{ ok: boolean }>(`/planes/${id}/`),
};
