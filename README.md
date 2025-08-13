# Uptail Guidelines Agent

Sistema de gestión de directrices para agentes de ventas. Proporciona acceso a las mejores prácticas y respuestas basadas en triggers y prioridades.

## Estructura de Datos

### Modelos Principales

```typescript
// Directriz - Regla o guía para agentes de ventas
interface Guideline {
  id: string;
  title: string;           // Título de la directriz
  content: string;         // Contenido de la directriz
  strength: 'hard' | 'soft'; // Fuerza de la directriz (obligatoria/opcional)
  priority: number;        // Prioridad (1-10, mayor = más importante)
  triggers: string[];      // Palabras clave que activan la directriz
  use_once: boolean;       // Si se debe usar solo una vez por sesión
  createdAt: Date;         // Fecha de creación
  updatedAt: Date;         // Fecha de última actualización
}
```

```typescript
// Sesión - Conversación o interacción con un cliente
interface Session {
  id: string;
  createdAt: Date;         // Fecha de inicio de la sesión
}
```

```typescript
// Mensaje - Comunicación individual dentro de una sesión
interface Message {
  id: string;
  sessionId: string;       // ID de la sesión a la que pertenece
  role: 'user' | 'assistant'; // Rol del emisor del mensaje
  content: string;         // Contenido del mensaje
  createdAt: Date;         // Fecha de creación del mensaje
}
```

```typescript
// Uso de Directriz - Registro de cuándo se aplicó una directriz
interface GuidelineUsage {
  id: string;
  sessionId: string;       // ID de la sesión donde se usó
  messageId: string;       // ID del mensaje donde se aplicó
  guidelineId: string;     // ID de la directriz utilizada
  usedAt: Date;            // Fecha y hora de uso
}
```

### Relaciones entre Modelos

- **Session** → **Message** (1:N): Una sesión puede tener múltiples mensajes
- **Session** → **GuidelineUsage** (1:N): Una sesión puede registrar múltiples usos de directrices
- **Message** → **GuidelineUsage** (1:N): Un mensaje puede aplicar múltiples directrices
- **Guideline** → **GuidelineUsage** (1:N): Una directriz puede ser usada múltiples veces

### Enums y Tipos Especiales

```typescript
enum GuidelineStrength {
  hard,  // Directriz obligatoria que debe seguirse
  soft   // Directriz opcional o recomendación
}

interface GuidelineQuery {
  strength?: 'hard' | 'soft';      // Filtro por fuerza
  priority_min?: number;           // Prioridad mínima
  priority_max?: number;           // Prioridad máxima
  triggers?: string[];             // Filtro por palabras clave
  use_once?: boolean;              // Filtro por uso único
  limit?: number;                  // Límite de resultados
}
```

## Instalación

