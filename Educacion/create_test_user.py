#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Educacion.settings')
django.setup()

from administrador.models import Usuarios

# Crear usuario de prueba
usuario, created = Usuarios.objects.get_or_create(
    Nombre='testuser',
    defaults={
        'Correo': 'testuser@example.com',
        'nivel_estudios': 'Secundaria',
        'disponibilidad': True,
        'Dias_Libres': 'Lunes, Miércoles, Viernes',
        'periodo_prefencia': 'Mañana'
    }
)

if created:
    print(f"✅ Usuario creado: {usuario.Nombre} (ID: {usuario.id})")
else:
    print(f"ℹ️ Usuario ya existe: {usuario.Nombre} (ID: {usuario.id})")
