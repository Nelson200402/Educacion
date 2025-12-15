# administrador/views.py
from rest_framework import viewsets
from .models import Usuarios, Materias, Planes, Sesiones_Estudios
from .serializers import (
    UsuariosSerializer,
    MateriasSerializer,
    PlanesSerializer,
    SeccionEstudioSerializer
)


class UsuariosViewSet(viewsets.ModelViewSet):
    queryset = Usuarios.objects.all()
    serializer_class = UsuariosSerializer


class MateriasViewSet(viewsets.ModelViewSet):
    queryset = Materias.objects.all()
    serializer_class = MateriasSerializer


class PlanesViewSet(viewsets.ModelViewSet):
    queryset = Planes.objects.all()
    serializer_class = PlanesSerializer


class Sesiones_EstudiosViewSet(viewsets.ModelViewSet):
    serializer_class = SeccionEstudioSerializer

    def get_queryset(self):
        qs = Sesiones_Estudios.objects.all()
        usuario_id = self.request.query_params.get("usuario_id")
        fecha = self.request.query_params.get("fecha")

        if usuario_id:
            qs = qs.filter(Usuarios_id_id=usuario_id)
        if fecha:
            qs = qs.filter(fecha=fecha)

        return qs.order_by("fecha", "hora_inicio")