1. **Clonar el repositorio**

   ```bash
   git clone <repository-url>
   cd uptail-guideline-agent
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Configurar base de datos con Docker**

   ```bash
   # Iniciar PostgreSQL con Docker
   npm run db:setup
   ```

   Este comando automáticamente:
   - Inicia el contenedor PostgreSQL
   - Genera el cliente Prisma
   - Ejecuta las migraciones
   - Pobla la base de datos con datos de ejemplo

4. **Configuración manual (opcional)**

   ```bash
   # Crear archivo .env.local
   cp config.example.env .env.local
   
   # Iniciar solo la base de datos
   npm run db:up
   
   # Generar cliente Prisma
   npm run db:generate
   
   # Ejecutar migraciones
   npm run db:migrate
   
   # Poblar con datos de ejemplo
   npm run db:seed
   ```

5. **Ejecutar en desarrollo**

   ```bash
   npm run dev
   ```

## Uso de la API

### Endpoints Disponibles

#### GET `/api/guidelines`

Obtiene todas las directrices.

#### POST `/api/guidelines`

Crea una nueva directriz.

**Body:**

```json
{
  "title": "Nueva Directriz",
  "content": "Contenido de la directriz",
  "strength": "hard",
  "priority": 8,
  "triggers": ["palabra1", "palabra2"],
  "use_once": false
}
```

#### GET `/api/guidelines/[id]`

Obtiene una directriz específica por ID.

#### PUT `/api/guidelines/[id]`

Actualiza una directriz existente.

#### DELETE `/api/guidelines/[id]`

Elimina una directriz.

#### GET `/api/guidelines/search`

Busca directrices con filtros.

**Query Parameters:**

- `strength`: Filtra por fuerza (`hard` o `soft`)
- `priority_min`: Prioridad mínima (1-10)
- `priority_max`: Prioridad máxima (1-10)
- `triggers`: Coma separada de triggers
- `use_once`: Filtra por directrices de uso único
- `limit`: Número máximo de resultados

**Ejemplo:**

```bash
GET /api/guidelines/search?strength=hard&priority_min=8&limit=5
```

### Endpoints de Sesiones

#### GET `/api/sessions`

Obtiene todas las sesiones de conversación.

#### POST `/api/sessions`

Crea una nueva sesión.

#### GET `/api/sessions/[id]`

Obtiene una sesión específica por ID.

#### GET `/api/sessions/[id]/messages`

Obtiene todos los mensajes de una sesión específica.

#### POST `/api/sessions/[id]/messages`

Crea un nuevo mensaje en una sesión específica.

**Body:**

```json
{
  "role": "user",
  "content": "Mensaje del usuario"
}
```

#### GET `/api/sessions/[id]/guideline-usage`

Obtiene el historial de uso de directrices en una sesión específica.

### Endpoints de Mensajes

#### GET `/api/messages/[messageId]/guideline-usage`

Obtiene las directrices aplicadas en un mensaje específico.

### Ejemplos de Uso

```typescript
// Obtener directrices de alta prioridad
const response = await fetch('/api/guidelines/search?priority_min=8');
const guidelines = await response.json();
```

```typescript
// Obtener directrices por triggers
const response = await fetch('/api/guidelines/search?triggers=precio,coste');
const guidelines = await response.json();
```

```typescript
// Crear nueva directriz
const newGuideline = await fetch('/api/guidelines', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: "Nueva Directriz",
    content: "Contenido",
    strength: "hard",
    priority: 9,
    triggers: ["trigger1", "trigger2"]
  })
});
```

```typescript
// Crear nueva sesión
const newSession = await fetch('/api/sessions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});
```

```typescript
// Agregar mensaje a una sesión
const newMessage = await fetch('/api/sessions/sessionId/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    role: 'user',
    content: 'Hola, necesito información sobre precios'
  })
});
```

```typescript
// Obtener historial de directrices usadas en una sesión
const usageHistory = await fetch('/api/sessions/sessionId/guideline-usage');
const usages = await usageHistory.json();
```

## Scripts Disponibles

### Desarrollo

- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Ejecutar en modo producción
- `npm run lint` - Ejecutar linter

### Base de Datos

- `npm run db:setup` - Configuración completa de la base de datos
- `npm run db:up` - Iniciar contenedor PostgreSQL
- `npm run db:down` - Detener contenedor PostgreSQL
- `npm run db:restart` - Reiniciar contenedor PostgreSQL
- `npm run db:logs` - Ver logs de la base de datos
- `npm run db:generate` - Generar cliente Prisma
- `npm run db:migrate` - Ejecutar migraciones
- `npm run db:seed` - Poblar base de datos
- `npm run db:studio` - Abrir Prisma Studio
- `npm run db:reset` - Resetear y repoblar base de datos

## Estructura del Proyecto

```bash
src/
├── app/
│   ├── api/
│   │   ├── guidelines/
│   │   │   ├── route.ts           # GET, POST /api/guidelines
│   │   │   ├── [id]/route.ts      # GET, PUT, DELETE /api/guidelines/[id]
│   │   │   └── search/route.ts    # GET /api/guidelines/search
│   │   ├── sessions/
│   │   │   ├── route.ts           # GET, POST /api/sessions
│   │   │   ├── [id]/route.ts      # GET, PUT, DELETE /api/sessions/[id]
│   │   │   ├── [id]/messages/route.ts # GET, POST /api/sessions/[id]/messages
│   │   │   └── [id]/guideline-usage/route.ts # GET /api/sessions/[id]/guideline-usage
│   │   ├── messages/
│   │   │   └── [messageId]/guideline-usage/route.ts # GET /api/messages/[messageId]/guideline-usage
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
├── components/
│   ├── GuidelinesList.tsx         # Lista de directrices disponibles
│   ├── SessionsList.tsx           # Lista de sesiones de conversación
│   ├── MessagesList.tsx           # Lista de mensajes en una sesión
│   ├── SessionGuidelinesOverview.tsx # Resumen de directrices usadas en sesión
│   └── GuidelineUsageDetails.tsx  # Detalles de uso de directrices
├── services/
│   ├── guidelines.service.ts      # Servicio para gestión de directrices
│   ├── sessions.service.ts        # Servicio para gestión de sesiones
│   ├── messages.service.ts        # Servicio para gestión de mensajes
│   └── guideline-usage.service.ts # Servicio para tracking de uso
├── types/
│   ├── guideline.ts               # Tipos para directrices
│   ├── session.ts                 # Tipos para sesiones
│   ├── message.ts                 # Tipos para mensajes
│   └── guideline-usage.ts        # Tipos para uso de directrices
└── prisma/
    ├── schema.prisma              # Esquema de base de datos
    ├── migrations/                # Migraciones de base de datos
    └── seed.ts                    # Datos iniciales
