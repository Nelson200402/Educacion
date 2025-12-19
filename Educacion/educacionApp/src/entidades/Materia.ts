export type Materia = {
  id: number;
  Nombre: string;
  Dificultad: string;     // si en tu BD es int, igual llega como string a veces
  Notas?: string | null;  // opcional (para no romper si el backend no lo manda)
};
