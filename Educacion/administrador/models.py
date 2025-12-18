from django.db import models


class Usuarios(models.Model):
    id = models.AutoField(primary_key=True)
    Nombre = models.CharField(max_length=150, unique=True)
    Correo = models.EmailField(unique=True)
    nivel_estudios = models.CharField(max_length=100)
    disponibilidad = models.BooleanField(default=True)
    Dias_Libres = models.TextField()
    periodo_prefencia = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.id)


class Materias(models.Model):
    id = models.AutoField(primary_key=True)
    Nombre = models.CharField(max_length=250)
    Usuarios_id = models.ForeignKey(Usuarios, on_delete=models.CASCADE, db_column="usuario_id")
    Dificultad = models.CharField(max_length=100)
    Notas = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.id)
    


class Planes(models.Model):
    id = models.AutoField(primary_key=True)
    Usuarios_id = models.ForeignKey(
        Usuarios,
        on_delete=models.CASCADE,
        db_column='usuario_id'
    )
    Nombre = models.CharField(max_length=250)
    contenido = models.TextField()
    fuente = models.CharField(max_length=250)
    estado = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.id)


class Sesiones_Estudios(models.Model):
    id = models.AutoField(primary_key=True)

    Usuarios_id = models.ForeignKey(
        Usuarios,
        on_delete=models.CASCADE,
        db_column='usuario_id'
    )

    Materias_id = models.ForeignKey(
        Materias,
        on_delete=models.CASCADE,
        db_column='materia_id'
    )

    Planes_id = models.ForeignKey(
        Planes,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        db_column='plan_id'
    )

    Nombre = models.CharField(max_length=250)
    descripcion = models.TextField()
    duracion = models.IntegerField()
    estado = models.BooleanField(default=True)

    # ✅ CAMPOS QUE EL CALENDARIO NECESITA
    fecha = models.DateField(null=True, blank=True)
    hora_inicio = models.TimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    def __str__(self):
        return str(self.id)
