import { http } from "./http";

export type IARecomendarResponse = {
  usuario_id: number;
  pregunta: string;
  recomendacion: string;
};

export const IAData = {
  recomendarMateria(usuario_id: number, pregunta: string) {
    // tu backend está en /api/ia/
    return http.post<IARecomendarResponse>("/ia/", { usuario_id, pregunta });
  },
};
