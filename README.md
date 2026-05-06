# 🎯 Finanzas Pro

Una aplicación moderna, limpia y funcional para la gestión de finanzas personales. Construida con un stack gratuito de punta a punta.

## 🛠️ Stack Tecnológico

- **Frontend**: React + Vite + TailwindCSS
- **Backend/Auth/DB**: Supabase (PostgreSQL + Auth + Storage)
- **Hosting**: Vercel
- **Animaciones**: Framer Motion
- **Gráficos**: Recharts

## 🚀 Guía de Instalación Rápida (Menos de 10 min)

### 1. Clonar y Preparar Localmente
```bash
npm install
```

### 2. Configurar Supabase
1. Crea un proyecto gratuito en [supabase.com](https://supabase.com).
2. Ve al **SQL Editor** y pega el contenido del archivo `supabase/schema.sql` para crear las tablas y políticas.
3. Ve a **Storage**, crea un bucket llamado `receipts` y asegúrate de que sea público o tenga las políticas correctas para subida.
4. Obtén tu `URL` y `Anon Key` desde Settings > API.

### 3. Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto y pega tus credenciales:
```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

### 4. Ejecutar
```bash
npm run dev
```

## 🔐 Seguridad y Privacidad (RLS)
El proyecto utiliza **Row Level Security (RLS)**. Esto significa que cada usuario autenticado solo puede ver, crear y modificar sus propios datos. Nadie más tiene acceso a tu información financiera.

## 📱 PWA (Progressive Web App)
La aplicación está configurada para ser instalable en dispositivos móviles y de escritorio. Una vez desplegada, simplemente usa la opción "Instalar aplicación" o "Añadir a pantalla de inicio" en tu navegador.

## 📄 Licencia
Este proyecto es gratuito y de código abierto.
