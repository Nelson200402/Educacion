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
# PLANES
# ------------------------------
class PlanesSerializer(serializers.ModelSerializer):
    # ✅ NO uses source="Usuarios_id" porque es redundante y truena
    Usuarios_id = serializers.PrimaryKeyRelatedField(
        queryset=Usuarios.objects.all(),
        write_only=True
    )

    # para mostrar algo legible al hacer GET
    usuario = serializers.StringRelatedField(
        read_only=True,
        source="Usuarios_id"
    )

    class Meta:
        model = Planes
        fields = [
            "id",
            "Usuarios_id", "usuario",
            "Nombre", "contenido", "fuente",
            "estado",
            "created_at", "updated_at"
        ]


# ------------------------------
# SESIONES DE ESTUDIO
# ------------------------------
class SeccionEstudioSerializer(serializers.ModelSerializer):
    # ✅ que se pueda escribir y también leer (NO write_only)
    Usuarios_id = serializers.PrimaryKeyRelatedField(queryset=Usuarios.objects.all())
    Materias_id = serializers.PrimaryKeyRelatedField(queryset=Materias.objects.all())
    Planes_id = serializers.PrimaryKeyRelatedField(
        queryset=Planes.objects.all(),
        required=False,
        allow_null=True
    )

    # ✅ extras “amigables” para el front (opcionales)
    usuario_id = serializers.IntegerField(source="Usuarios_id_id", read_only=True)
    materia_id = serializers.IntegerField(source="Materias_id_id", read_only=True)
    plan_id = serializers.IntegerField(source="Planes_id_id", read_only=True)

    class Meta:
        model = Sesiones_Estudios
        fields = "__all__"


# ✅ Alias por si en views.py lo importaron con otro nombre
SesionEstudioSerializer = SeccionEstudioSerializer
SesionesEstudiosSerializer = SeccionEstudioSerializer
