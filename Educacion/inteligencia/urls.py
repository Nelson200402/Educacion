from django.urls import path
from .views import recomendar_materia

urlpatterns = [
    path("", recomendar_materia),
]
