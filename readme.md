# Sistema de Gestión de Citas de Entrega

Aplicación web fullstack para gestionar citas de entrega de mercancía en una empresa de retail textil.

## Diagrama de Arquitectura

┌─────────────────────────────────────────────────────┐
│                    Cliente                          │
│              Next.js (puerto 3000)                  │
│  Login │ Dashboard │ Citas │ Reporte                │
└───────────────────┬─────────────────────────────────┘
                    │ HTTP / Axios
                    │ JWT en cookies
┌───────────────────▼─────────────────────────────────┐
│                   Backend                           │
│           Django REST Framework (puerto 8000)       │
│                                                     │
│  ┌──────────┐  ┌────────────┐  ┌────────────────┐  │
│  │  Views   │  │ Serializers│  │    Services    │  │
│  │ (routes) │  │ (validate) │  │ (business      │  │
│  └──────────┘  └────────────┘  │  logic)        │  │
│                                └────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │              Models (ORM)                    │  │
│  └──────────────────────────────────────────────┘  │
└───────────────────┬─────────────────────────────────┘
                    │ psycopg2
┌───────────────────▼─────────────────────────────────┐
│                 PostgreSQL                          │
│              Base de datos (puerto 5432)            │
└─────────────────────────────────────────────────────┘

## Diagrama Entidad-Relación

┌─────────────────────────────────┐      ┌──────────────────┐
│         auth_user               │      │   Appointment    │
├─────────────────────────────────┤      ├──────────────────┤
│ id          (AutoField)    PK   │◄─────│ created_by  FK   │
│ username    (CharField)         │      │                  │
│ password    (CharField)         │      │ id          UUID │
│ email       (EmailField)        │      │ scheduled_at     │
└─────────────────────────────────┘      │ supplier         │
                                         │ product_line     │
                                         │ status           │
                                         │ delivered_at     │
                                         │ observations     │
                                         │ created_at       │
                                         │ updated_at       │
                                         └──────────────────┘

## Instrucciones de ejecución con Docker

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd sistema-de-citas

# 2. Crear archivo de entorno
cp .env.example .env

# 3. Levantar todo el proyecto
docker compose up --build
```

La aplicación estará disponible en:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/
- Documentación API: http://localhost:8000/api/docs/

### Sin Docker (desarrollo local)

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate 
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `SECRET_KEY` | Clave secreta de Django | `una-clave-larga` |
| `DEBUG` | Modo debug | `True` |
| `DB_NAME` | Nombre de la base de datos | `citas_db` |
| `DB_USER` | Usuario de PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | `postgres` |
| `DB_HOST` | Host de la base de datos | `localhost` o `db` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |

## Credenciales de prueba

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `admin123` | Administrador |
| `operador1` | `operador123` | Operador |
| `operador2` | `operador123` | Operador |

## Documentación de la API

Swagger disponible en: http://localhost:8000/api/docs/

| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/login/` | Iniciar sesión |
| POST | `/api/auth/refresh/` | Renovar token |
| POST | `/api/auth/logout/` | Cerrar sesión |
| GET | `/api/appointments/` | Listar citas |
| POST | `/api/appointments/` | Crear cita |
| GET | `/api/appointments/{id}/` | Ver cita |
| PATCH | `/api/appointments/{id}/` | Editar cita |
| DELETE | `/api/appointments/{id}/` | No permitido (405) |
| GET | `/api/reports/delivery/` | Reporte de entregas |

## Correr los tests
```bash
cd backend
venv\Scripts\activate
python manage.py test appointments
```

Tests incluidos:
- Cita no puede crearse con fecha en el pasado
- Estado Entregada requiere delivered_at
- Transición Entregada → Programada no permitida
- Usuario no autenticado recibe 401

## Datos de prueba

```bash
# Con Docker
docker compose exec backend python manage.py loaddata appointments/fixtures/initial_data.json

# Sin Docker
python manage.py loaddata appointments/fixtures/initial_data.json
```

