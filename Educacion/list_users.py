#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Educacion.settings')
django.setup()

from django.contrib.auth.models import User

print("=" * 60)
print("USUARIOS REGISTRADOS EN LA BASE DE DATOS")
print("=" * 60)

users = User.objects.all()
if users.exists():
    for user in users:
        print(f"\nUsuario: {user.username}")
        print(f"Email: {user.email}")
        print(f"ID: {user.id}")
        print(f"Es superusuario: {user.is_superuser}")
else:
    print("\nNo hay usuarios registrados")

print("\n" + "=" * 60)
