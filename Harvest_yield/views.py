from django.shortcuts import render
from rest_framework import viewsets ,status
from django.db import models as django_models
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .models import *
from .serializers import *
from .permissions import *

# Create your views here.
