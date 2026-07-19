#!/bin/bash

# Kiểm tra xem người dùng đã cung cấp Docker Hub username chưa
if [ -z "$1" ]; then
  echo "❌ Lỗi: Bạn chưa cung cấp Docker Hub username."
  echo "👉 Cách dùng: ./publish.sh <your_dockerhub_username>"
  exit 1
fi

USERNAME=$1

echo "======================================"
echo "🐳 Đăng nhập vào Docker Hub..."
echo "======================================"
docker login -u "$USERNAME"

# Kiểm tra đăng nhập thành công không
if [ $? -ne 0 ]; then
  echo "❌ Đăng nhập thất bại. Dừng quá trình."
  exit 1
fi

echo "======================================"
echo "🛠️ Bắt đầu Build các images..."
echo "======================================"
# Build backend
echo "-> Building Backend..."
docker build -t "$USERNAME/ecosurvey-backend:latest" ./backend

# Build frontend
echo "-> Building Frontend..."
docker build --build-arg VITE_API_URL=/api -t "$USERNAME/ecosurvey-frontend:latest" ./frontend

# Build database (kèm theo file init.sql)
echo "-> Building Database..."
docker build -t "$USERNAME/ecosurvey-db:latest" ./database

echo "======================================"
echo "🚀 Đang đẩy (push) images lên Docker Hub..."
echo "======================================"
docker push "$USERNAME/ecosurvey-backend:latest"
docker push "$USERNAME/ecosurvey-frontend:latest"
docker push "$USERNAME/ecosurvey-db:latest"

echo "======================================"
echo "✅ HOÀN TẤT ĐẨY IMAGES!"
echo "Đang tạo file 'docker-compose.prod.yml'..."
echo "======================================"

cat <<EOF > docker-compose.prod.yml
version: '3.9'
name: ecosurvey-prod

services:
  # ── MySQL Database ──────────────────────────────────────────────
  db:
    image: $USERNAME/ecosurvey-db:latest
    container_name: ecosurvey-db-prod
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: \${MYSQL_ROOT_PASSWORD:-rootpassword}
      MYSQL_DATABASE: \${DB_NAME:-ecosurvey}
      MYSQL_USER: \${DB_USER:-ecosurvey}
      MYSQL_PASSWORD: \${DB_PASSWORD:-ecosurveypass}
    ports:
      - "3307:3306"
    volumes:
      - db_data_prod:/var/lib/mysql
    healthcheck:
      test: [ "CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p\$\${MYSQL_ROOT_PASSWORD:-rootpassword}" ]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 30s
    networks:
      - ecosurvey-net-prod

  # ── Backend API ─────────────────────────────────────────────────
  backend:
    image: $USERNAME/ecosurvey-backend:latest
    container_name: ecosurvey-backend-prod
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      NODE_ENV: production
      PORT: 5000
      DB_HOST: db
      DB_PORT: 3306
      DB_NAME: \${DB_NAME:-ecosurvey}
      DB_USER: \${DB_USER:-ecosurvey}
      DB_PASSWORD: \${DB_PASSWORD:-ecosurveypass}
      JWT_SECRET: \${JWT_SECRET:-change_me_in_production_very_long_secret}
      JWT_REFRESH_SECRET: \${JWT_REFRESH_SECRET:-another_refresh_secret_change_me}
      JWT_EXPIRES_IN: 15m
      JWT_REFRESH_EXPIRES_IN: 7d
      CLIENT_URL: \${CLIENT_URL:-http://localhost}
    ports:
      - "5000:5000"
    networks:
      - ecosurvey-net-prod

  # ── Frontend ────────────────────────────────────────────────────
  frontend:
    image: $USERNAME/ecosurvey-frontend:latest
    container_name: ecosurvey-frontend-prod
    restart: unless-stopped
    depends_on:
      - backend
    ports:
      - "80:80"
    networks:
      - ecosurvey-net-prod

volumes:
  db_data_prod:
    name: ecosurvey_prod_db_data

networks:
  ecosurvey-net-prod:
    driver: bridge
    name: ecosurvey-prod-network
EOF

echo "🎉 Tạo thành công docker-compose.prod.yml!"
echo ""
echo "📌 HƯỚNG DẪN KHI MỞ TRÊN MÁY KHÁC:"
echo "1. Cài đặt Docker và Docker Compose trên máy mới."
echo "2. Copy file 'docker-compose.prod.yml' sang máy đó."
echo "3. Copy file '.env' (nếu cần thiết lập mật khẩu, khóa bí mật, ...)."
echo "4. Chạy lệnh: docker-compose -f docker-compose.prod.yml up -d"
