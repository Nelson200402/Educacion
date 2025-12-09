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
    queryset = Sesiones_Estudios.objects.all()
    serializer_class = SeccionEstudioSerializer
