export interface Plan {
  id: number;
  Usuarios_id: number;     // se envía como número
  usuario?: string;        // viene en respuesta (stringrelated)
  Nombre: string;
  contenido: string;
  fuente: string;
  estado: boolean;
  created_at: string;
  updated_at: string;
}
