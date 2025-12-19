// src/data/SesionEstudioData.ts
import type { SesionEstudio } from "@/src/entidades/SesionEstudio";
import { http } from "./http";

export const SesionEstudioData = {
  // ✅ “mis sesiones” (backend filtra por token)
  getAll: () => http.get<SesionEstudio[]>("/secciones/"),

  show: (id: number) => http.get<SesionEstudio>(`/secciones/${id}/`),

  // ✅ COMPAT: no rompe pantallas viejas, pero el backend lo ignora
  byUsuario: (_usuarioId: number) => http.get<SesionEstudio[]>("/secciones/"),

  // ✅ sí sirve (tu backend filtra por fecha)
  byDate: (fecha: string) =>
    http.get<SesionEstudio[]>(`/secciones/?fecha=${encodeURIComponent(fecha)}`),

  create: (payload: Partial<SesionEstudio>) =>
    http.post<SesionEstudio>("/secciones/", payload),

  update: (id: number, payload: Partial<SesionEstudio>) =>
    http.put<SesionEstudio>(`/secciones/${id}/`, payload),

  remove: (id: number) =>
    http.delete<{ ok: boolean }>(`/secciones/${id}/`),

  toggleEstado: (id: number, estado: boolean) =>
    http.patch<SesionEstudio>(`/secciones/${id}/`, { estado }),
};
