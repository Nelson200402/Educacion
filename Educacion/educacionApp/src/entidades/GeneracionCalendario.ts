export interface GenerarCalendarioInput {
  temas: string;              // texto libre o separado por comas
  fecha_presentacion: string; // "YYYY-MM-DD"
  horas_por_dia: number;      // ej: 2
  dias_libres?: string;       // ej: "sabado, domingo"
  preferencia?: string;       // "mañanas" | "tardes" | etc
}

export interface SesionGenerada {
  id: number;
  Nombre: string;
  descripcion: string;
  duracion: number;
  fecha: string;        // "YYYY-MM-DD"
  hora_inicio: string;  // "HH:mm"
  Materias_id?: number; // si aplica
}
//Todo esto es lo que deberia llenar la IA
export interface GenerarCalendarioOutput {
  sesiones: SesionGenerada[];
}
