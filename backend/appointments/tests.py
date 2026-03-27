from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from datetime import timedelta
from .models import Appointment


class AppointmentTestCase(TestCase):

    def setUp(self):
        """Configuración inicial para todos los tests."""
        self.client = APIClient()

        # Crear usuario de prueba
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123'
        )

        # Obtener token JWT
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'testpass123'
        })
        self.token = response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

        # Fecha futura para pruebas válidas
        self.future_date = (timezone.now() + timedelta(days=5)).strftime('%Y-%m-%dT%H:%M:%S%z')
        self.past_date = (timezone.now() - timedelta(days=5)).strftime('%Y-%m-%dT%H:%M:%S%z')

    def test_no_crear_cita_con_fecha_pasada(self):
        """Una cita no puede crearse con fecha en el pasado."""
        response = self.client.post('/api/appointments/', {
            'scheduled_at': self.past_date,
            'supplier':     'A',
            'product_line': 'Camisetas',
            'status':       'Programada',
            'observations': 'Test fecha pasada'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('scheduled_at', response.data)

    def test_entregada_requiere_delivered_at(self):
        """El estado Entregada requiere que delivered_at esté presente."""
        response = self.client.post('/api/appointments/', {
            'scheduled_at': self.future_date,
            'supplier':     'B',
            'product_line': 'Zapatos',
            'status':       'Entregada',
            'observations': 'Sin fecha de entrega'
            # delivered_at ausente intencionalmente
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('delivered_at', response.data)

    def test_no_permitir_transicion_entregada_a_programada(self):
        """No se puede cambiar el estado de Entregada a Programada."""
        # Crear cita con estado Entregada directamente en la BD
        appointment = Appointment.objects.create(
            scheduled_at=timezone.now() + timedelta(days=3),
            delivered_at=timezone.now() + timedelta(days=3, hours=2),
            supplier='C',
            product_line='Pantalones',
            status=Appointment.Status.ENTREGADA,
            observations='Cita entregada',
            created_by=self.user
        )

        # Intentar cambiar a Programada
        response = self.client.patch(f'/api/appointments/{appointment.id}/', {
            'status': 'Programada'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_usuario_no_autenticado_recibe_401(self):
        """Un usuario sin token recibe 401 en endpoints protegidos."""
        # Cliente sin credenciales
        unauthenticated_client = APIClient()
        response = unauthenticated_client.get('/api/appointments/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
