# NEXO Academia — web demo para academias de refuerzo escolar

Web completa y funcional para una academia de refuerzo escolar ficticia en
Montecarmelo (Madrid). No es una plantilla: es una demostración de producto
pensada para enseñar a propietarios de academias reales qué puede hacer una web
bien construida por ellos.

Lo que la diferencia de una web de academia convencional son **siete
herramientas gratuitas** que funcionan en el navegador, se alimentan entre sí y
terminan generando un mensaje de WhatsApp ya escrito y cualificado.

---

## 1. Qué es esto

| | |
|---|---|
| **Negocio** | NEXO Academia (ficticia), Calle Monasterio de Arlanza 12, Montecarmelo, Madrid |
| **Stack** | HTML5 + CSS3 + JavaScript vanilla. Sin frameworks, sin build, sin backend |
| **Páginas** | Inicio, Cursos, Metodología, Profesores, Herramientas, Diagnóstico, Contacto, Privacidad |
| **Conversión principal** | Solicitar valoración inicial gratuita |
| **Conversión secundaria** | WhatsApp con mensaje contextual |
| **Tercera** | Usar una herramienta y enviar el resultado |

### Las siete herramientas

| Herramienta | Qué resuelve | Cómo explicárselo al dueño de la academia |
|---|---|---|
| **Diagnóstico académico** (`diagnostico.html`) | Ocho preguntas → perfil (base / método / examen / intensivo) + modalidad y sesiones recomendadas | «Esto convierte a un visitante anónimo en una ficha con curso, asignatura y necesidad antes de que te escriba» |
| **Calculadora de nota final** (`#nota`) | Trabaja con los criterios reales de evaluación (exámenes, trabajos, proyectos, actitud) y dice qué hace falta en lo que queda | «Esto hace que un alumno use tu web aunque todavía no sea cliente tuyo» |
| **Planificador semanal** (`#planner`) | Reparte las horas disponibles por dificultad y proximidad del examen. Imprimible | «Un plan con tu nombre pegado en la pared del alumno» |
| **Plan de examen** (`#examen`) | Convierte «tengo examen en X días» en fases con orden | «La duda más repetida de un alumno de Bachillerato, resuelta sin que nadie conteste» |
| **Calculadora de precio** (`#precio`) | Horquilla orientativa con las tarifas públicas | «Reduce los mensajes de “¿cuánto cuesta?” porque lo calculan antes de escribir» |
| **Grupo o individual** (`#modalidad`) | Cinco preguntas y una recomendación honesta | «Si lo honesto es el grupo reducido, que es lo más barato, eso es lo que dice» |
| **Horarios y plazas** (`#plazas`) | Grupos abiertos con días, hora y plazas libres | «Elimina los “¿qué horarios tenéis?” y hace que te escriban ya por una franja concreta» |

Y la pieza que las une: **la ficha del alumno** (`herramientas.html#ficha`). Cada
herramienta escribe en ella y un solo botón envía todo junto por WhatsApp.

---

## 2. Cómo ejecutarlo en local

No hay dependencias ni paso de compilación. Hace falta un servidor estático
porque las páginas cargan varios `.js` y `.css` (abrir el HTML con doble clic
también funciona, pero algunos navegadores bloquean recursos en `file://`).

```bash
python -m http.server 4173
```

Después, abre <http://localhost:4173>.

Alternativas equivalentes:

```bash
npx serve .
```

---

## 3. Cómo desplegarlo en Vercel

El proyecto es estático puro, así que no hay configuración de build.

**Desde la interfaz web:** importa el repositorio en Vercel, deja *Framework
Preset* en **Other**, *Build Command* vacío y *Output Directory* en `.`.

**Desde la terminal:**

```bash
npx vercel --prod
```

El archivo `vercel.json` incluido ya activa URLs limpias (`/cursos` en lugar de
`/cursos.html`), cabeceras de seguridad y caché larga para `assets/`.

Después del despliegue, sustituye `https://nexoacademia.es` por el dominio real
en:

- el `<link rel="canonical">` y las etiquetas `og:` de cada `.html`
- los bloques `application/ld+json` de cada `.html`
- `robots.txt`
- `sitemap.xml`
- `ACADEMY.seo.baseUrl` en `js/content.js`

---

## 4. Cómo cambiar los datos de la academia

Casi todo vive en **un único archivo: `js/content.js`**. No hace falta tocar el
HTML para cambiar nombre, precios, profesores, cursos, horarios ni textos
comerciales.

### Nombre, teléfono, WhatsApp y dirección

