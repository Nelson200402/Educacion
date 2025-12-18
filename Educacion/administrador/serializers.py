from rest_framework import serializers
from .models import Usuarios, Materias, Planes, Sesiones_Estudios


# ------------------------------
# USUARIOS
# ------------------------------
class UsuariosSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuarios
        fields = "__all__"
        read_only_fields = ("id", "Correo", "created_at", "updated_at")


# ------------------------------
# MATERIAS
# ------------------------------
class MateriasSerializer(serializers.ModelSerializer):
    # 🔐 usuario SOLO lectura (se asigna en el ViewSet)
    Usuarios_id = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = Materias
        fields = "__all__"
        read_only_fields = ("id", "Usuarios_id", "created_at", "updated_at")


# ------------------------------
# PLANES
# ------------------------------
class PlanesSerializer(serializers.ModelSerializer):
    Usuarios_id = serializers.PrimaryKeyRelatedField(read_only=True)

    usuario = serializers.StringRelatedField(
        read_only=True,
        source="Usuarios_id"
    )

    class Meta:
        model = Planes
        fields = [
            "id",
            "Usuarios_id",
            "usuario",
            "Nombre",
            "contenido",
            "fuente",
            "estado",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ("id", "Usuarios_id", "created_at", "updated_at")


# ------------------------------
# SESIONES DE ESTUDIO
# ------------------------------
class SeccionEstudioSerializer(serializers.ModelSerializer):
    # 🔐 usuario SOLO lectura
    Usuarios_id = serializers.PrimaryKeyRelatedField(read_only=True)

    Materias_id = serializers.PrimaryKeyRelatedField(queryset=Materias.objects.all())
    Planes_id = serializers.PrimaryKeyRelatedField(
        queryset=Planes.objects.all(),
        required=False,
        allow_null=True
    )

    # extras amigables para el frontend
    usuario_id = serializers.IntegerField(source="Usuarios_id_id", read_only=True)
    materia_id = serializers.IntegerField(source="Materias_id_id", read_only=True)
    plan_id = serializers.IntegerField(source="Planes_id_id", read_only=True)

    class Meta:
        model = Sesiones_Estudios
        fields = "__all__"
        read_only_fields = (
            "id",
            "Usuarios_id",
            "created_at",
            "updated_at",
        )


# aliases
SesionEstudioSerializer = SeccionEstudioSerializer
SesionesEstudiosSerializer = SeccionEstudioSerializer
