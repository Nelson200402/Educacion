from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .utils import construir_contexto
from .services import gemini_responder

@api_view(["POST"])
def recomendar_materia(request):
    usuario_id = request.data.get("usuario_id")
    pregunta = request.data.get("pregunta")

    if not usuario_id or not pregunta:
        return Response({"error": "Debes enviar usuario_id y pregunta"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        usuario_id = int(usuario_id)
    except:
        return Response({"error": "usuario_id debe ser numérico"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        contexto = construir_contexto(usuario_id)
    except Exception as e:
        return Response({"error": f"No se pudo construir contexto: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

    prompt = f"""
Eres un orientador académico.
Debes recomendar SOLO materias que estén en 'Materias disponibles en el sistema'.
Usa historial (minutos), dificultad y preferencias del usuario.

CONTEXTO:
{contexto}

PREGUNTA:
{pregunta}

Devuelve en este formato EXACTO:
- Materia recomendada:
- Por qué (3 razones):
- 2 alternativas:
- Plan de acción para hoy (pasos concretos):
"""

    try:
        respuesta = gemini_responder(prompt)
    except Exception as e:
        return Response({"error": f"Error llamando a Gemini: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({
        "usuario_id": usuario_id,
        "pregunta": pregunta,
        "recomendacion": respuesta
    })
