from rest_framework import viewsets, permissions, generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Client, Project, Tag, TimeEntry, Settings
from .serializers import (
    ClientSerializer, ProjectSerializer, TagSerializer, TimeEntrySerializer,
    UserSerializer, RegisterSerializer, SettingsSerializer
)
from django.contrib.auth.models import User
from django.db.models import Sum, Count
from datetime import datetime

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class ClientViewSet(viewsets.ModelViewSet):
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Client.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Project.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TagViewSet(viewsets.ModelViewSet):
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return Tag.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TimeEntryViewSet(viewsets.ModelViewSet):
    serializer_class = TimeEntrySerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return TimeEntry.objects.filter(user=self.request.user)
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SettingsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
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

class ReportsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
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
        daily_stats = entries.extra({'date': "date(start_time)"}).values('date').annotate(total=Sum('duration'))
        return Response({
            'total_duration': total_duration,
            'total_entries': total_entries,
            'project_stats': list(project_stats),
            'client_stats': list(client_stats),
            'daily_stats': list(daily_stats),
        })

class CalendarView(APIView):
    permission_classes = [permissions.IsAuthenticated]
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