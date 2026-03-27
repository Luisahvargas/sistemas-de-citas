from rest_framework import serializers
from django.utils import timezone
from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):

    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'scheduled_at', 'supplier', 'product_line',
            'status', 'delivered_at', 'observations',
            'created_by', 'created_by_username', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def validate_scheduled_at(self, value):
        """No permitir fechas en el pasado al crear"""
        if self.instance is None and value < timezone.now():
            raise serializers.ValidationError(
                "La fecha programada no puede ser en el pasado.")
        return value

    def validate(self, data):
        """Validaciones que involucran varios campos."""
        status = data.get('status', getattr(self.instance, 'status', None))
        delivered_at = data.get('delivered_at', getattr(self.instance, 'delivered_at', None))

        # delivered_at obligatorio si status = Entregada
        if status == Appointment.Status.ENTREGADA and not delivered_at:
            raise serializers.ValidationError(
                {"delivered_at": "La fecha de entrega es obligatoria cuando el estado es 'Entregada'."}
            )

        return data
