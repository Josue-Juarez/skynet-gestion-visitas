**Skynet Gestión de Visitas**

Este documento describe la instalación, configuración y ejecución del proyecto **Skynet Gestión de Visitas**, una aplicación web para la gestión de visitas técnicas, seguimiento de actividades, generación de reportes y administración de usuarios.



*Descripción del Proyecto**

Skynet Gestión de Visitas es una plataforma desarrollada en **React (Vite + Tailwind)** para el frontend y **Node.js + Express** para el backend. El proyecto utiliza **Supabase** como base de datos y autenticación, además de **Google Analytics** para la medición de eventos.

La aplicación permite:

* Crear, asignar e iniciar visitas técnicas.
* Registrar detalles, enviar reportes y generar archivos PDF.
* Administrar usuarios (rol de supervisor y técnico).
* Visualizar estados de visitas.
* Medir eventos clave con Google Analytics.



 **Arquitectura del Sistema**

El sistema está dividido en:

### **Frontend:**

* React + Vite
* TailwindCSS
* React
* React-GA4 (Analytics)
* Desplegado en **Vercel**

**Backend:**

* Node.js + Express
* Supabase (base de datos y funciones)
* Desplegado en **Railway**

---

```

---

## ⚙️ **Requisitos Previos**

Antes de instalar y ejecutar el proyecto, asegúrate de tener:

* Node.js 18+
* NPM o Yarn
* Cuenta en Supabase
* Cuenta en Google Analytics
* (Opcional) Docker Desktop

---

## 🔧 **Instalación del Proyecto**

### **1. Clonar el repositorio**

```bash
git clone https://github.com/tu_usuario/skynet-gestion-visitas.git
cd skynet-gestion-visitas
```

---

### **2. Configurar Frontend**

```bash
cd frontend
npm install
```

#### Crear archivo `.env`

```
VITE_SUPABASE_URL=tu_url
VITE_SUPABASE_ANON_KEY=tu_key
VITE_GOOGLE_MAPS_KEY=tu_key
VITE_GA_ID=G-XXXXXXXXXX
```

#### Ejecutar frontend

```bash
npm run dev
```

---

### **3. Configurar Backend**

```bash
cd backend
npm install
```

#### Crear archivo `.env`

```
PORT=3001
SUPABASE_URL=tu_url
SUPABASE_SERVICE_KEY=tu_service_key
```

#### Ejecutar backend

```bash
node server.js
```

---

##  **Google Analytics (GA4)**

La aplicación usa **react-ga4**.

### Archivo `analytics.js`

```javascript
import ReactGA from "react-ga4";

export const initAnalytics = () => {
  ReactGA.initialize("G-XXXXXXXXXX");
};

export const trackEvent = (eventName, eventParams = {}) => {
  ReactGA.event(eventName, eventParams);
};
```

### Ejemplo de uso en componentes

```javascript
trackEvent("crear_visita", { cliente: nombreCliente });
```

---

##  **Docker (Opcional)**

### Backend

Crear archivo `Dockerfile` en `/backend`:

```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "server.js"]
```

Construir imagen:

```bash
docker build -t skynet-backend .
```

Ejecutar contenedor:

```bash
docker run -p 3001:3001 skynet-backend
```

---

## ☁️ **Despliegue**

### **Frontend en Vercel**

1. Conectar repositorio
2. Vercel detecta Vite automáticamente
3. Agregar variables de entorno
4. Deploy

### **Backend en Railway**

1. Crear proyecto
2. Subir código directamente desde GitHub
3. Configurar variables de entorno
4. Railway asigna URL pública

---

##  **Cómo Ejecutarlo Completo**

### **1. Iniciar backend**

```bash
cd backend
node server.js
```

### **2. Iniciar frontend**

```bash
cd frontend
npm run dev
```

Acceder a:

```
http://localhost:5173
```

---

##  **Notas Importantes**

* Google Analytics puede tardar hasta **24–48 horas** en reflejar datos en informes que no sean Tiempo Real.
* Vercel requiere que TODAS las variables empiecen con `VITE_`.
* Railway reinicia automáticamente si detecta cambios.

---

##  **Autores**

Proyecto desarrollado por **Josué Juarez** .

---



---
