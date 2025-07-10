import os
import firebase_admin
from firebase_admin import auth, credentials
from django.contrib.auth.models import User
from rest_framework import authentication, exceptions

# Use absolute path for the service account key
service_account_path = os.path.join(os.path.dirname(__file__), '../firebase-adminsdk.json')
if not firebase_admin._apps:
    cred = credentials.Certificate(service_account_path)
    firebase_admin.initialize_app(cred)

class FirebaseAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        print("Authorization header:", auth_header)  # DEBUG
        if not auth_header:
            print("No auth header")  # DEBUG
            return None
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            print("Malformed auth header")  # DEBUG
            return None
        id_token = parts[1]
        try:
            decoded_token = auth.verify_id_token(id_token)
            print("Decoded token:", decoded_token)  # DEBUG
        except Exception as e:
            print("Token verification failed:", e)  # DEBUG
            raise exceptions.AuthenticationFailed('Invalid Firebase ID token')
        uid = decoded_token['uid']
        email = decoded_token.get('email', '')
        user, created = User.objects.get_or_create(username=uid, defaults={'email': email})
        print("User:", user, "Created:", created)  # DEBUG
        if email and user.email != email:
            user.email = email
            user.save()
        if not user.is_active:
            user.is_active = True
            user.save()
        return (user, None) 