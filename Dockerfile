# Multistage build
# Stage 1: Build frontend
FROM node:20-alpine as frontend-builder
WORKDIR /app/frontend
COPY front/package*.json ./
RUN npm install
COPY front/ ./
RUN npm run build --prod

# Stage 2: Build backend
FROM maven:3.9-amazoncorretto-17 as backend-builder
WORKDIR /app
COPY backend/pom.xml ./
COPY backend/src ./src
# Copy frontend build to appropriate location
COPY --from=frontend-builder /app/frontend/dist/ecotracker/browser /app/src/main/resources/static
RUN mvn clean package -DskipTests

# Stage 3: Final image
FROM amazoncorretto:17-alpine
WORKDIR /app
COPY --from=backend-builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