```js
brand: {
  name: 'NEXO Academia',        // aparece en cabecera, pie y mensajes
  claim: '...',
  descriptor: '...'             // descripción del pie
},

contact: {
  phoneDisplay: '600 12 34 56', // cómo se ve
  phoneHref: '+34600123456',    // para el enlace tel:
  whatsapp: '34600123456',      // SÓLO dígitos, con prefijo de país y sin +
  email: 'hola@nexoacademia.es',
  address: { street: '...', city: '...', postalCode: '...' },
  mapsUrl: 'https://maps.google.com/?q=...'
}
```

> El número de WhatsApp es el único campo con formato estricto: dígitos
> seguidos, con prefijo internacional y **sin** `+`, espacios ni guiones.
> `wa.me` no acepta otra cosa.

### Horarios

```js
hours: [
  { label: 'Lunes a jueves', value: '16:00 – 21:30', days: ['Mo','Tu','We','Th'], opens: '16:00', closes: '21:30' }
]
```

`label` y `value` son lo que ve el visitante. `days`, `opens` y `closes` sólo se
usan si decides generar los datos estructurados desde aquí.

### Profesores

```js
teachers: [
  {
    id: 'marta',
    name: 'Marta Ibáñez',
    role: 'Dirección académica · Matemáticas',
    years: 14,
    subjects: ['Matemáticas ESO', 'Matemáticas Bachillerato'],
    bio: 'Una frase humana y concreta, no una bio corporativa.',
    initials: 'MI',            // aparecen en el retrato
    accent: 'verde'            // verde · tinta · rojo
  }
]
```

Añadir o quitar profesores sólo requiere editar este array: la rejilla se
recalcula sola. Los retratos se generan por código (ver punto 8).

### Cursos y programas

```js
programs: [
  {
    id: 'eso',                 // genera el ancla #programa-eso
    level: 'eso',              // primaria · eso · bachillerato · ebau
    name: 'ESO',
    ages: '12 a 16 años',
    lead: 'Titular corto y con opinión.',
    body: 'Dos o tres frases de explicación real.',
    subjects: ['Matemáticas', 'Física y Química'],
    groupSize: 'Grupos de 6',
    frequency: '2 o 3 tardes por semana',
    duration: '90 min',
    modalities: ['grupo', 'individual', 'online'],
    featured: true             // true = sale también en la portada
  }
]
```

### Testimonios

```js
testimonials: [
  { text: '...', author: 'Rocío M.', relation: 'Madre de alumno de 2º ESO', initials: 'RM' }
]
```

### Preguntas frecuentes

```js
faqs: [ { q: '¿Cuánto cuesta el refuerzo al mes?', a: '...' } ]
```

> **Ojo:** las preguntas se pintan desde `content.js`, pero el bloque
> `FAQPage` de datos estructurados está escrito a mano en `contacto.html`.
> Si cambias las preguntas, actualiza también ese bloque para que buscadores y
> página digan lo mismo.

---

## 5. Cómo cambiar el diagnóstico

Todo está en `ACADEMY.diagnostic` (`js/content.js`).

### Añadir o modificar una pregunta

```js
{
  id: 'breaks',                // identificador único
  title: '¿Dónde se rompe exactamente?',
  help: 'Texto de apoyo opcional.',
  type: 'single',              // single · multi · grades
  options: [
    {
      value: 'teoria',
      label: 'No entiende la explicación de clase',
      hint: 'Se pierde desde el principio del tema',
      score: { base: 3 }       // puntos que suma a cada perfil
    }
  ]
}
```

- `type: 'single'` → una sola respuesta, con avance automático al pulsar.
- `type: 'multi'` → varias; usa `max` para limitarlas.
- `type: 'grades'` → la pantalla doble de nota actual y nota objetivo.
- El orden del array es el orden de las preguntas. Quitar una no rompe nada.

### Cambiar los perfiles de salida

```js
profiles: {
  base: {
    name: 'Refuerzo de base',
    headline: 'Frase que resume el diagnóstico.',
    explain: 'Párrafo explicando por qué.',
    recommendations: ['...', '...', '...'],
    modality: 'grupo',         // se usa para calcular el precio orientativo
    sessions: 2,
    duration: 90,
    selfWork: '2 horas de trabajo autónomo guiado'
  }
}
```

`order` define el desempate cuando dos perfiles empatan a puntos: gana el que
aparece antes en la lista.

Las frases de «Por qué sale este perfil» están en `js/diagnostico.js`, en los
objetos `BREAK_REASON` y `ROUTINE_REASON`.

---

## 6. Cómo cambiar la lógica del planificador

