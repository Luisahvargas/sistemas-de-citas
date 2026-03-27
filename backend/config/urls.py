from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),

    # JWT
    path('api/auth/login/',   TokenObtainPairView.as_view(),  name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(),     name='token_refresh'),

    # Endpoints de citas
    path('api/', include('appointments.urls')),

    # Swagger
    path('api/schema/',       SpectacularAPIView.as_view(),        name='schema'),
    path('api/docs/',         SpectacularSwaggerView.as_view(),     name='swagger-ui'),
]
