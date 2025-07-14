import os
import firebase_admin
from firebase_admin import auth, credentials
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import authentication, exceptions

# Use absolute path for the service account key
service_account_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../firebase-adminsdk.json'))
try:
    if not firebase_admin._apps:
        cred = credentials.Certificate(service_account_path)
        firebase_admin.initialize_app(cred)
except Exception as e:
    # Always print initialization errors
    print("[Firebase Admin SDK Initialization Error]", e)

DEBUG = getattr(settings, 'DEBUG', False)
User = get_user_model()

class FirebaseAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if DEBUG:
            print("Authorization header:", auth_header)
        if not auth_header:
            if DEBUG:
                print("No auth header")
            return None
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            if DEBUG:
                print("Malformed auth header")
            return None
        id_token = parts[1]
        try:
            decoded_token = auth.verify_id_token(id_token)
            if DEBUG:
                print("Decoded token:", decoded_token)
        except Exception as e:
            print("Token verification failed:", e)
            raise exceptions.AuthenticationFailed('Invalid Firebase ID token')
        uid = decoded_token['uid']
        email = decoded_token.get('email', '')
        user, created = User.objects.get_or_create(username=uid, defaults={'email': email})
        if DEBUG:
            print("User:", user, "Created:", created)
        if email and user.email != email:
            user.email = email
            user.save()
        if not user.is_active:
            user.is_active = True
            user.save()
        return (user, None) 