`ACADEMY.planner` (`js/content.js`) controla la parte configurable:

```js
planner: {
  blockMinutes: 45,            // duración de cada bloque
  shortBreak: 15,              // descanso entre bloques
  startTimes: { tarde: '17:00', noche: '19:00' },
  difficultyWeight: { baja: 1, media: 1.6, alta: 2.4 },
  urgencyWeight: { 7: 2.2, 14: 1.6, 30: 1.2, 0: 1 },
  advice: { few: '...', many: '...', balanced: '...' }
}
```

La prioridad de cada asignatura es `difficultyWeight × urgencyWeight`. Subir
`difficultyWeight.alta` concentra más bloques en la asignatura que peor lleva el
alumno; subir `urgencyWeight[7]` prioriza más lo que tiene examen esta semana.

El reparto en sí (`allocate` y `buildPlan`, en `js/planner.js`) es determinista:
con los mismos datos siempre sale el mismo plan. No hay aleatoriedad ni IA.

Las tareas concretas de cada bloque están en la constante `TASKS` de
`js/planner.js`.

### Plan de examen

`ACADEMY.examPlan` define las fases y su peso relativo:

```js
phases: [
  { id: 'base', name: 'Conceptos base', share: 0.28, detail: '...' }
]
```

Los `share` se normalizan solos, así que puedes cambiarlos sin que sumen 1.

---

## 7. Cómo cambiar las tarifas

`ACADEMY.pricing` (`js/content.js`). El modelo es deliberadamente transparente
para que el propio cliente pueda verificarlo:

> **precio/mes = €/hora de la modalidad × factor del nivel × horas al mes**

```js
pricing: {
  weeksPerMonth: 4.33,
  rangeSpread: 0.06,           // ± 6 % → horquilla en vez de cifra exacta
  modalities: [
    { id: 'grupo',      name: 'Grupo reducido',   hourly: 11.5, note: '...' },
    { id: 'individual', name: 'Clase individual', hourly: 27,   note: '...' },
    { id: 'online',     name: 'Online en directo', hourly: 10.5, note: '...' }
  ],
  levelFactor: { primaria: 0.92, eso: 1, bachillerato: 1.12, ebau: 1.2 },
  discounts: [ { label: 'Segundo hermano', value: '−10 %' } ],
  disclaimer: 'Precio orientativo...'
}
```

Cambiar `hourly` actualiza a la vez la calculadora de precio, el diagnóstico y el
test de modalidad. El resultado se redondea a múltiplos de 5 €.

> La tabla comparativa de `cursos.html` tiene los precios escritos a mano para
> que se lean sin JavaScript. Si cambias las tarifas, revísala.

### Grupos y plazas

```js
schedule: {
  updatedLabel: 'Plazas actualizadas esta semana',
  slots: [
    { id: 'g1', level: 'eso', course: '1º y 2º ESO', subject: 'Matemáticas',
      days: 'Lunes y miércoles', time: '17:00', duration: 90, seats: 6, taken: 4 }
  ]
}
```

`seats` son las plazas totales y `taken` las ocupadas. Cuando `taken === seats`
el grupo se marca como completo y el mensaje pasa a pedir lista de espera. Es el
único dato que conviene revisar cada semana.

---

## 8. Fotografía e imágenes

La web usa **fotografía real** procesada con una gradación común para que todas
las fotos parezcan de la misma sesión y no una mezcla de bancos de imágenes.
Todas se sirven en **WebP** en dos tamaños, con `srcset`, medidas explícitas y
`loading="lazy"` salvo la primera.

### Sustituirlas por fotos de la academia

Es la mejor inversión que puede hacer un cliente: las fotos reales de su aula y
de su equipo se notan. Basta con dejar los archivos en `assets/images/` con el
mismo nombre y las mismas proporciones:

| Archivo | Proporción | Dónde sale |
|---|---|---|
| `aula.webp` (+ `aula-900.webp`) | 16:10 | Portada, foto principal |
| `apoyo.webp`, `grupo.webp`, `biblioteca.webp`, `apuntes.webp`, `estudio.webp`, `pizarra.webp` (+ variantes `-640`) | 4:3 | Programas y bloques de texto con foto |
| `profe-*.webp` (+ variantes `-420`) | 4:5 | Retratos del profesorado |

Si un profesor **no tiene foto**, basta con borrar su campo `photo` en
`content.js`: la web dibuja automáticamente una plancha tipográfica con sus
iniciales, en lugar de dejar un hueco.

### Regenerarlas desde cero

```bash
pip install Pillow
python tools/preparar-fotos.py
```

