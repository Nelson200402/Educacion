from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UsuariosViewSet,
    MateriasViewSet,
    PlanesViewSet,
    Sesiones_EstudiosViewSet,
    authenticated_user,
    login_custom,
    change_password,
    register
)

router = DefaultRouter()
router.register("usuarios", UsuariosViewSet, basename="usuarios")
router.register("materias", MateriasViewSet, basename="materias")
router.register("planes", PlanesViewSet, basename="planes")
router.register("secciones", Sesiones_EstudiosViewSet, basename="secciones")

urlpatterns = [
    path("", include(router.urls)),
    path("auth/user/", authenticated_user, name="authenticated_user"),
    path("auth/login/", login_custom, name="login_custom"),
    path("auth/change-password/", change_password, name="change_password"),
    path("auth/register/", register, name="register"),
]
