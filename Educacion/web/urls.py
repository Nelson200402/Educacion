"""
Deprecated: web app URLs
This module left in place as a placeholder; the app was deactivated in project urls.
"""
from django.urls import path

def placeholder(request):
    from django.http import HttpResponse
    return HttpResponse('Web app deprecated.')

urlpatterns = [
    path('', placeholder),
]