El script descarga, recorta al punto de interés de cada foto, aplica la
gradación y exporta los dos tamaños en WebP. Para cambiar una foto, sustituye su
identificador en el diccionario `FOTOS`. Con `python tools/preparar-fotos.py profe`
sólo se rehacen los retratos.

### Otros elementos gráficos

| Elemento | Dónde está | Cómo sustituirlo |
|---|---|---|
| Imagen de compartición | `assets/images/og-nexo.png` (1200×630) | `python tools/generar-og.py` tras editar sus constantes |
| Favicon | `assets/icons/favicon.svg` | Monograma dibujado con geometría, sin tipografía |
| Gráfico de evolución | HTML + CSS en la portada y en metodología | Cambia `--h` (altura en %) y el valor visible de cada `.trend__col` |

### Origen de las fotografías

Todas las fotos de la demostración proceden de **Unsplash**, bajo su licencia
gratuita para uso comercial sin atribución obligatoria. Sus identificadores están
en `tools/preparar-fotos.py`, junto al nombre de archivo que genera cada una.
Para una web real conviene sustituirlas por fotografía propia: además de ser más
creíble, evita coincidir con otra empresa que use la misma imagen.

## 9. Qué es demo y qué es real

**Ficticio, hay que sustituirlo antes de publicar:**

- Nombre, dirección, teléfono, correo y número de WhatsApp
- Los seis profesores, sus biografías y su experiencia
- Los testimonios y la valoración media (4,9 de 87 reseñas)
- Las cifras de la portada (+500 alumnos, 14 años)
- Las tarifas y la disponibilidad de plazas
- El contenido de `privacidad.html`, que es un resumen honesto pero no un aviso
  legal completo

**Real y funcional tal cual:**

- Las siete herramientas, con toda su lógica de cálculo
- La generación de mensajes de WhatsApp y de correo
- La ficha del alumno y su persistencia en el navegador
- El SEO técnico: títulos, descripciones, canonical, Open Graph, datos
  estructurados, `robots.txt` y `sitemap.xml`
- El comportamiento responsive, la accesibilidad y el rendimiento

---

## 10. Qué habría que conectar para que fuera una web real

Nada de esto es imprescindible para publicar —la web convierte igual sin ello—
pero son los pasos naturales si el negocio crece:

1. **Formulario con servidor.** Hoy la solicitud termina en WhatsApp o `mailto:`.
   Para recibirla por correo o en un CRM basta un endpoint de formulario
   (Formspree, Vercel Functions, Netlify Forms) en `finish()` de `js/tools.js`.
2. **Plazas automáticas.** `ACADEMY.schedule.slots` se actualiza a mano. Podría
   leerse de un Google Sheet publicado o de un JSON que edite la academia.
3. **Analítica sin cookies.** Plausible o Umami permiten medir qué herramienta
   genera más contactos sin necesidad de aviso de cookies.
4. **Reseñas reales.** Sustituir los testimonios por las reseñas de Google
   Business Profile y ajustar `aggregateRating` en el JSON-LD con los datos
   verdaderos. Publicar una valoración media falsa puede acarrear una sanción.
5. **Aviso legal y política de privacidad completos**, con responsable del
   tratamiento, base jurídica y ejercicio de derechos.
6. **Google Business Profile** enlazado desde la web y con la misma dirección,
   teléfono y horario que el JSON-LD. Es lo que más mueve la aguja en SEO local.

---

## 11. Estructura del proyecto

```text
/
├── index.html              Portada
├── cursos.html             Programas y comparativa de modalidades
├── metodologia.html        Método, primera semana y qué no hacemos
├── profesores.html         Equipo y criterios de selección
├── herramientas.html       Hub con seis herramientas + ficha del alumno
├── diagnostico.html        Diagnóstico académico completo
├── contacto.html           Solicitud por pasos, datos y preguntas frecuentes
├── privacidad.html         Qué datos se guardan y dónde
│
├── css/
│   ├── main.css            Tokens, tipografía, layout y secciones
│   ├── components.css      Botones, campos, herramientas, resultados, estados
│   └── responsive.css      Ajustes por formato (320 → 2560 px)
│
├── js/
│   ├── content.js          TODOS los datos editables
│   ├── utils.js            Helpers, ficha, WhatsApp, fábricas de UI, asistente
│   ├── render.js           Pinta programas, profesores, opiniones y preguntas
│   ├── main.js             Navegación, revelado, barra fija y ficha del alumno
│   ├── diagnostico.js      Diagnóstico académico
│   ├── calculator.js       Motor de tarifas + calculadora por criterios y de precio
│   ├── planner.js          Planificador semanal
│   └── tools.js            Plan de examen, modalidad, plazas y solicitud
│
├── assets/
│   ├── images/og-nexo.png  Imagen de compartición 1200×630
│   └── icons/favicon.svg
│
├── tools/
│   ├── preparar-fotos.py   Descarga, recorta y exporta la fotografía (opcional)
│   └── generar-og.py       Regenera la imagen de compartición (opcional)
├── vercel.json             URLs limpias, cabeceras y caché
├── robots.txt
└── sitemap.xml
```

