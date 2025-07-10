from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ClientViewSet, ProjectViewSet, TagViewSet, TimeEntryViewSet,
    RegisterView, SettingsView, ReportsView, CalendarView, FirebaseLoginView,
    CurrentUserView
)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'clients', ClientViewSet, basename='client')
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'tags', TagViewSet, basename='tag')
router.register(r'time-entries', TimeEntryViewSet, basename='timeentry')

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('settings/', SettingsView.as_view(), name='settings'),
    path('reports/', ReportsView.as_view(), name='reports'),
    path('calendar/', CalendarView.as_view(), name='calendar'),
    path('auth/firebase-login/', FirebaseLoginView.as_view(), name='firebase_login'),
    path('user/', CurrentUserView.as_view(), name='current_user'),
    path('', include(router.urls)),
]