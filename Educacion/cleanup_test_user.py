#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Educacion.settings')
django.setup()

from django.contrib.auth.models import User

# Eliminar usuario de prueba nuevouser
try:
    user = User.objects.get(username='nuevouser')
    user.delete()
    print(f"✅ Usuario 'nuevouser' eliminado")
except User.DoesNotExist:
    print("ℹ️ Usuario 'nuevouser' no existe")
