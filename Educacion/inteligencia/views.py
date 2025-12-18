from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from administrador.models import Usuarios
from .utils import construir_contexto
from .services import gemini_responder


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def recomendar_materia(request):
    """
    POST /ia/
    Body esperado:
      - pregunta: string
    (usuario_id puede venir, pero se IGNORA por seguridad)
    """
    pregunta = (request.data.get("pregunta") or "").strip()
    if not pregunta:
        return Response(
            {"detail": "El campo 'pregunta' es obligatorio."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # 🔐 Usuario real desde el token (NO desde usuario_id del frontend)
    usuario = Usuarios.objects.filter(Correo=request.user.email).first()
    if not usuario:
        return Response(
            {
                "detail": "Perfil incompleto: no existe un registro en 'Usuarios' para este correo. Completa tu perfil."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        contexto = construir_contexto(usuario.id)
        prompt = (
            "Eres un asistente experto en planificación de estudio.\n\n"
            f"{contexto}\n\n"
            "Pregunta del usuario:\n"
            f"{pregunta}\n\n"
            "Devuelve una recomendación clara y accionable."
        )
        recomendacion = gemini_responder(prompt)

        return Response(
            {
                "usuario_id": usuario.id,
                "pregunta": pregunta,
                "recomendacion": recomendacion,
            },
            status=status.HTTP_200_OK,
        )
    except Exception as e:
        return Response(
            {"detail": f"No se pudo generar recomendación: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
