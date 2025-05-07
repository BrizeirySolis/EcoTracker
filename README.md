# EcoTracker

EcoTracker es una aplicación web moderna diseñada para ayudar a los usuarios a monitorear y reducir su impacto ambiental a través del seguimiento de consumo de agua, electricidad y patrones de transporte.

![EcoTracker Logo](logo-placeholder.png)

## Descripción

EcoTracker es una plataforma integral que permite a los usuarios:

- Registrar y analizar su consumo de agua y electricidad
- Hacer seguimiento de sus patrones de transporte y emisiones de CO2
- Visualizar tendencias de consumo mediante dashboards intuitivos
- Recibir recomendaciones personalizadas para reducir su huella ecológica

La aplicación está diseñada utilizando una arquitectura de microservicios moderna con un backend Java Spring Boot y un frontend Angular.

## Tecnologías

### Backend
- **Java 17**
- **Spring Boot 3.4.4**
- **Spring Security** con autenticación JWT
- **Spring Data JPA** para persistencia de datos
- **H2 Database** para desarrollo
- **MySQL** para entorno de producción
- **Maven** para gestión de dependencias y build

### Frontend
- **Angular** (versión actual) con componentes standalone
- **Tailwind CSS** para estilos
- **Angular Router** para navegación SPA
- **Gráficos SVG** nativos para visualizaciones de datos

## Estructura del Proyecto

```
ecotracker/
├── backend/                     # Aplicación Spring Boot
│   ├── src/main/java            # Código fuente Java
│   │   ├── common/              # Clases comunes y utilidades
│   │   ├── config/              # Configuración de la aplicación
│   │   ├── features/            # Módulos de funcionalidades
│   │   │   ├── electricity/     # Gestión de consumo eléctrico
│   │   │   ├── summary/         # Análisis y resúmenes de datos
│   │   │   ├── transport/       # Gestión de uso de transporte
│   │   │   └── water/           # Gestión de consumo de agua
│   │   └── security/            # Configuración de seguridad y autenticación
│   └── resources/               # Recursos y configuración
│
└── front/                       # Aplicación Angular
    ├── src/                     # Código fuente TypeScript
    │   ├── app/                 # Componentes y servicios
    │   │   ├── components/      # Componentes de UI
    │   │   ├── models/          # Interfaces y tipos de datos
    │   │   └── services/        # Servicios para lógica de negocio
    │   ├── assets/              # Recursos estáticos
    │   └── styles.css           # Estilos globales
```

## Características Principales

### Monitoreo de Consumo de Agua
- Registro de consumo bimestral de agua
- Análisis de tendencias de consumo
- Comparación con promedios regionales y nacionales
- Detección de anomalías en el consumo

### Monitoreo de Consumo Eléctrico
- Registro de consumo eléctrico
- Análisis de costos y eficiencia energética
- Detección de patrones de consumo
- Recomendaciones para ahorro energético

### Seguimiento de Transporte
- Registro de kilómetros recorridos por tipo de transporte
- Cálculo de emisiones de CO2
- Análisis de uso de transporte sostenible
- Sugerencias para reducir la huella de carbono

### Panel de Control Unificado
- Visualización de KPIs para cada tipo de consumo
- Gráficos de tendencias y comparativas
- Indicadores de rendimiento ambiental
- Vista consolidada del impacto ecológico del usuario

## Autenticación y Seguridad
- Sistema de registro e inicio de sesión de usuarios
- Autenticación basada en JWT
- Protección de rutas por roles de usuario
- Seguridad en el API REST

## Instalación y Configuración

### Requisitos Previos
- Java JDK 17+
- Node.js y npm
- MySQL (opcional, para producción)
- Maven

### Instalación del Backend

1. Navega al directorio `backend`:
   ```bash
   cd backend
   ```

2. Compila y empaqueta la aplicación:
   ```bash
   ./mvnw clean package
   ```

3. Ejecuta la aplicación:
   ```bash
   java -jar target/EcoTracker-0.0.1-SNAPSHOT.jar
   ```

La API estará disponible en `http://localhost:8080`.

### Instalación del Frontend

1. Navega al directorio `front`:
   ```bash
   cd front
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Ejecuta la aplicación en modo desarrollo:
   ```bash
   ng serve
   ```

La aplicación estará disponible en `http://localhost:4200`.

### Construcción Unificada

Para construir tanto el backend como el frontend y servir la aplicación Angular desde Spring Boot:

```bash
cd backend
./mvnw clean package
java -jar target/EcoTracker-0.0.1-SNAPSHOT.jar
```

Esto compilará el frontend, lo copiará a los recursos estáticos de Spring Boot y servirá la aplicación completa desde `http://localhost:8080`.

## Uso

1. Registra una nueva cuenta o inicia sesión con las credenciales predeterminadas:
   - Usuario: admin
   - Contraseña: pass

2. Navega al panel de hábitos para comenzar a registrar tu consumo de agua, electricidad o uso de transporte.

3. Explora los diversos dashboards para visualizar tu impacto ambiental y seguir tus tendencias de consumo.

4. Consulta las recomendaciones personalizadas para reducir tu huella ecológica.

## Datos de Prueba

La aplicación incluye un generador de datos de prueba que crea registros realistas para demostración y desarrollo. Estos datos se generan automáticamente para el usuario admin cuando se ejecuta por primera vez, o pueden activarse mediante la propiedad `ecotracker.generateTestData=true`.


