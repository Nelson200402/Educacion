// src/entidades/SesionEstudio.ts
export type SesionEstudio = {
  id: number;

  // lo que DEVUELVE tu API (según tus capturas)
  usuario?: string; // "1"
  materia?: string; // "3"
  plan?: string | null;

  // lo que ENVÍAS al crear (write_only en serializer)
  Usuarios_id?: number;
  Materias_id?: number;
  Planes_id?: number | null;

  Nombre: string;
  descripcion: string;
  duracion: number;
  estado: boolean;

  // CAMPOS CLAVE para el calendario
  fecha: string;        // "2025-12-15"
  hora_inicio: string;  // "10:55:56.207629" o "10:55"

  created_at?: string;
  updated_at?: string;
};
