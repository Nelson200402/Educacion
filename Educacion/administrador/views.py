from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .models import Usuarios, Materias, Planes, Sesiones_Estudios
from .serializers import (
    UsuariosSerializer,
    MateriasSerializer,
    PlanesSerializer,
    SeccionEstudioSerializer
)

# ------------------------------
# Helpers
# ------------------------------
def get_usuario_from_request(request):
    """Busca el registro en tu tabla administrador.Usuarios usando el email del auth user."""
    user = request.user
    if not user or not user.is_authenticated:
        return None
    return Usuarios.objects.filter(Correo=user.email).first()


# ------------------------------
# VIEWSETS
# ------------------------------
class UsuariosViewSet(viewsets.ModelViewSet):
    queryset = Usuarios.objects.all()
    serializer_class = UsuariosSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Opcional: si quieres que SOLO vean su propio perfil:
        usuario = get_usuario_from_request(self.request)
        if not usuario:
            return Usuarios.objects.none()
        return Usuarios.objects.filter(id=usuario.id)


class MateriasViewSet(viewsets.ModelViewSet):
    queryset = Materias.objects.all()
    serializer_class = MateriasSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        usuario = get_usuario_from_request(self.request)
        if not usuario:
            return Materias.objects.none()
        return Materias.objects.filter(Usuarios_id=usuario).order_by("-id")

    def perform_create(self, serializer):
        usuario = get_usuario_from_request(self.request)
        if not usuario:
            raise ValueError("Perfil incompleto: no existe registro en Usuarios para este correo.")
        serializer.save(Usuarios_id=usuario)


class PlanesViewSet(viewsets.ModelViewSet):
    queryset = Planes.objects.all()
    serializer_class = PlanesSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        usuario = get_usuario_from_request(self.request)
        if not usuario:
            return Planes.objects.none()
        return Planes.objects.filter(Usuarios_id=usuario).order_by("-id")

    def perform_create(self, serializer):
        usuario = get_usuario_from_request(self.request)
        if not usuario:
            raise ValueError("Perfil incompleto: no existe registro en Usuarios para este correo.")
        serializer.save(Usuarios_id=usuario)


class Sesiones_EstudiosViewSet(viewsets.ModelViewSet):
    queryset = Sesiones_Estudios.objects.all()  # ✅ ESTO arregla el router/register
    serializer_class = SeccionEstudioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        usuario = get_usuario_from_request(self.request)
        if not usuario:
            return Sesiones_Estudios.objects.none()

        qs = Sesiones_Estudios.objects.filter(Usuarios_id=usuario)

        fecha = self.request.query_params.get("fecha")
        if fecha:
            qs = qs.filter(fecha=fecha)

        return qs.order_by("fecha", "hora_inicio")

    def perform_create(self, serializer):
        usuario = get_usuario_from_request(self.request)
        if not usuario:
            raise ValueError("Perfil incompleto: no existe registro en Usuarios para este correo.")
        serializer.save(Usuarios_id=usuario)


# ------------------------------
# AUTH endpoints
# ------------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def authenticated_user(request):
    user = request.user
    data = {
        "id": user.id,
        "username": user.get_username(),
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
    }

    usuario_record = Usuarios.objects.filter(Correo=user.email).first()
    if usuario_record:
        data["usuario"] = {
            "id": usuario_record.id,
            "Nombre": usuario_record.Nombre,
            "Correo": usuario_record.Correo,
            "nivel_estudios": usuario_record.nivel_estudios,
        }

    return Response(data)


@api_view(["POST"])
@permission_classes([AllowAny])
def login_custom(request):
    from django.contrib.auth import authenticate
    from rest_framework.authtoken.models import Token

    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response({"error": "username y password requeridos"}, status=400)

    user = authenticate(request, username=username, password=password)
    if not user:
        return Response({"error": "Credenciales inválidas"}, status=401)

    token, _ = Token.objects.get_or_create(user=user)

    user_data = {
        "id": user.id,
        "username": user.get_username(),
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
    }

    usuario_record = Usuarios.objects.filter(Correo=user.email).first()
    if usuario_record:
        user_data["usuario"] = {
            "id": usuario_record.id,
            "Nombre": usuario_record.Nombre,
            "Correo": usuario_record.Correo,
            "nivel_estudios": usuario_record.nivel_estudios,
        }

    return Response({"token": token.key, "user": user_data})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    from django.contrib.auth import authenticate

    user = request.user
    old_password = request.data.get("old_password")
    new_password = request.data.get("new_password")

    if not old_password or not new_password:
        return Response({"error": "old_password y new_password requeridos"}, status=400)

    if not authenticate(request, username=user.username, password=old_password):
        return Response({"error": "Contraseña actual incorrecta"}, status=401)

    if len(new_password) < 6:
        return Response({"error": "La nueva contraseña debe tener al menos 6 caracteres"}, status=400)

    user.set_password(new_password)
    user.save()
    return Response({"message": "Contraseña actualizada exitosamente"})


@api_view(["POST"])
@permission_classes([])
def register(request):
    from django.contrib.auth.models import User
    from rest_framework.authtoken.models import Token
    from .models import Usuarios

    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")

    if not username or not email or not password:
        return Response(
            {"error": "username, email y password requeridos"},
            status=400
        )

    if len(password) < 6:
        return Response(
            {"error": "La contraseña debe tener al menos 6 caracteres"},
            status=400
        )

    if User.objects.filter(username=username).exists():
        return Response({"error": "El usuario ya existe"}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({"error": "El email ya está registrado"}, status=400)

    # 1️⃣ Crear usuario auth
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )

    # 2️⃣ Crear perfil en administrador.Usuarios (CLAVE)
    usuario, _ = Usuarios.objects.get_or_create(
        Correo=email,
        defaults={
            "Nombre": username,
            "nivel_estudios": "",
            "disponibilidad": True,
            "Dias_Libres": "",
            "periodo_prefencia": "Indiferente",
        }
    )

    # 3️⃣ Token
    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        "token": token.key,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "usuario": {
                "id": usuario.id,
                "Nombre": usuario.Nombre,
                "Correo": usuario.Correo,
                "nivel_estudios": usuario.nivel_estudios,
            }
        }
    }, status=201)
