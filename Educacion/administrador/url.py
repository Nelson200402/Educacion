from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UsuariosViewSet,
    MateriasViewSet,
    PlanesViewSet,
    Sesiones_EstudiosViewSet
)

router = DefaultRouter()
router.register("usuarios", UsuariosViewSet)
router.register("materias", MateriasViewSet)
router.register("planes", PlanesViewSet)
router.register("secciones", Sesiones_EstudiosViewSet)

urlpatterns = [
    path("", include(router.urls))
]