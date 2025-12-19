import { http } from "./http";

export type IAGenerarCalendarioResponse = {
  plan: { Nombre: string; contenido: string; fuente: string };
  sesiones: Array<{
    fecha: string;
    hora_inicio: string;
    duracion: number;
    Nombre: string;
    descripcion: string;
    Materias_id: number;
  }>;
};

export const IACalendarioData = {
  generarCalendario(payload: {
    materia_id: number;
    temas: string;
    fecha_objetivo: string;
    horas_por_dia: number;
    preferencia_horario: string;
  }) {
    return http.post<IAGenerarCalendarioResponse>(
      "/inteligencia/generar_calendario/",
      payload
    );
  },
};
