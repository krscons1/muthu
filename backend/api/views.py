from rest_framework import viewsets, permissions, generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Client, Project, Tag, TimeEntry, Settings
from .serializers import (
    ClientSerializer, ProjectSerializer, TagSerializer, TimeEntrySerializer,
    UserSerializer, RegisterSerializer, SettingsSerializer
)
from django.contrib.auth.models import User
from django.db.models import Sum, Count
from datetime import datetime
from rest_framework_simplejwt.tokens import RefreshToken
import firebase_admin
from firebase_admin import auth as firebase_auth
from django.db.models.functions import TruncDate
from django.contrib.auth import get_user_model
from rest_framework.reverse import reverse
from . import authentication

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class ClientViewSet(viewsets.ModelViewSet):
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Client.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Project.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TagViewSet(viewsets.ModelViewSet):
    serializer_class = TagSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Tag.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TimeEntryViewSet(viewsets.ModelViewSet):
    serializer_class = TimeEntrySerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return TimeEntry.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SettingsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        settings, created = Settings.objects.get_or_create(user=request.user)
        serializer = SettingsSerializer(settings)
        return Response(serializer.data)
    def put(self, request):
        settings, created = Settings.objects.get_or_create(user=request.user)
        serializer = SettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def post(self, request):
        # For compatibility, treat POST as update or create
        settings, created = Settings.objects.get_or_create(user=request.user)
        serializer = SettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ReportsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        # Filters: date range, project, client, tag
        entries = TimeEntry.objects.filter(user=request.user)
        start = request.GET.get('start')
        end = request.GET.get('end')
        project = request.GET.get('project')
        client = request.GET.get('client')
        tag = request.GET.get('tag')
        if start:
            entries = entries.filter(start_time__gte=start)
        if end:
            entries = entries.filter(end_time__lte=end)
        if project:
            entries = entries.filter(project_id=project)
        if client:
            entries = entries.filter(client_id=client)
        if tag:
            entries = entries.filter(tags__id=tag)
        total_duration = entries.aggregate(Sum('duration'))['duration__sum'] or 0
        total_entries = entries.count()
        project_stats = entries.values('project__name').annotate(total=Sum('duration'))
        client_stats = entries.values('client__name').annotate(total=Sum('duration'))
        daily_stats = entries.annotate(date=TruncDate('start_time')).values('date').annotate(total=Sum('duration')).order_by('date')
        return Response({
            'total_duration': total_duration,
            'total_entries': total_entries,
            'project_stats': list(project_stats),
            'client_stats': list(client_stats),
            'daily_stats': list(daily_stats),
        })
    def post(self, request):
        # Allow POST for report queries (same as GET, but with body)
        data = request.data
        entries = TimeEntry.objects.filter(user=request.user)
        start = data.get('start')
        end = data.get('end')
        project = data.get('project')
        client = data.get('client')
        tag = data.get('tag')
        if start:
            entries = entries.filter(start_time__gte=start)
        if end:
            entries = entries.filter(end_time__lte=end)
        if project:
            entries = entries.filter(project_id=project)
        if client:
            entries = entries.filter(client_id=client)
        if tag:
            entries = entries.filter(tags__id=tag)
        total_duration = entries.aggregate(Sum('duration'))['duration__sum'] or 0
        total_entries = entries.count()
        project_stats = entries.values('project__name').annotate(total=Sum('duration'))
        client_stats = entries.values('client__name').annotate(total=Sum('duration'))
        daily_stats = entries.annotate(date=TruncDate('start_time')).values('date').annotate(total=Sum('duration')).order_by('date')
        return Response({
            'total_duration': total_duration,
            'total_entries': total_entries,
            'project_stats': list(project_stats),
            'client_stats': list(client_stats),
            'daily_stats': list(daily_stats),
        })

class CalendarView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        # Expects ?month=YYYY-MM
        month = request.GET.get('month')
        if not month:
            return Response({'error': 'month param required'}, status=400)
        year, month_num = map(int, month.split('-'))
        entries = TimeEntry.objects.filter(
            user=request.user,
            start_time__year=year,
            start_time__month=month_num
        )
        projects = Project.objects.filter(
            user=request.user,
            due_date__year=year,
            due_date__month=month_num
        )
        return Response({
            'entries': TimeEntrySerializer(entries, many=True).data,
            'projects': ProjectSerializer(projects, many=True).data,
        })
    def post(self, request):
        # Allow POST for calendar queries (same as GET, but with body)
        month = request.data.get('month')
        if not month:
            return Response({'error': 'month param required'}, status=400)
        year, month_num = map(int, month.split('-'))
        entries = TimeEntry.objects.filter(
            user=request.user,
            start_time__year=year,
            start_time__month=month_num
        )
        projects = Project.objects.filter(
            user=request.user,
            due_date__year=year,
            due_date__month=month_num
        )
        return Response({
            'entries': TimeEntrySerializer(entries, many=True).data,
            'projects': ProjectSerializer(projects, many=True).data,
        })

class FirebaseLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        id_token = request.data.get('id_token')
        print("[FirebaseLoginView] Received id_token:", id_token)
        if not id_token:
            print("[FirebaseLoginView] No ID token provided in request.data:", request.data)
            return Response({'detail': 'No ID token provided.', 'debug': str(request.data)}, status=400)
        try:
            from firebase_admin import auth as firebase_auth
            decoded_token = firebase_auth.verify_id_token(id_token)
            print("[FirebaseLoginView] Decoded token:", decoded_token)
            uid = decoded_token['uid']
            email = decoded_token.get('email', '')
            User = get_user_model()
            user, created = User.objects.get_or_create(username=uid, defaults={'email': email})
            if email and user.email != email:
                user.email = email
                user.save()
            refresh = RefreshToken.for_user(user)
            print("[FirebaseLoginView] Login success for user:", user.username)
            return Response({
                'token': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'username': user.username,
                    'email': user.email,
                },
                'created': created,
            })
        except Exception as e:
            print("[FirebaseLoginView] Token verification failed:", str(e))
            return Response({'detail': f'Token verification failed: {str(e)}'}, status=400)
    def get(self, request):
        return Response({'detail': 'GET not supported for login.'}, status=405)

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class OpenApiRootView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, format=None):
        return Response({
            'clients': reverse('client-list', request=request, format=format),
            'projects': reverse('project-list', request=request, format=format),
            'tags': reverse('tag-list', request=request, format=format),
            'time-entries': reverse('timeentry-list', request=request, format=format),
            'settings': reverse('settings', request=request, format=format),
            'reports': reverse('reports', request=request, format=format),
            'calendar': reverse('calendar', request=request, format=format),
            'user': reverse('current_user', request=request, format=format),
        })