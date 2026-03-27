from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import AppointmentViewSet, DeliveryReportView, LogoutView

router = DefaultRouter()
router.register(r'appointments', AppointmentViewSet, basename='appointment')

urlpatterns = router.urls + [
    path('reports/delivery/', DeliveryReportView.as_view(), name='delivery-report'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
]
