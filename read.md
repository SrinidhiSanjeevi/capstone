# HomeEase Docker Commands

## Check Existing Docker Images

docker images

---

## Check Running Containers

docker ps

---

## Check All Containers

docker ps -a

---

# Backend Container

## Build Backend Image

docker build -t homeease-backend:v1 ./backend

---

## Verify Image

docker images

---

## Run Backend Container

docker run -d --name backend-prod1 -p 5000:5000 homeease-backend:v1

---

## Check Running Container

docker ps

---

## View Backend Logs

docker logs backend-prod1

---

## Stop Backend Container

docker stop backend-prod1

---

## Remove Backend Container

docker rm backend-prod1

---

# Frontend Container

## Build Frontend Image

docker build -t homeease-frontend:v1 ./frontend

---

## Verify Image

docker images

---

## Run Frontend Container

docker run -d --name frontend-prod2 -p 3000:80 homeease-frontend:v1

---

## Check Running Container

docker ps

---

## View Frontend Logs

docker logs frontend-prod2

---

## Stop Frontend Container

docker stop frontend-prod2

---

## Remove Frontend Container

docker rm frontend-prod2

---

# Docker Compose

## Build All Services

docker compose build

---

## Build and Run Services Together

docker compose up --build

---

## Start Existing Services

docker compose up -d

---

## View Compose Services

docker compose ps

---

## View All Compose Logs

docker compose logs

---

## View Backend Logs

docker compose logs backend

---

## View Frontend Logs

docker compose logs frontend

---

## Stop and Remove All Compose Services

docker compose down

---

# Docker Networking

## List Networks

docker network ls

---

## Inspect HomeEase Network

docker network inspect homeease-net

---

# Docker Hub

## Login

docker login

---

## Tag Backend Image

docker tag homeease-backend:v1 srinidhisanjeevi/homeease-backend:v1

---

## Push Backend Image

docker push srinidhisanjeevi/homeease-backend:v1

---

## Pull Backend Image

docker pull srinidhisanjeevi/homeease-backend:v1

---

## Tag Frontend Image

docker tag homeease-frontend:v1 srinidhisanjeevi/homeease-frontend:v1

---

## Push Frontend Image

docker push srinidhisanjeevi/homeease-frontend:v1

---

## Pull Frontend Image

docker pull srinidhisanjeevi/homeease-frontend:v1

---

# Docker Cleanup

## Show Docker Disk Usage

docker system df

---

## Remove Unused Docker Resources

docker system prune

---

## Remove All Unused Docker Resources Including Images

docker system prune -a

---

# Application URLs

Frontend

http://localhost:3000

Backend

http://localhost:5000

Backend Health Check

http://localhost:5000/api/health