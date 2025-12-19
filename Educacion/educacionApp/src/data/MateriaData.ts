import type { Materia } from "@/src/entidades/Materia";
import { http } from "./http";

export const MateriaData = {
  getAll: () => http.get<Materia[]>("/materias/"),

  show: (id: number) => http.get<Materia>(`/materias/${id}/`),

  create: (payload: Partial<Materia>) =>
    http.post<Materia>("/materias/", payload),

  update: (id: number, payload: Partial<Materia>) =>
    http.put<Materia>(`/materias/${id}/`, payload),

  // si tu backend soporta PATCH, úsalo. Si no, borra esto.
  patch: (id: number, payload: Partial<Materia>) =>
    http.patch<Materia>(`/materias/${id}/`, payload),

  delete: (id: number) =>
    http.delete<{ ok?: boolean }>(`/materias/${id}/`),
};
