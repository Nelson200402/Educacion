from django.db.models import Sum
from administrador.models import Usuarios, Materias, Sesiones_Estudios


def construir_contexto(usuario_id: int) -> str:
    usuario = Usuarios.objects.get(id=usuario_id)

    sesiones = (
        Sesiones_Estudios.objects
        .filter(Usuarios_id_id=usuario_id)
        .select_related("Materias_id", "Planes_id")
    )

    resumen = (
        sesiones.values("Materias_id__Nombre", "Materias_id__Dificultad")
        .annotate(minutos=Sum("duracion"))
        .order_by("-minutos")
    )

    partes = []
    partes.append(f"Usuario: {usuario.Nombre} (ID={usuario.id})")
    partes.append(f"Nivel de estudios: {usuario.nivel_estudios}")
    partes.append(f"Disponibilidad: {usuario.disponibilidad}")
    partes.append(f"Días libres: {usuario.Dias_Libres}")
    partes.append(f"Periodo preferido: {usuario.periodo_prefencia}")
    partes.append("")

    if resumen:
        partes.append("Historial resumido por materia (minutos estudiados):")
        for r in resumen:
            partes.append(
                f"- {r['Materias_id__Nombre']} | "
                f"Dificultad: {r['Materias_id__Dificultad']} | "
                f"Minutos: {r['minutos']}"
            )
    else:
        partes.append("Historial: no hay sesiones previas registradas.")

    partes.append("")
    partes.append("Materias disponibles en el sistema:")
    for m in Materias.objects.all().values("Nombre", "Dificultad")[:200]:
        partes.append(f"- {m['Nombre']} (Dificultad: {m['Dificultad']})")

    return "\n".join(partes)
