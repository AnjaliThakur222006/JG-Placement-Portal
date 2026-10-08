from django.http import JsonResponse
from django.urls import path, include


def home(request):
    return JsonResponse({
        "status": "ok",
        "service": "JG Placement Portal API",
        "message": "Backend API is running successfully.",
        "api": "/api/",
        "health": "/api/health/"
    })


urlpatterns = [
    path('', home, name='home'),
    path('api/', include('api.urls')),
]