El fixture incluye:
- 3 usuarios (admin, operador1, operador2)
- 21 citas en distintos estados y proveedores

## Estructura del proyecto
```
sistema-de-citas/
├── backend/
│   ├── appointments/
│   │   ├── fixtures/
│   │   │   └── initial_data.json  ← datos de prueba
│   │   ├── migrations/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py              ← entidades
│   │   ├── serializers.py         ← validación y serialización
│   │   ├── services.py            ← lógica de negocio
│   │   ├── tests.py               ← pruebas unitarias
│   │   ├── urls.py                ← rutas
│   │   └── views.py               ← endpoints
│   ├── config/
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── Dockerfile
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   │   ├── appointments/
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── page.tsx   ← editar cita
│   │   │   │   │   ├── new/
│   │   │   │   │   │   └── page.tsx   ← crear cita
│   │   │   │   │   └── page.tsx       ← lista de citas
│   │   │   │   ├── reports/
│   │   │   │   │   └── page.tsx       ← reporte
│   │   │   │   ├── layout.tsx         ← navbar compartido
│   │   │   │   └── page.tsx           ← dashboard
│   │   │   ├── login/
│   │   │   │   └── page.tsx           ← login
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── lib/
│   │   │   ├── axios.ts               ← cliente HTTP
│   │   │   └── types.ts               ← tipos TypeScript
│   │   └── proxy.ts                   ← protección de rutas
│   ├── Dockerfile
│   ├── next.config.ts
│   ├── package.json
│   └── tsconfig.json
├── .env.example
├── .gitignore
├── docker-compose.yml
└── readme.md
```

##  Decisiones técnicas

**JWT sobre Session Auth:** Elegí JWT porque el frontend y backend están desacoplados en contenedores distintos. JWT es stateless y no requiere sesiones compartidas.

**Next.js App Router:** La estructura de carpetas refleja directamente las rutas de la aplicación, haciendo el código autodocumentado.

**SQL nativo para reportes:** El reporte de entregas usa `django.db.connection.cursor()` para ejecutar SQL crudo, permitiendo usar funciones específicas de PostgreSQL como `EXTRACT(EPOCH FROM ...)`.

**Separación en capas:** La lógica de negocio vive en `services.py`, separada de las vistas y serializers, facilitando los tests y el mantenimiento.

**CI/CD con GitHub Actions:** Se implementó un pipeline que ejecuta Flake8 en el backend y ESLint en el frontend automáticamente en cada push a las ramas main y dev.

https://github.com/Luisahvargas/sistemas-de-citas/actions

**Estrategia de manejo de errores:**

Backend:
- Errores de validación → HTTP 400 con detalle del campo fallido
- No autenticado → HTTP 401 automático via JWT middleware
- Eliminación física → HTTP 405 Method Not Allowed
- Errores de transición de estado → HTTP 400 desde services.py
- Todos los errores retornan JSON con campo `detail` o nombre del campo

Frontend:
- Axios interceptor detecta 401 y redirige al login automáticamente
- Cada página tiene estado de `error` visible al usuario
- Formularios muestran errores por campo desde el servidor
- Estado de `loading` en cada operación asíncrona

**Estructura de carpetas:**
Se organizó por dominio (appointments, config) en el backend
y por rutas en el frontend (App Router de Next.js).
Esta decisión facilita escalar el proyecto agregando nuevos dominios
sin afectar los existentes. Cada carpeta es autónoma y contiene
todo lo relacionado a su dominio.

##  Supuestos asumidos

- Un usuario puede crear citas para cualquier proveedor
- Las citas no se eliminan físicamente, solo se cancelan
- El reporte solo considera citas con estado Entregada
- Se usa `USE_TZ = True` en Django para manejar fechas como 
  aware datetimes en UTC internamente, 
  con zona horaria America/Bogota para presentación.
