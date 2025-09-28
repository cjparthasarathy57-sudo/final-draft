
Combined Floor Plan Generator (Frontend + Backend)

Contents:
- backend/  : FastAPI + OpenCV server (process images -> detect rooms -> export DXF)
- frontend/ : Static single-page UI (index.html) that calls backend
- docker-compose.yml : Build both with Docker (recommended for local runs)

Run locally (no Docker):
1) Backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r backend/requirements.txt
   cd backend
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload

2) Frontend
   Open frontend/index.html in a browser (or serve via a simple static server).

Run with Docker (one command):
- Install Docker & Docker Compose, then from project root run:
  docker-compose up --build
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

Deploying:
- Backend: Render.com / Railway.app (Python service) or any server/VPS. Set start command:
    uvicorn main:app --host 0.0.0.0 --port $PORT
- Frontend: Host static site on Vercel / Netlify or serve from nginx.
- Or deploy both via Docker on a VPS (DigitalOcean, AWS EC2, etc.).

Important notes:
- To compute real-world dimensions, always provide plot width & height in meters (or a scale bar).
- This project uses heuristic OpenCV methods. For higher accuracy, train a segmentation model (U-Net) on labeled masks.
