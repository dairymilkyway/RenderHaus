@echo off
echo Starting RenderHaus Development Environment...

echo.
echo [1/4] Installing backend dependencies...
cd backend
call npm install

echo.
echo [2/4] Installing frontend dependencies...
cd ../frontend
call npm install

echo.
echo [3/4] Installing Python dependencies...
cd ../backend/python_backend
pip install flask flask-cors pymongo numpy pillow opencv-python python-dotenv

echo.
echo [4/4] Seeding database with sample models and templates...
cd ..
node seedModels.js
node seedRoomsAndTemplates.js

echo.
echo Setup complete! Now starting all servers...
echo.
echo Please open 3 separate terminals and run:
echo Terminal 1: cd backend ^&^& npm start
echo Terminal 2: cd backend/python_backend ^&^& python app.py  
echo Terminal 3: cd frontend ^&^& npm start
echo.
echo Your app will be available at http://localhost:3000
pause
