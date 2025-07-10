# M-Track App Setup Guide

## Issues Found and Fixed:

1. ✅ **Fixed**: Removed automatic logout on login page
2. ✅ **Fixed**: Created requirements.txt for backend dependencies
3. ✅ **Fixed**: Corrected Django settings module paths
4. ✅ **Fixed**: Completed Firebase authentication flow

## Setup Instructions:

### Backend Setup:
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run database migrations:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

4. Start the Django server:
   ```bash
   python manage.py runserver
   ```

### Frontend Setup:
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

## Environment Variables:
Create a `.env.local` file in the frontend directory with:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

## Testing the App:
1. Open http://localhost:3000 in your browser
2. You should see the login page
3. Create a Firebase account or use Google sign-in
4. The app should redirect to the dashboard after successful authentication

## Common Issues:
- If you get CORS errors, make sure both servers are running
- If authentication fails, check that Firebase is properly configured
- If database errors occur, run the migrations again 