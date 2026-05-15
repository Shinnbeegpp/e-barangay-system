#!/bin/bash
echo "======================================"
echo " E-Barangay Management System"
echo " Barangay Tinurik, Tanauan City"
echo "======================================"

# Start backend
echo "[1/2] Starting backend server..."
cd server && npm start &
sleep 2

# Start frontend
echo "[2/2] Starting frontend..."
cd ../client && npm run dev &

echo ""
echo "App running at: http://localhost:5173"
echo "Press Ctrl+C to stop all servers"
wait
