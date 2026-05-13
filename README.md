# Command Center

Dashboard de planificación personal que se abre como página de inicio en tu segundo monitor. En una sola pantalla: tus 3 tareas del día, tu estructura horaria, tu progreso de gym, tus negocios, eventos futuros y recordatorios. Pensado para reducir la procrastinación y reemplazar la "improvisación al prender el PC" por una vista de mando.

Construido como PWA — funciona **offline**, se instala como **app de escritorio o móvil**, y exporta tu agenda a `.ics` para que el calendario nativo de tu teléfono te recuerde durante el día.

![stack](https://img.shields.io/badge/React-19-5B8DEF) ![stack](https://img.shields.io/badge/TypeScript-strict-5B8DEF) ![stack](https://img.shields.io/badge/Tailwind-4-22C55E) ![stack](https://img.shields.io/badge/Vite-PWA-F59E0B) ![stack](https://img.shields.io/badge/offline-first-22C55E)

---

## ¿Qué tiene adentro?

| Módulo | Para qué sirve |
|---|---|
| **Header + reloj** | Saludo dinámico según la hora, fecha en español, reloj monoespaciado tipo Linear. |
| **3 tareas del día** | Slots fijos por área (Universidad / Negocio / Salud) con progreso `0/3`. Soporta tareas **extras** ilimitadas. Editor de planificación nocturna después de las 21:00. |
| **Schedule** | Timeline de bloques del día, resalta el bloque actual, countdown al próximo, editable inline. |
| **Gym tracker** | Semana con 7 dots (L–D), estados completado/saltado/descanso, racha contadora, workout del día configurable por día. |
| **Sincroniza tu día** | Exporta `.ics` con tareas + workout + eventos futuros y alarmas distribuidas durante el día. Importable en Apple Calendar / Google Calendar. |
| **Agenda de eventos futuros** | Grilla de mes + lista por urgencia. Cada evento tiene su **checklist** ("lo que tiene que tener") + fecha + hora + tipo (Entrega / Presentación / Examen / Reunión). |
| **Negocio – Zapatillas** | Input rápido de pedidos del día, ingreso automático, acumulado mensual. |
| **Negocio – Dropshipping** | Inputs de ad spend / ventas / unidades, ROAS, semáforo verde/amarillo/rojo, P&L automático, gráfico Recharts de 7 días, alerta automática si llevas 3 días con ROAS < 1.5. |
| **Pendientes operativos** | To-do list de negocio con prioridad (alta / media / baja) y filtro por business. |
| **Settings** | Editor de nombre, frase del footer, hora de planificación nocturna, rutina de gym por día, notificaciones del navegador, morning briefing. |
| **Atajos de teclado** | `Ctrl+1/2/3` para tareas, `Ctrl+N` extra, `Ctrl+E` descargar `.ics`, `Ctrl+,` settings, `Ctrl+/` panel de atajos. |
| **Notificaciones del navegador** | Te avisa al inicio de cada bloque + pulse horario si tienes tareas sin marcar. |
| **Morning briefing** | Overlay automático en el primer visit del día (5–14h): repaso de ayer + plan de hoy + eventos de la semana. |
| **PWA** | Instalable como app de escritorio o móvil. Service Worker pre-cachea todo — funciona sin internet. |

---

## Stack

- **React 19** + **TypeScript** (strict)
- **Vite 8** + **vite-plugin-pwa** (Workbox)
- **Tailwind CSS 4** (paleta Linear-style en near-black + electric blue)
- **date-fns** para manejo de fechas en español
- **Recharts** para el gráfico de tendencias de dropshipping
- **Lucide React** para iconografía
- Estado en `localStorage` con `useSyncExternalStore` para sincronización entre componentes
- Sin backend, sin base de datos, sin auth — todo offline-first

---

## Requisitos

- **Node.js 20+** ([nodejs.org](https://nodejs.org))
- **npm** (viene con Node)
- Un navegador moderno con soporte PWA: **Chrome**, **Edge** o **Brave** (Firefox no soporta install-as-app en desktop).

---

## Instalación

### 1. Clona el repo

```bash
git clone https://github.com/<tu-usuario>/command-center.git
cd command-center
```

### 2. Instala dependencias

```bash
npm install
```

### 3. Modo desarrollo (opcional)

Si quieres tocar el código:

```bash
npm run dev
```
Abre [http://localhost:5173](http://localhost:5173). Hot reload activo. **No instales el PWA desde aquí**: usa el preview de producción más abajo.

### 4. Build de producción

```bash
npm run build
```
Genera `dist/` con el bundle minificado + Service Worker.

### 5. Servir el build (necesario para instalar el PWA)

```bash
npm run preview
```
Sirve `dist/` en [http://localhost:4173](http://localhost:4173). Déjalo corriendo solo durante la instalación.

---

## Instalar como app de escritorio (Chrome / Edge en Windows / Mac / Linux)

1. Asegúrate que el preview server esté corriendo (`npm run preview`).
2. Abre [http://localhost:4173](http://localhost:4173) en Chrome o Edge.
3. En la barra de direcciones, a la derecha del URL, aparece un ícono pequeño con forma de monitor + flecha. El tooltip dice **"Instalar Command Center"**. Click.
   - Si no lo ves: menú **⋮ → Cast, save, and share → Install page as app** (Chrome) o **⋯ → Apps → Install this site as an app** (Edge).
4. Confirma → la app se abre en su propia ventana sin barra de direcciones.
5. Ya está instalada. Aparece en el menú Inicio / Launchpad / Activities y en la taskbar.
6. Puedes **cerrar el terminal del preview** — el Service Worker ya cacheó todo y la app funciona offline desde caché.

### Abrir automáticamente al iniciar Windows

1. `Windows + R` → escribe `shell:startup` → Enter (abre la carpeta de Inicio).
2. `Windows + R` → `shell:appsfolder` → Enter (todas tus apps).
3. Busca **Command Center** en la segunda ventana, click derecho → **Crear acceso directo** → cópialo a la carpeta `shell:startup`.

### Abrir automáticamente al iniciar macOS

System Settings → General → Login Items → Add (+) → busca Command Center.

---

## Instalar en el teléfono

> **Heads up**: la app guarda datos en `localStorage` por dispositivo. Si la instalas en tu PC y en tu teléfono, **cada uno tiene sus propios datos** (no sincronizan). Para sincronización real necesitarías agregar un backend (Supabase, Firebase, etc.) — no incluido en esta versión.

### Opción A — Desde una URL deployed (recomendado)

Deploya el proyecto a un host gratuito que te dé HTTPS:

```bash
# Vercel
npm install -g vercel
vercel              # responde "yes" a casi todo

# o Netlify
npm install -g netlify-cli
netlify deploy --prod
```

Te queda una URL como `https://command-center-xxx.vercel.app`. Ábrela en el navegador del teléfono:

- **iOS Safari**: botón **Share** (□↑) → **"Add to Home Screen"** → confirma. Aparece el ícono en el home screen y abre como app nativa.
- **Android Chrome**: menú **⋮** → **"Install app"** o **"Add to Home Screen"**. Igual de fluido.

### Opción B — Sin deploy, solo recordatorios

Si solo quieres que el teléfono te avise con alarmas del calendario y no necesitas el dashboard ahí:

1. En el dashboard del PC, abre la card **Sincroniza tu día** → click **"Descargar día (.ics)"**.
2. Mándate el archivo `command-center-YYYY-MM-DD.ics` por Telegram / WhatsApp / AirDrop / email.
3. Tócalo en el teléfono → tu app de Calendario nativo lo importa → suenan las alarmas durante el día.

---

## Primera configuración

Cuando abras la app por primera vez:

1. **Settings** (ícono ⚙ arriba a la derecha del header):
   - **Identidad**: tu nombre + frase del footer.
   - **Planificación**: hora a la que se desbloquea el editor de tareas para mañana (default 21:00).
   - **Rutina de gym**: qué workout te toca cada día de la semana.
   - **Notificaciones**: si las activas, te avisa al inicio de cada bloque + pulse horario si hay tareas sin marcar.
   - **Morning briefing**: overlay automático en el primer visit del día.
2. **Schedule** (card "Estructura horaria"): botón **"Editar"** → ajusta tus bloques horarios reales.
3. **Dropshipping** (si lo usas): botón **"Costos"** → configura costo por unidad, fees, ROAS objetivo.

Los defaults vienen pensados para alguien en universidad con dos negocios y rutina de gym 4×/semana. Si no aplican a ti, los reemplazas en 2 minutos.

---

## Actualizar la app

Cuando hagas cambios al código:

```bash
git pull            # si clonaste el repo
npm run build       # regenera dist/
npm run preview     # sirve la nueva versión
```

Abre la app instalada → refresca con `Ctrl + R` una vez. El Service Worker detecta la nueva versión y actualiza en segundo plano. Después cierra el preview server.

---

## Estructura del proyecto

```
src/
├── App.tsx                       # Layout bento de toda la app
├── components/
│   ├── Header.tsx                # Reloj + saludo + botones Settings/Keyboard
│   ├── DailyTasks.tsx            # 3 tareas + extras + planning nocturno
│   ├── TodayStats.tsx            # Anillo de progreso del día
│   ├── Schedule.tsx              # Timeline de bloques horarios
│   ├── GymTracker.tsx            # Semana de gym + streak
│   ├── ExportCalendar.tsx        # Generador de .ics
│   ├── EventsCard.tsx            # Agenda con grilla de mes + lista
│   ├── EventModal.tsx            # Crear/editar evento + checklist
│   ├── ZapatillasCard.tsx        # Pedidos del día + acumulado mes
│   ├── DropshippingCard.tsx      # ROAS, P&L, semáforo
│   ├── BusinessChart.tsx         # Recharts 7 días
│   ├── BusinessTodos.tsx         # To-do operativo por negocio
│   ├── RoasAlert.tsx             # Banner condicional 3-day low ROAS
│   ├── FooterQuote.tsx           # Frase del footer (configurable)
│   ├── Modal.tsx                 # Base reutilizable con portal + escape
│   ├── SettingsModal.tsx         # Editor de toda la configuración
│   ├── ShortcutsModal.tsx        # Panel de atajos de teclado
│   └── MorningBriefing.tsx       # Overlay automático del día
├── hooks/
│   ├── useLocalStorage.ts        # Sync entre componentes vía useSyncExternalStore
│   ├── useCurrentTime.ts         # Tick del reloj
│   ├── useSettings.ts            # Configuración del usuario
│   ├── useDailyTasks.ts          # 3 tareas + extras
│   ├── useSchedule.ts            # Bloques + bloque actual + countdown
│   ├── useGym.ts                 # Rutina + log + streak
│   ├── useEvents.ts              # Agenda CRUD + days-until
│   ├── useZapatillas.ts          # Log + total mes
│   ├── useDropshipping.ts        # Log + métricas + alerta 3-day streak
│   ├── useBusinessTodos.ts       # To-dos operativos
│   ├── useNotifications.ts       # Notificaciones del navegador
│   └── useKeyboardShortcuts.ts   # Atajos globales
└── utils/
    ├── constants.ts              # Tipos, áreas, defaults, paleta
    ├── dateHelpers.ts            # Format date-fns en español
    ├── timeHelpers.ts            # HH:mm utils
    ├── format.ts                 # CLP currency, ROAS
    └── icsExport.ts              # Generador RFC 5545 con VEVENT + VALARMs
```

**Storage keys de `localStorage`:**

```
cc_settings              cc_dropshipping_log      cc_business_todos
cc_daily_tasks           cc_dropshipping_config   cc_events
cc_schedule_template     cc_zapatillas_log        cc_last_briefing_date
cc_gym_routine           cc_gym_log
```

---

## Scripts disponibles

| Comando | Qué hace |
|---|---|
| `npm run dev` | Dev server con hot reload en :5173 |
| `npm run build` | TypeScript check + Vite build → `dist/` |
| `npm run preview` | Sirve `dist/` en :4173 (necesario para instalar el PWA) |
| `npm run lint` | ESLint sobre todo el proyecto |

---

## Personalización antes de compartirlo

Si vas a usar esto tú mismo o compartirlo con otros, los defaults vienen con valores específicos del autor original. Edita en [src/hooks/useSettings.ts](src/hooks/useSettings.ts):

```ts
export const DEFAULT_SETTINGS: Settings = {
  userName: 'tu nombre',
  footerPhrase: 'tu mantra personal',
  nightPlanningHour: 21,
  notificationsEnabled: false,
  morningBriefingEnabled: true,
}
```

Y en [src/utils/constants.ts](src/utils/constants.ts) puedes ajustar:
- `DEFAULT_SCHEDULE` — bloques horarios sugeridos
- `DEFAULT_GYM_ROUTINE` — rutina de gym por día de la semana
- `DEFAULT_DROPSHIPPING_CONFIG` — costos default del módulo de negocio

---

## Filosofía de diseño

Inspirada en el documento de requerimientos original:

1. **Minimalismo funcional**: cada elemento responde a una pregunta que te haces todos los días.
2. **Zero-friction**: agregar una tarea o registrar una métrica debe tomar < 10 segundos.
3. **Visual-first**: colores y estados visuales en lugar de listas de texto plano.
4. **Offline-first**: funciona sin internet. Sin backend, sin login, sin servicio que se pueda caer.
5. **Incremental**: cada feature debe ser usable por sí sola. Apaga lo que no uses.

---

## Roadmap

- [x] Fase 1 — 3 tareas del día con persistencia
- [x] Fase 2 — Bloques horarios + gym tracker con streak
- [x] Fase 3 — Negocio (Zapatillas + Dropshipping) + P&L + gráfico
- [x] Export `.ics` para Apple/Google Calendar
- [x] PWA instalable + Service Worker offline
- [x] Settings editables + atajos de teclado + notificaciones + morning briefing
- [x] Agenda de eventos futuros con checklist
- [ ] Fase 4 — Streaks de sueño/planificación, gamificación, heatmap, modo focus + Pomodoro, export JSON
- [ ] Sincronización entre dispositivos (Supabase backend, opcional)
- [ ] Toggle para ocultar módulos no usados (ej. dropshipping si no aplica)

---

## Licencia

Personal use. Si te resulta útil, fork y adáptalo a tu sistema.
