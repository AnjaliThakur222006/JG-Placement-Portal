from django.conf import settings
from django.http import HttpResponse
from django.utils.cache import patch_vary_headers

class CorsMiddleware:
    """Dependency-free CORS middleware for the Angular dev server."""
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.method == 'OPTIONS':
            response = HttpResponse(status=204)
        else:
            response = self.get_response(request)
        origin = request.headers.get('Origin')
        if origin and origin.rstrip('/') in settings.CORS_ALLOWED_ORIGINS:
            response['Access-Control-Allow-Origin'] = origin
            response['Access-Control-Allow-Credentials'] = 'true'
            response['Access-Control-Allow-Headers'] = 'Content-Type, X-API-Token, Authorization'
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
            patch_vary_headers(response, ['Origin'])
        return response
