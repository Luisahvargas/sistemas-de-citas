from rest_framework import viewsets, status, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from .models import Appointment
from .serializers import AppointmentSerializer
from . import services
from .pagination import AppointmentPagination
from rest_framework.views import APIView
from django.db import connection
from datetime import datetime
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError


class AppointmentViewSet(viewsets.ModelViewSet):
    pagination_class = AppointmentPagination
    permission_classes = [IsAuthenticated]
    serializer_class = AppointmentSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['status', 'supplier', 'product_line']
    ordering_fields = ['scheduled_at', 'created_at']

    def get_queryset(self):
        queryset = Appointment.objects.select_related('created_by').all()

        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')

        if date_from:
            queryset = queryset.filter(scheduled_at__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(scheduled_at__date__lte=date_to)

        return queryset

    def perform_create(self, serializer):
        try:
            appointment = services.create_appointment(
                data=serializer.validated_data,
                user=self.request.user
            )
            serializer.instance = appointment
        except ValidationError as e:
            raise serializers.ValidationError(e.message_dict)

    def perform_update(self, serializer):
        try:
            services.update_appointment(
                appointment=serializer.instance,
                data=serializer.validated_data
            )
        except ValidationError as e:
            from rest_framework import serializers as drf_serializers
            raise drf_serializers.ValidationError({"detail": str(e)})

    def destroy(self, request, *args, **kwargs):
        """No permitir eliminación física — cancelar en su lugar."""
        return Response(
            {"detail": "No se permite eliminar citas. Use el estado 'Cancelada'."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )


class DeliveryReportView(APIView):
    """
    Reporte de tiempo promedio de entrega agrupado por sublínea.
    Usa SQL nativo como requiere la prueba técnica.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        date_from = request.query_params.get('date_from')
        date_to = request.query_params.get('date_to')

        # Valores por defecto si no se envían fechas
        if not date_from:
            date_from = '2000-01-01'
        if not date_to:
            date_to = '2099-12-31'

        # Valida formato de fechas
        try:
            datetime.strptime(date_from, '%Y-%m-%d')
            datetime.strptime(date_to, '%Y-%m-%d')
        except ValueError:
            return Response(
                {"detail": "Formato de fecha inválido. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # SQL NATIVO
        sql = """
            SELECT
                product_line,
                COUNT(*) AS total_deliveries,
                AVG(
                    EXTRACT(EPOCH FROM (delivered_at - scheduled_at)) / 3600
                ) AS avg_hours,
                AVG(
                    EXTRACT(EPOCH FROM (delivered_at - scheduled_at)) / 60
                ) AS avg_minutes
            FROM appointments_appointment
            WHERE status = 'Entregada'
              AND scheduled_at::date BETWEEN %(date_from)s AND %(date_to)s
            GROUP BY product_line
            ORDER BY product_line;
        """

        with connection.cursor() as cursor:
            cursor.execute(sql, {'date_from': date_from, 'date_to': date_to})
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchall()

        results = [
            dict(zip(columns, row))
            for row in rows
        ]

        for item in results:
            item['avg_hours'] = round(float(item['avg_hours']),   2)
            item['avg_minutes'] = round(float(item['avg_minutes']), 2)

        return Response({
            "date_from": date_from,
            "date_to":   date_to,
            "results":   results
        })


class LogoutView(APIView):
    """Invalidar el refresh token para cerrar sesión."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {"detail": "Se requiere el refresh token."},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {"detail": "Sesión cerrada correctamente."},
                status=status.HTTP_200_OK
            )
        except TokenError:
            return Response(
                {"detail": "Token inválido o ya expirado."},
                status=status.HTTP_400_BAD_REQUEST
            )