```

## Características del Sistema

### Gestión de Directrices

- **Directrices Inteligentes**: Sistema de prioridades y triggers para activación automática
- **Fuerza Configurable**: Directrices "hard" (obligatorias) y "soft" (recomendaciones)
- **Uso Único**: Control de directrices que solo deben aplicarse una vez por sesión
- **Búsqueda Avanzada**: Filtros por prioridad, fuerza, triggers y uso único

### Sistema de Sesiones

- **Conversaciones Organizadas**: Cada interacción con un cliente se registra como sesión
- **Historial Completo**: Seguimiento de todos los mensajes y directrices aplicadas
- **Tracking de Uso**: Registro detallado de cuándo y cómo se aplican las directrices

### API RESTful Completa

- **CRUD de Directrices**: Leer directrices
- **Gestión de Sesiones**: Crear, leer, eliminar y gestionar conversaciones
- **Sistema de Mensajes**: Intercambio de mensajes dentro de las sesiones
- **Análisis de Uso**: Endpoints para analizar la efectividad de las directrices

## Base de Datos Container

El proyecto utiliza PostgreSQL con Docker para el almacenamiento persistente de datos.

### Configuración Docker

- **Imagen:** PostgreSQL 15 Alpine
- **Puerto:** 5432
- **Base de datos:** uptail_guidelines
- **Usuario:** uptail_user
- **Contraseña:** uptail_password
- **Volumen:** postgres_data (persistente)

### Migración de Datos

Los datos existentes en `guidelines.json` se migran automáticamente al ejecutar `npm run db:seed`.

## Gestión de la Base de Datos

### Iniciar/Detener

```bash
npm run db:up      # Iniciar
npm run db:down    # Detener
npm run db:restart # Reiniciar
```

### Ver Logs

```bash
npm run db:logs
```

### Acceso Directo

```bash
npm run db:studio  # Interfaz web de Prisma
```

### Resetear

```bash
npm run db:reset   # Resetear y repoblar
```

## Troubleshooting

### Problemas de Conexión

- Verificar que Docker esté ejecutándose
- Comprobar que el contenedor esté activo: `docker ps`
- Verificar variables de entorno en `.env.local`
- Revisar logs: `npm run db:logs`

### Problemas de Prisma

- Regenerar cliente: `npm run db:generate`
- Resetear base de datos: `npm run db:reset`
- Verificar esquema: `npm run db:studio`

### Conflictos de Puerto

Si el puerto 5432 está ocupado, modificar `docker-compose.yml`:

```yaml
ports:
  - "5433:5432"  # Usar puerto diferente
```

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