### Cómo está organizado el CSS

Todo se apoya en custom properties declaradas en `:root` (`css/main.css`).
Las secciones oscuras no reescriben selector por selector: **redefinen los
tokens de texto**, de modo que ningún gris pensado para fondo claro puede
colarse sobre tinta.

```css
.section--ink, .on-ink, .site-footer {
  --tx: #faf7f2;
  --tx-2: #a8adb6;
  --rule: rgba(250, 247, 242, .18);
}
```

Para cambiar la identidad cromática de toda la web basta con tocar cuatro
valores: `--paper`, `--ink`, `--green` y `--red`.

---

## 12. Decisiones técnicas

- **Sin framework y sin build.** Un cliente puede abrir `content.js` en el bloc
  de notas, cambiar un precio y subirlo. Ese es el punto.
- **Los datos se pintan desde JavaScript, los titulares no.** `h1`, entradillas,
  encabezados de sección y datos estructurados están en el HTML para que
  buscadores y lectores de pantalla los tengan sin depender de JS.
- **Las herramientas no escriben en la ficha hasta que hay interacción real**,
  para que el panel no aparezca relleno con valores por defecto.
- **La ficha guarda sólo información académica.** Ni nombre, ni edad, ni
  teléfono, ni correo: esos datos únicamente viajan en el mensaje que la persona
  decide enviar, y puede leerlo antes.
- **Movimiento con intención.** Un gesto de entrada en la portada, transiciones
  entre pasos, feedback de pulsación y barras de progreso. Nada más, y todo
  bajo `prefers-reduced-motion`.
- **Tipografía:** Fraunces (display) y Archivo (texto), servidas por Google Fonts
  con `preconnect` y `font-display: swap`. Para eliminar la dependencia externa,
  descarga los `.woff2`, colócalos en `assets/fonts/` y declara `@font-face` en
  `main.css`.
- **Color:** papel crema, verde bosque como superficie oscura de marca (en vez de
  un negro plano, que enfriaba la página) y un **ámbar** que aporta el color
  visible: cifras, subrayados, estrellas, plazas y barras de progreso. El ámbar
  de relleno (`--amber`) no llega a AA como texto, así que para texto existe
  `--amber-ink`; la distinción está marcada en los tokens.
- **La calculadora de nota trabaja por criterios de evaluación**, no sólo por
  exámenes: en la ESO y en Bachillerato casi nunca puntúa únicamente el examen,
  y una herramienta que lo ignorase daría cifras falsas.
- **El planificador ocupa todo el ancho del hub** (`.tool--wide`): una rejilla de
  días no cabe en media columna, y encajonarla era justo lo que la hacía ilegible.

---

## 13. Comprobado

- **Responsive:** 320, 375, 390, 430, 768, 1024, 1440, 1920 y 2560 px, sin
  desbordamiento horizontal en ninguna página.
- **Contraste:** texto normal ≥ 4,5:1 y grande ≥ 3:1 en las ocho páginas, sobre
  papel, sobre papel cálido y sobre tinta.
- **Accesibilidad:** HTML semántico, un solo `h1` por página, jerarquía de
  encabezados sin saltos, todos los campos etiquetados, `aria-controls` válidos,
  foco visible, menú y acordeón operables con teclado, enlace de salto al
  contenido.
- **Herramientas:** valores límite (objetivo inalcanzable, nota ya asegurada,
  porcentajes que suman más de 100, 2 y 60 días de examen, cero asignaturas) y
  mensajes de error que dicen qué corregir.
- **WhatsApp:** tildes, eñes, comillas angulares y saltos de línea correctos en
  el mensaje generado.
- **Imágenes:** todas cargan, ninguna se repite dentro de la misma página, todas
  declaran medidas y todas se sirven en WebP con `srcset`.
- **Herramientas:** valores límite en la calculadora por criterios (objetivo
  inalcanzable, nota ya asegurada, pesos que no suman 100 %, todo evaluado, un
  único criterio pendiente), en el plan de examen (2 y 60 días) y en el
  planificador (una y cuatro asignaturas).
