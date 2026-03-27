import uuid
from django.db import models
from django.contrib.auth.models import User


class Appointment(models.Model):
    class Supplier(models.TextChoices):
        A = 'A', 'Proveedor A'
        B = 'B', 'Proveedor B'
        C = 'C', 'Proveedor C'

    class ProductLine(models.TextChoices):
        CAMISETAS = 'Camisetas',   'Camisetas'
        PANTALONES = 'Pantalones',  'Pantalones'
        ZAPATOS = 'Zapatos',     'Zapatos'
        ACCESORIOS = 'Accesorios',  'Accesorios'

    class Status(models.TextChoices):
        PROGRAMADA = 'Programada',  'Programada'
        EN_PROCESO = 'En proceso',  'En proceso'
        ENTREGADA = 'Entregada',   'Entregada'
        CANCELADA = 'Cancelada',   'Cancelada'
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    scheduled_at = models.DateTimeField()
    supplier = models.CharField(max_length=1, choices=Supplier.choices)
    product_line = models.CharField(max_length=20, choices=ProductLine.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PROGRAMADA)
    delivered_at = models.DateTimeField(null=True, blank=True)
    observations = models.TextField(blank=True, default='')
    created_by = models.ForeignKey(User, on_delete=models.PROTECT, related_name='appointments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-scheduled_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['supplier']),
            models.Index(fields=['product_line']),
            models.Index(fields=['scheduled_at']),
        ]

    def __str__(self):
        return f"Cita {self.supplier} - {self.product_line} ({self.status})"
