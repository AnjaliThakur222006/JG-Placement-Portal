from django.http import HttpResponse

class CorsMiddleware:
    """Dependency-free CORS middleware for the Angular dev server."""
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.method == 'OPTIONS':
            response = HttpResponse(status=204)
        else:
            response = self.get_response(request)
        response['Access-Control-Allow-Origin'] = request.headers.get('Origin', 'http://localhost:4200')
        response['Access-Control-Allow-Credentials'] = 'true'
        response['Access-Control-Allow-Headers'] = 'Content-Type, X-API-Token, Authorization'
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
        return response
