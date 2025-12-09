from rest_framework import serializers
from .models import Usuarios, Materias, Planes, Sesiones_Estudios


# ------------------------------
# USUARIOS
# ------------------------------
class UsuariosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuarios
        fields = "__all__"


# ------------------------------
# MATERIAS
# ------------------------------
class MateriasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Materias
        fields = "__all__"


# ------------------------------
# PLANES (con foreign key usuario_id)
# ------------------------------
class PlanesSerializer(serializers.ModelSerializer):

    Usuarios_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuarios.objects.all(),
        source="Usuarios_id",
        write_only=True
    )

    usuario = serializers.StringRelatedField(
        read_only=True,
        source="Usuarios_id"
    )

    class Meta:
        model = Planes
        fields = [
            "id", "Usuarios_id", "usuario", "Nombre", "contenido",
            "fuente", "estado", "created_at", "updated_at"
        ]


# ------------------------------
# SESIÓN DE ESTUDIO
# ------------------------------
class SeccionEstudioSerializer(serializers.ModelSerializer):

    Usuarios_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuarios.objects.all(),
        source="Usuarios_id",
        write_only=True
    )
    usuario = serializers.StringRelatedField(
        read_only=True,
        source="Usuarios_id"
    )

    Materias_id = serializers.PrimaryKeyRelatedField(
        queryset=Materias.objects.all(),
        source="Materias_id",
        write_only=True
    )
    materia = serializers.StringRelatedField(
        read_only=True,
        source="Materias_id"
    )

    Planes_id = serializers.PrimaryKeyRelatedField(
        queryset=Planes.objects.all(),
        source="Planes_id",
        write_only=True
    )
    plan = serializers.StringRelatedField(
        read_only=True,
        source="Planes_id"
    )

    class Meta:
        model = Sesiones_Estudios
        fields = [
            "id",
            "Usuarios_id", "usuario",
            "Materias_id", "materia",
            "Planes_id", "plan",
            "Nombre", "descripcion", "duracion", "estado",
            "created_at", "updated_at"
        ]