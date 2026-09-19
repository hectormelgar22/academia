/**
 * content.js — Fuente única de verdad de NEXO Academia.
 *
 * Todo lo que un cliente necesita cambiar vive aquí: nombre, contacto, horarios,
 * cursos, profesores, tarifas, testimonios, preguntas del diagnóstico y plantillas
 * de WhatsApp. El resto del sitio lee de este objeto.
 *
 * Los datos son ficticios: sustitúyelos por los reales antes de publicar (README.md).
 */

const ACADEMY = {

  /* ─────────────────────────────  MARCA  ───────────────────────────── */
  brand: {
    name: 'NEXO Academia',
    shortName: 'NEXO',
    legalName: 'NEXO Academia S.L.',
    foundedYear: 2011,
    claim: 'Refuerzo cuando lo necesitas. Método cuando te falta.',
    descriptor: 'Academia de refuerzo escolar y preparación académica en Montecarmelo, Madrid.'
  },

  /* ────────────────────────────  CONTACTO  ─────────────────────────── */
  contact: {
    phoneDisplay: '600 12 34 56',
    phoneHref: '+34600123456',
    whatsapp: '34600123456',          // sólo dígitos, con prefijo de país
    email: 'hola@nexoacademia.es',
    address: {
      street: 'Calle Monasterio de Arlanza, 12',
      district: 'Montecarmelo',
      city: 'Madrid',
      postalCode: '28049',
      region: 'Comunidad de Madrid',
      country: 'ES'
    },
    coords: { lat: 40.4917, lng: -3.6889 },
    mapsUrl: 'https://maps.google.com/?q=Calle+Monasterio+de+Arlanza+12,+28049+Madrid',
    areaServed: ['Montecarmelo', 'Las Tablas', 'Fuencarral', 'Mirasierra', 'Tres Olivos', 'Sanchinarro']
  },

  hours: [
    { label: 'Lunes a jueves', value: '16:00 – 21:30', days: ['Mo', 'Tu', 'We', 'Th'], opens: '16:00', closes: '21:30' },
    { label: 'Viernes', value: '16:00 – 20:00', days: ['Fr'], opens: '16:00', closes: '20:00' },
    { label: 'Sábados', value: 'Sólo intensivos y PAU', days: ['Sa'], opens: '10:00', closes: '14:00' }
  ],

  /* ───────────────────  CIFRAS (ficticias, coherentes)  ─────────────── */
  stats: {
    yearsOpen: 14,
    studentsHelped: 500,
    maxGroupSize: 6,
    teachers: 6,
    rating: 4.9,
    reviews: 87
  },

  seo: {
    baseUrl: 'https://nexoacademia.es',
    locale: 'es_ES'
  },

  /* ───────────────────────────  ASIGNATURAS  ───────────────────────── */
  subjects: [
    { id: 'matematicas', name: 'Matemáticas',        levels: ['primaria', 'eso', 'bachillerato', 'pau'] },
    { id: 'fisica',      name: 'Física',             levels: ['eso', 'bachillerato', 'pau'] },
    { id: 'quimica',     name: 'Química',            levels: ['eso', 'bachillerato', 'pau'] },
    { id: 'biologia',    name: 'Biología',           levels: ['eso', 'bachillerato', 'pau'] },
    { id: 'ingles',      name: 'Inglés',             levels: ['primaria', 'eso', 'bachillerato'] },
    { id: 'lengua',      name: 'Lengua',             levels: ['primaria', 'eso', 'bachillerato', 'pau'] },
    { id: 'dibujo',      name: 'Dibujo Técnico',     levels: ['bachillerato', 'pau'] },
    { id: 'economia',    name: 'Economía',           levels: ['bachillerato', 'pau'] },
    { id: 'tecnicas',    name: 'Técnicas de estudio', levels: ['primaria', 'eso', 'bachillerato'] }
  ],

  /* ─────────────────────────  NIVELES Y CURSOS  ────────────────────── */
  levels: [
    { id: 'primaria',     name: 'Primaria',     courses: ['3º Primaria', '4º Primaria', '5º Primaria', '6º Primaria'] },
    { id: 'eso',          name: 'ESO',          courses: ['1º ESO', '2º ESO', '3º ESO', '4º ESO'] },
    { id: 'bachillerato', name: 'Bachillerato', courses: ['1º Bachillerato', '2º Bachillerato'] },
    { id: 'pau',         name: 'PAU',         courses: ['Preparación PAU'] }
  ],

  /* ──────────────────────────  PROGRAMAS  ──────────────────────────── */
  programs: [
    {
      id: 'primaria',
      level: 'primaria',
      image: 'apoyo',
      imageAlt: 'Profesora repasando un cuaderno de ejercicios con un alumno',
      name: 'Primaria',
      ages: '8 a 12 años',
      lead: 'Deberes con criterio, no deberes vigilados.',
      body: 'Trabajamos la comprensión lectora y el cálculo antes que la tarea del día. Cuando un niño no entiende el enunciado, el problema no es de matemáticas.',
      subjects: ['Matemáticas', 'Lengua', 'Inglés', 'Comprensión lectora'],
      groupSize: 'Grupos de 5',
      frequency: '2 o 3 tardes por semana',
      duration: '60 min',
      modalities: ['grupo', 'individual'],
      featured: true
    },
    {
      id: 'eso',
      level: 'eso',
      image: 'grupo',
      imageAlt: 'Grupo reducido de alumnos de ESO atendiendo en clase',
      name: 'ESO',
      ages: '12 a 16 años',
      lead: 'El tramo en el que la mayoría se descuelga.',
      body: 'De 1º a 4º el salto de exigencia es real. Aquí se decide si un alumno arrastra lagunas hasta Bachillerato o las cierra a tiempo. Empezamos midiendo qué falta de cursos anteriores.',
      subjects: ['Matemáticas', 'Física y Química', 'Inglés', 'Lengua', 'Biología'],
      groupSize: 'Grupos de 6',
      frequency: '2 o 3 tardes por semana',
      duration: '90 min',
      modalities: ['grupo', 'individual', 'online'],
      featured: true
    },
    {
      id: 'bachillerato',
      level: 'bachillerato',
      image: 'biblioteca',
      imageAlt: 'Alumnos de Bachillerato estudiando con sus apuntes',
      name: 'Bachillerato',
      ages: '16 a 18 años',
      lead: 'La nota de Bachillerato pesa el 60 % de tu acceso.',
      body: 'Grupos separados por modalidad y asignatura. En 2º se trabaja con exámenes reales de curso desde noviembre, no en mayo.',
      subjects: ['Matemáticas I y II', 'Matemáticas CCSS', 'Física', 'Química', 'Biología', 'Dibujo Técnico', 'Economía'],
      groupSize: 'Grupos de 4',
      frequency: '2 o 3 tardes por semana',
      duration: '90 min',
      modalities: ['grupo', 'individual', 'online'],
      featured: true
    },
    {
      id: 'pau',
      level: 'pau',
      image: 'apuntes',
      imageAlt: 'Mesa de estudio con apuntes y modelos de examen',
      name: 'Preparación PAU',
      ages: '2º de Bachillerato',
      lead: 'La PAU no premia saber más. Premia responder como piden.',
      body: 'Modelos oficiales de la Comunidad de Madrid, corrección con criterio de examinador y control de tiempos. Refuerzo anual desde octubre e intensivos de abril a junio.',
      subjects: ['Matemáticas II', 'Matemáticas CCSS', 'Física', 'Química', 'Biología', 'Dibujo Técnico', 'Lengua'],
      groupSize: 'Grupos de 6',
      frequency: '2 tardes + simulacro quincenal',
      duration: '90 min',
      modalities: ['grupo', 'individual'],
      featured: true
    },
    {
      id: 'ingles',
      level: 'eso',
      image: 'estudio',
      imageAlt: 'Alumna trabajando con su cuaderno en clase de inglés',
      name: 'Inglés',
      ages: 'Primaria, ESO y Bachillerato',
      lead: 'Del aprobado al B2 sin cambiar de academia.',
      body: 'Dos vías paralelas: refuerzo del inglés del colegio y preparación de Cambridge B1, B2 y C1. Speaking en todas las sesiones, también en el grupo de refuerzo.',
      subjects: ['Inglés escolar', 'Cambridge B1', 'Cambridge B2', 'Cambridge C1'],
      groupSize: 'Grupos de 6',
      frequency: '2 tardes por semana',
      duration: '60 o 90 min',
      modalities: ['grupo', 'individual', 'online'],
      featured: false
    },
    {
      id: 'ciencias',
      level: 'bachillerato',
      image: 'pizarra',
      imageAlt: 'Profesor escribiendo ecuaciones de física en la pizarra',
      name: 'Ciencias',
      ages: '3º ESO a 2º Bachillerato',
      lead: 'Para quien entiende la teoría y se atasca en el problema.',
      body: 'Un grupo específico para las dos asignaturas que más suspensos generan. Se trabaja por bloques de problemas tipo, no repitiendo teoría.',
      subjects: ['Física', 'Química', 'Biología', 'Matemáticas aplicadas'],
      groupSize: 'Grupos de 5',
      frequency: '1 o 2 tardes por semana',
      duration: '90 min',
      modalities: ['grupo', 'individual'],
      featured: false
    }
  ],

  /* ──────────────────────────  PROFESORADO  ────────────────────────── */
  teachers: [
    {
      id: 'marta',
      photo: 'assets/images/profe-marta.webp',
      photoAlt: 'Marta Ibáñez, directora académica de NEXO Academia',
      name: 'Marta Ibáñez',
      role: 'Dirección académica · Matemáticas',
      years: 14,
      subjects: ['Matemáticas ESO', 'Matemáticas Bachillerato'],
      bio: 'Abrió NEXO en 2011 después de nueve años en un instituto público. Hace la primera valoración de casi todos los alumnos: dice que en veinte minutos sabe si el problema es de base, de método o de nervios.',
      initials: 'MI',
      accent: 'azul'
    },
    {
      id: 'carlos',
      photo: 'assets/images/profe-carlos.webp',
      photoAlt: 'Carlos Nieto, profesor de Matemáticas y Física',
      name: 'Carlos Nieto',
      role: 'Matemáticas y Física · Bachillerato y PAU',
      years: 9,
      subjects: ['Matemáticas II', 'Física', 'Dibujo Técnico'],
      bio: 'Lleva nueve años dando Matemáticas y su obsesión es que el alumno deje de memorizar pasos y entienda por qué funcionan. Corrige los simulacros de PAU con la misma rúbrica que usan los tribunales.',
      initials: 'CN',
      accent: 'tinta'
    },
    {
      id: 'elena',
      photo: 'assets/images/profe-elena.webp',
      photoAlt: 'Elena Sanz, profesora de Química y Biología',
      name: 'Elena Sanz',
      role: 'Química y Biología',
      years: 7,
      subjects: ['Química', 'Biología', 'Física y Química ESO'],
      bio: 'Química de formación, con tres años de laboratorio antes de dedicarse a esto. Empieza cada tema preguntando qué creen los alumnos que pasa, y desde ahí desmonta lo que estaba mal aprendido.',
      initials: 'ES',
      accent: 'rojo'
    },
    {
      id: 'david',
      photo: 'assets/images/profe-david.webp',
      photoAlt: 'David Ferreras, profesor de Inglés y examinador Cambridge',
      name: 'David Ferreras',
      role: 'Inglés · Cambridge B1, B2 y C1',
      years: 11,
      subjects: ['Inglés escolar', 'Cambridge', 'Speaking'],
      bio: 'Examinador acreditado de Cambridge. Se le reconoce porque no deja hablar en español en clase ni el primer día: los alumnos protestan dos semanas y después dejan de notarlo.',
      initials: 'DF',
      accent: 'azul'
    },
    {
      id: 'nuria',
      photo: 'assets/images/profe-nuria.webp',
      photoAlt: 'Nuria Caballero, profesora de Primaria y primer ciclo de ESO',
      name: 'Nuria Caballero',
      role: 'Primaria y primer ciclo de ESO',
      years: 6,
      subjects: ['Matemáticas', 'Lengua', 'Comprensión lectora'],
      bio: 'Maestra de Primaria con mención en Audición y Lenguaje. Insiste mucho en la lectura de enunciados: la mitad de los fallos de cálculo que ve no son de cálculo.',
      initials: 'NC',
      accent: 'tinta'
    },
    {
      id: 'javier',
      photo: 'assets/images/profe-javier.webp',
      photoAlt: 'Javier Arenas, profesor de técnicas de estudio y Lengua',
      name: 'Javier Arenas',
      role: 'Técnicas de estudio y Lengua',
      years: 8,
      subjects: ['Técnicas de estudio', 'Lengua', 'Comentario de texto'],
      bio: 'Lleva el programa de organización. Su primera sesión siempre es igual: el alumno enseña su agenda real y se reconstruye desde ahí, nunca desde una plantilla.',
      initials: 'JA',
      accent: 'rojo'
    }
  ],

  /* ────────────────────────────  MÉTODO  ───────────────────────────── */
  method: [
    {
      step: '01',
      title: 'Valoración inicial',
      time: '45 minutos, sin coste',
      text: 'Una prueba corta y una conversación. Buscamos si falta base de cursos anteriores, si falla el método o si el problema aparece sólo en el examen.'
    },
    {
      step: '02',
      title: 'Plan de trabajo por escrito',
      time: 'La primera semana',
      text: 'Qué se va a recuperar, en qué orden y con qué frecuencia. La familia recibe el plan en papel. Si algo no encaja, se cambia antes de empezar.'
    },
    {
      step: '03',
      title: 'Sesiones con objetivo',
      time: 'Cada semana',
      text: 'Ninguna sesión es «traer los deberes». Cada una tiene un objetivo cerrado y termina con una comprobación de que se ha entendido.'
    },
    {
      step: '04',
      title: 'Medición y ajuste',
      time: 'Cada cuatro semanas',
      text: 'Revisamos notas, entregas y autonomía. Si el alumno ya trabaja solo, reducimos sesiones. Lo decimos aunque suponga facturar menos.'
    }
  ],

  /* ─────────────────────  SÍNTOMAS (sección problema)  ──────────────── */
  symptoms: [
    {
      quote: 'Estudia, pero los resultados no llegan.',
      note: 'Casi siempre significa que repasa lo que ya sabe y evita lo que no entiende.'
    },
    {
      quote: 'En casa lo hace y en el examen se bloquea.',
      note: 'No es un problema de contenido: es de tiempo, presión y formato de pregunta.'
    },
    {
      quote: 'Va bien hasta que llega el tema nuevo.',
      note: 'Suele haber una laguna de un curso anterior que nadie ha cerrado.'
    },
    {
      quote: 'No necesita más deberes. Necesita saber dónde falla.',
      note: 'Más horas sobre el mismo error sólo consolidan el error.'
    }
  ],

  /* ───────────────────────────  TARIFAS  ───────────────────────────── */
  /* Modelo transparente: €/hora por modalidad × factor de nivel × horas al mes. */
  pricing: {
    currency: 'EUR',
    weeksPerMonth: 4.33,
    rangeSpread: 0.06,               // ± 6 % para dar una horquilla honesta
    enrolmentFee: 0,
    modalities: [
      { id: 'grupo',      name: 'Grupo reducido',   hourly: 11.5, note: 'Máximo 6 alumnos del mismo curso y asignatura (4 en Bachillerato).' },
      { id: 'individual', name: 'Clase individual', hourly: 27,   note: 'Un profesor, un alumno. Horario flexible cada semana.' },
      { id: 'online',     name: 'Online en directo', hourly: 10.5, note: 'Grupos de 4 por videollamada, con pizarra compartida.' }
    ],
    levelFactor: { primaria: 0.92, eso: 1, bachillerato: 1.12, pau: 1.2 },
    frequencies: [
      { id: 1, label: '1 día por semana' },
      { id: 2, label: '2 días por semana' },
      { id: 3, label: '3 días por semana' }
    ],
    durations: [
      { id: 60, label: '60 minutos' },
      { id: 90, label: '90 minutos' }
    ],
    discounts: [
      { label: 'Segundo hermano', value: '−10 %' },
      { label: 'Matrícula', value: '0 €' },
      { label: 'Permanencia', value: 'Ninguna' }
    ],
    disclaimer: 'Precio orientativo calculado con nuestras tarifas públicas. No es una oferta contractual: el precio definitivo se cierra tras la valoración inicial gratuita.'
  },

  /* ────────────────  GRUPOS Y PLAZAS (herramienta extra)  ───────────── */
  schedule: {
    updatedLabel: 'Plazas actualizadas esta semana',
    slots: [
      { id: 'g1', level: 'eso',          course: '1º y 2º ESO',     subject: 'Matemáticas',     days: 'Lunes y miércoles',   time: '17:00', duration: 90, seats: 6, taken: 4 },
      { id: 'g2', level: 'eso',          course: '3º y 4º ESO',     subject: 'Matemáticas',     days: 'Martes y jueves',     time: '17:00', duration: 90, seats: 6, taken: 6 },
      { id: 'g3', level: 'eso',          course: '3º y 4º ESO',     subject: 'Física y Química', days: 'Lunes y miércoles',  time: '18:45', duration: 90, seats: 6, taken: 3 },
      { id: 'g4', level: 'bachillerato', course: '1º Bachillerato', subject: 'Matemáticas I',   days: 'Martes y jueves',     time: '18:45', duration: 90, seats: 4, taken: 2 },
      { id: 'g5', level: 'bachillerato', course: '2º Bachillerato', subject: 'Química',         days: 'Lunes y miércoles',   time: '20:15', duration: 90, seats: 4, taken: 3 },
      { id: 'g6', level: 'pau',         course: 'PAU',            subject: 'Matemáticas II',  days: 'Martes y jueves',     time: '20:15', duration: 90, seats: 6, taken: 5 },
      { id: 'g7', level: 'primaria',     course: '5º y 6º Primaria', subject: 'Refuerzo general', days: 'Lunes a jueves',     time: '17:00', duration: 60, seats: 5, taken: 2 },
      { id: 'g8', level: 'eso',          course: 'ESO y Bachillerato', subject: 'Inglés · B2',  days: 'Martes y jueves',     time: '19:00', duration: 90, seats: 6, taken: 4 }
    ]
  },

  /* ─────────────────────────  TESTIMONIOS  ─────────────────────────── */
  testimonials: [
    {
      text: 'Llegó suspendiendo Matemáticas en 2º ESO y en dos meses dejó de necesitar que le explicáramos los deberes en casa. Eso para nosotros valía más que la nota.',
      author: 'Rocío M.',
      relation: 'Madre de alumno de 2º ESO',
      initials: 'RM'
    },
    {
      text: 'Me cambiaron la forma de preparar los exámenes. Antes estudiaba tres días antes y me daba tiempo a nada; ahora hago problemas desde que empieza el tema.',
      author: 'Diego S.',
      relation: 'Alumno de 1º Bachillerato',
      initials: 'DS'
    },
    {
      text: 'Lo que más me sorprendió fue que en enero nos dijeran que podíamos bajar de tres días a dos. Ninguna academia me había propuesto cobrarme menos.',
      author: 'Juan Carlos P.',
      relation: 'Padre de alumna de 4º ESO',
      initials: 'JP'
    },
    {
      text: 'Entré en marzo con un 4 en Química de 2º y salí con un 7,1 en la PAU. Los simulacros con tiempo real fueron lo que más me ayudó.',
      author: 'Lucía A.',
      relation: 'Alumna, PAU 2025',
      initials: 'LA'
    }
  ],

  /* ──────────────────────────  PREGUNTAS  ──────────────────────────── */
  faqs: [
    {
      q: '¿Cuánto cuesta el refuerzo al mes?',
      a: 'Depende del curso, de la modalidad y de cuántos días a la semana venga el alumno. Un grupo reducido de ESO de dos tardes de 90 minutos ronda los 140–160 € al mes; dos tardes de 60 minutos, 95–105 €; y una clase individual semanal de una hora, 110–125 €. En la web hay una calculadora que da la horquilla exacta antes de escribirnos.'
    },
    {
      q: '¿Hay que pagar matrícula o firmar permanencia?',
      a: 'No. No hay matrícula ni permanencia. Se paga mes a mes y se avisa con quince días si se quiere dejar.'
    },
    {
      q: '¿Cuántos alumnos hay por grupo?',
      a: 'Máximo seis, y en Bachillerato máximo cuatro. Los grupos se forman por curso y asignatura, nunca mezclando niveles distintos en la misma mesa.'
    },
    {
      q: '¿La primera clase es gratuita?',
      a: 'La valoración inicial sí: son unos 45 minutos con una prueba corta y una conversación, sin coste ni compromiso. De ahí sale el plan de trabajo por escrito.'
    },
    {
      q: '¿Puedo apuntar a mi hijo sólo para los exámenes?',
      a: 'Sí, existen intensivos por bloques, pero somos honestos: si la base falla, dos semanas antes del examen no arreglan un trimestre. En la valoración te diremos si el intensivo tiene sentido en ese caso.'
    },
    {
      q: '¿Informáis a las familias de cómo va el alumno?',
      a: 'Cada cuatro semanas enviamos un resumen corto: qué se ha trabajado, qué ha mejorado y qué sigue pendiente. Si algo se tuerce antes, llamamos sin esperar al informe.'
    },
    {
      q: '¿Dais clase online?',
      a: 'Sí, en grupos de cuatro por videollamada con pizarra compartida, para ESO, Bachillerato e Inglés. En Primaria preferimos el presencial porque el seguimiento de la atención es distinto.'
    },
    {
      q: '¿Qué pasa si mi hijo mejora y ya no necesita venir tres días?',
      a: 'Se lo proponemos nosotros. En la revisión de las cuatro semanas, si el alumno ya trabaja solo, reducimos sesiones. Preferimos eso a mantener una cuota que ha dejado de tener sentido.'
    }
  ],

  /* ───────────────────────────  MENSAJES  ──────────────────────────── */
  messages: {
    intro: 'Hola, escribo desde la web de NEXO Academia.',
    closing: '¿Me podéis decir disponibilidad y siguiente paso? Gracias.',
    generic: 'Hola, escribo desde la web de NEXO Academia. Me gustaría información sobre las clases de refuerzo.',
    privacy: 'Las herramientas de esta web funcionan en tu navegador. Sólo se envía lo que decides mandar por WhatsApp o correo, y puedes revisarlo antes.'
  }
};

/* ══════════════════════  DIAGNÓSTICO ACADÉMICO  ══════════════════════ */
/* Cada respuesta suma puntos a uno o varios perfiles. Gana el más alto. */

ACADEMY.diagnostic = {
  intro: {
    title: '¿Qué necesita realmente el alumno?',
    lead: 'Ocho preguntas, poco más de un minuto. Al final verás qué tipo de refuerzo encaja y por qué.',
    time: '1–2 minutos'
  },

  questions: [
    {
      id: 'who',
      title: '¿Para quién haces el diagnóstico?',
      help: 'Sólo sirve para dirigirnos bien a ti después.',
      type: 'single',
      options: [
        { value: 'alumno', label: 'Para mí', hint: 'Soy el estudiante' },
        { value: 'familia', label: 'Para mi hijo o hija', hint: 'Soy padre, madre o tutor' }
      ]
    },
    {
      id: 'level',
      title: '¿En qué curso está?',
      type: 'single',
      options: [
        { value: 'primaria', label: 'Primaria', hint: '3º a 6º' },
        { value: 'eso', label: 'ESO', hint: '1º a 4º' },
        { value: 'bachillerato', label: 'Bachillerato', hint: '1º y 2º' },
        { value: 'pau', label: 'Preparando PAU', hint: '2º de Bachillerato' }
      ]
    },
    {
      id: 'subjects',
      title: '¿Qué asignaturas se le están atragantando?',
      help: 'Puedes elegir hasta tres.',
      type: 'multi',
      max: 3,
      options: [
        { value: 'Matemáticas', label: 'Matemáticas' },
        { value: 'Física', label: 'Física' },
        { value: 'Química', label: 'Química' },
        { value: 'Biología', label: 'Biología' },
        { value: 'Inglés', label: 'Inglés' },
        { value: 'Lengua', label: 'Lengua' },
        { value: 'Dibujo Técnico', label: 'Dibujo Técnico' },
        { value: 'Economía', label: 'Economía' }
      ],
      score: {
        _count3: { base: 1, metodo: 2 }
      }
    },
    {
      id: 'breaks',
      title: '¿Dónde se rompe exactamente?',
      help: 'Elige lo que más se parezca a lo que pasa.',
      type: 'single',
      options: [
        { value: 'teoria', label: 'No entiende la explicación de clase', hint: 'Se pierde desde el principio del tema', score: { base: 3 } },
        { value: 'ejercicios', label: 'Entiende la teoría pero no sabe empezar los ejercicios', hint: 'Mira el enunciado y se queda en blanco', score: { base: 2, examen: 1 } },
        { value: 'examen', label: 'Hace los ejercicios bien y luego suspende el examen', hint: 'En casa sale, en el aula no', score: { examen: 3 } },
        { value: 'tiempo', label: 'No le da tiempo, va siempre con retraso', hint: 'Acumula temas sin cerrar', score: { metodo: 3 } }
      ]
    },
    {
      id: 'grades',
      title: '¿De qué nota partes y a cuál quieres llegar?',
      help: 'Una estimación es suficiente.',
      type: 'grades'
    },
    {
      id: 'routine',
      title: '¿Con qué frecuencia estudia entre semana?',
      type: 'single',
      options: [
        { value: 'nunca', label: 'Prácticamente nunca', hint: 'Sólo la víspera del examen', score: { metodo: 3, base: 1 } },
        { value: 'examenes', label: 'Sólo cuando hay examen cerca', hint: 'A ráfagas', score: { metodo: 2, examen: 1 } },
        { value: 'sinplan', label: 'Casi todos los días, pero sin plan', hint: 'Se sienta, aunque no sabe por dónde', score: { metodo: 2, base: 1 } },
        { value: 'conplan', label: 'Todos los días y con un plan', hint: 'La rutina ya está montada', score: { base: 2, examen: 1 } }
      ]
    },
    {
      id: 'exam',
      title: '¿Cuándo es el próximo examen importante?',
      type: 'single',
      options: [
        { value: '7', label: 'Esta semana', hint: 'Menos de 7 días', score: { intensivo: 3, examen: 1 } },
        { value: '21', label: 'En dos o tres semanas', hint: 'Hay margen justo', score: { examen: 2, intensivo: 1 } },
        { value: '45', label: 'En más de un mes', hint: 'Se puede trabajar con calma', score: { base: 2, metodo: 1 } },
        { value: '0', label: 'No lo sé todavía', hint: 'Sin fecha cerrada', score: { metodo: 2 } }
      ]
    },
    {
      id: 'hours',
      title: '¿Cuántas horas puede dedicar al refuerzo cada semana?',
      help: 'Contando clases y trabajo en casa.',
      type: 'single',
      options: [
        { value: '2', label: 'Unas 2 horas', hint: 'La agenda está llena', score: { metodo: 2 } },
        { value: '3', label: 'Unas 3 horas', hint: 'Lo habitual', score: { base: 1, examen: 1 } },
        { value: '4', label: 'Unas 4 horas', hint: 'Hay margen real', score: { base: 2, examen: 1 } },
        { value: '6', label: '5 horas o más', hint: 'Prioridad absoluta ahora mismo', score: { intensivo: 2, base: 1 } }
      ]
    }
  ],

  /* Perfiles de salida */
  profiles: {
    base: {
      id: 'base',
      name: 'Refuerzo de base',
      headline: 'El problema no son las horas: faltan cimientos de cursos anteriores.',
      explain: 'Cuando la base falla, cada tema nuevo cuesta el doble y el esfuerzo no se nota en la nota. Lo primero es identificar qué contenidos concretos quedaron sin cerrar y recuperarlos en paralelo al temario actual.',
      recommendations: [
        'Prueba de nivel para localizar las lagunas exactas, no el curso entero.',
        'Recuperar los contenidos previos a la vez que se sigue el temario, sin parar el ritmo de clase.',
        'Sesiones de 90 minutos: con 60 no da tiempo a arreglar y avanzar.'
      ],
      modality: 'grupo',
      sessions: 2,
      duration: 90,
      selfWork: '2 horas de trabajo autónomo guiado'
    },
    metodo: {
      id: 'metodo',
      name: 'Método y organización',
      headline: 'Sabe más de lo que la nota refleja. Lo que falta es orden.',
      explain: 'Estudiar sin plan produce mucha sensación de esfuerzo y poco resultado. Antes de añadir horas hay que decidir qué se hace en cada una: planificación semanal, técnica de estudio y control de entregas.',
      recommendations: [
        'Programa de técnicas de estudio con Javier: planificación real, no una plantilla genérica.',
        'Una sesión semanal de asignatura + una de organización durante el primer mes.',
        'Revisión de agenda cada semana hasta que la rutina se sostenga sola.'
      ],
      modality: 'grupo',
      sessions: 2,
      duration: 60,
      selfWork: '3 horas repartidas en bloques cortos'
    },
    examen: {
      id: 'examen',
      name: 'Práctica y preparación de exámenes',
      headline: 'El contenido está. Lo que falla es el examen.',
      explain: 'Entender un tema y resolverlo con reloj son dos habilidades distintas. Se entrena con problemas tipo, tiempos reales y corrección con criterio de examinador, hasta que el formato deja de sorprender.',
      recommendations: [
        'Bloques de problemas tipo examen en lugar de más teoría.',
        'Simulacros cronometrados y corrección comentada del error, no sólo de la nota.',
        'Trabajo específico de gestión del tiempo y de orden en la hoja de respuesta.'
      ],
      modality: 'grupo',
      sessions: 2,
      duration: 90,
      selfWork: '2 horas de problemas resueltos sin apuntes'
    },
    intensivo: {
      id: 'intensivo',
      name: 'Refuerzo intensivo',
      headline: 'Hay poco margen. Toca priorizar y no abarcar todo.',
      explain: 'Con un examen encima no se puede repasar el temario completo. Se elige lo que más puntúa y lo que más se repite, se practica con modelos y se deja fuera lo accesorio. Es una decisión deliberada, no un atajo.',
      recommendations: [
        'Sesiones individuales los primeros días para ir directos a lo que más pesa.',
        'Plan diario cerrado hasta la fecha del examen, con un simulacro 48 horas antes.',
        'Después del examen, valorar si conviene pasar a grupo reducido para no repetir la situación.'
      ],
      modality: 'individual',
      sessions: 3,
      duration: 60,
      selfWork: '4 horas con plan diario cerrado'
    }
  },

  order: ['intensivo', 'base', 'examen', 'metodo']
};

/* ══════════════════════════  PLANIFICADOR  ═══════════════════════════ */

ACADEMY.planner = {
  blockMinutes: 45,
  shortBreak: 15,
  startTimes: { tarde: '17:00', noche: '19:00' },
  dayNames: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
  difficultyWeight: { baja: 1, media: 1.6, alta: 2.4 },
  urgencyWeight: { 7: 2.2, 14: 1.6, 30: 1.2, 0: 1 },
  advice: {
    few: 'Con menos de tres bloques a la semana conviene concentrarse en una sola asignatura. Repartir poco entre muchas no deja huella.',
    many: 'Con esta carga, deja siempre un día sin bloques. Descansar también consolida.',
    balanced: 'Alterna asignaturas dentro del mismo día sólo si hay descanso entre bloques: encadenar dos bloques de lo mismo rinde menos.'
  }
};

/* ═══════════════════════  PLAN DE EXAMEN (X días)  ═══════════════════ */

ACADEMY.examPlan = {
  phases: [
    { id: 'base',      name: 'Conceptos base',        share: 0.28, detail: 'Releer apuntes con la teoría delante y escribir en una hoja lo que no entiendes. Esa hoja es el plan de los días siguientes.' },
    { id: 'practica',  name: 'Ejercicios guiados',    share: 0.3,  detail: 'Ejercicios con la teoría a mano. El objetivo no es acertar, es reconocer el tipo de problema.' },
    { id: 'tipo',      name: 'Problemas tipo examen', share: 0.24, detail: 'Exámenes de otros años o problemas del final del tema, ya sin apuntes delante.' },
    { id: 'simulacro', name: 'Simulacro cronometrado', share: 0.1, detail: 'Un examen completo con reloj y sin pausas. Corregirlo al día siguiente, no en caliente.' },
    { id: 'repaso',    name: 'Repaso ligero',          share: 0.08, detail: 'Sólo los fallos del simulacro y las fórmulas. Nada nuevo. Dormir bien pesa más que dos horas extra.' }
  ],
  minDays: 2,
  maxDays: 60,
  note: 'Este plan es una guía de organización. No garantiza una nota: eso depende del punto de partida y del trabajo real de cada día.'
};

/* ═══════════════════════  GRUPO O INDIVIDUAL  ════════════════════════ */

ACADEMY.modalityQuiz = {
  questions: [
    {
      id: 'scope',
      title: '¿El problema es de una asignatura concreta o general?',
      options: [
        { value: 'una', label: 'Una asignatura concreta', score: { individual: 1, grupo: 1 } },
        { value: 'varias', label: 'Dos o tres asignaturas', score: { grupo: 2 } },
        { value: 'general', label: 'Es general, va mal en casi todo', score: { individual: 2 } }
      ]
    },
    {
      id: 'urgency',
      title: '¿Hay que recuperar contenidos con prisa?',
      options: [
        { value: 'si', label: 'Sí, hay poco margen', score: { individual: 2 } },
        { value: 'algo', label: 'Algo, pero se puede planificar', score: { grupo: 1, individual: 1 } },
        { value: 'no', label: 'No, es trabajo de fondo', score: { grupo: 2 } }
      ]
    },
    {
      id: 'company',
      title: '¿Cómo trabaja mejor con otros alumnos delante?',
      options: [
        { value: 'bien', label: 'Se motiva, le viene bien el ritmo del grupo', score: { grupo: 2 } },
        { value: 'igual', label: 'Le da bastante igual', score: { grupo: 1 } },
        { value: 'mal', label: 'Se corta y no pregunta', score: { individual: 2 } }
      ]
    },
    {
      id: 'schedule',
      title: '¿Cómo es su horario por las tardes?',
      options: [
        { value: 'fijo', label: 'Estable, puede venir siempre los mismos días', score: { grupo: 2 } },
        { value: 'variable', label: 'Cambia según la semana', score: { individual: 2 } },
        { value: 'muyjusto', label: 'Muy justo, apenas hay huecos', score: { individual: 1, grupo: 1 } }
      ]
    },
    {
      id: 'budget',
      title: '¿El presupuesto es un factor importante?',
      options: [
        { value: 'si', label: 'Sí, bastante', score: { grupo: 2 } },
        { value: 'algo', label: 'Cuenta, pero no es lo primero', score: { grupo: 1 } },
        { value: 'no', label: 'No es determinante', score: { individual: 1 } }
      ]
    }
  ],
  results: {
    grupo: {
      name: 'Grupo reducido',
      headline: 'El grupo reducido encaja mejor en vuestro caso.',
      why: [
        'Hay continuidad y no urgencia: el trabajo de fondo funciona bien con un ritmo semanal fijo.',
        'Escuchar las dudas de otros alumnos del mismo curso añade repasos que no habrías buscado.',
        'Cuesta menos de la mitad que la clase individual con la misma frecuencia.'
      ],
      caveat: 'Si en seis u ocho semanas no hay movimiento, conviene revisar si hace falta una fase individual corta.'
    },
    individual: {
      name: 'Clase individual',
      headline: 'La clase individual encaja mejor en vuestro caso.',
      why: [
        'Hay una dificultad concreta o prisa real: ir directo al punto ahorra semanas.',
        'El horario cambia demasiado para encajar en un grupo fijo.',
        'Permite hablar sin público, que es justo lo que necesita quien no pregunta en clase.'
      ],
      caveat: 'No tiene por qué ser para siempre. Muchos alumnos empiezan individual seis semanas y luego pasan a grupo, que sale bastante más barato.'
    },
    mixto: {
      name: 'Empezar mixto',
      headline: 'Vuestro caso está entre las dos opciones.',
      why: [
        'Hay indicadores claros de las dos modalidades, así que forzar una sola sería arbitrario.',
        'La fórmula habitual es empezar con una sesión individual y una de grupo a la semana.',
        'Tras cuatro semanas se ve con datos cuál de las dos está funcionando y se elimina la otra.'
      ],
      caveat: 'Esta combinación cuesta menos que dos individuales y más que dos de grupo. La valoración inicial suele deshacer el empate.'
    }
  }
};

/* ═══════════════  SOLICITUD DE CLASE DE PRUEBA (pasos)  ══════════════ */

ACADEMY.request = {
  steps: [
    {
      id: 'for',
      title: '¿Para quién es la clase?',
      options: [
        { value: 'Para mí', label: 'Para mí' },
        { value: 'Para mi hijo/a', label: 'Para mi hijo o hija' }
      ]
    },
    {
      id: 'course',
      title: '¿Qué curso?',
      options: []   // se rellena desde ACADEMY.levels
    },
    {
      id: 'subject',
      title: '¿Qué asignatura?',
      options: []   // se rellena desde ACADEMY.subjects
    },
    {
      id: 'problem',
      title: '¿Cuál es el problema principal?',
      options: [
        { value: 'No entiende la explicación de clase', label: 'No entiende la explicación de clase' },
        { value: 'Se atasca al empezar los ejercicios', label: 'Se atasca al empezar los ejercicios' },
        { value: 'Suspende los exámenes aunque estudia', label: 'Suspende los exámenes aunque estudia' },
        { value: 'No se organiza y va con retraso', label: 'No se organiza y va con retraso' },
        { value: 'Quiere subir nota para el acceso', label: 'Quiere subir nota para el acceso' }
      ]
    },
    {
      id: 'modality',
      title: '¿Preferencia de modalidad?',
      options: [
        { value: 'Grupo reducido', label: 'Grupo reducido' },
        { value: 'Individual', label: 'Individual' },
        { value: 'Online', label: 'Online' },
        { value: 'Indiferente', label: 'Indiferente, que lo valoréis vosotros' }
      ]
    },
    {
      id: 'when',
      title: '¿Qué franja os viene mejor?',
      options: [
        { value: 'Tarde temprano (16:00–18:00)', label: 'Tarde temprano', hint: '16:00 – 18:00' },
        { value: 'Tarde (18:00–20:00)', label: 'Tarde', hint: '18:00 – 20:00' },
        { value: 'Última hora (20:00–21:30)', label: 'Última hora', hint: '20:00 – 21:30' },
        { value: 'Flexible', label: 'Somos flexibles' }
      ]
    }
  ]
};

/* ═════════════════════════  HUB DE HERRAMIENTAS  ═════════════════════ */

ACADEMY.tools = [
  {
    id: 'diagnostico',
    name: 'Diagnóstico académico',
    claim: 'Descubre qué tipo de refuerzo necesitas de verdad.',
    detail: 'Ocho preguntas sobre curso, asignaturas y dónde se rompe el estudio. Devuelve un perfil, una recomendación de modalidad y un plan de partida.',
    time: '1–2 min',
    href: 'diagnostico.html',
    featured: true
  },
  {
    id: 'nota',
    name: 'Calculadora de nota final',
    claim: '¿Qué te hace falta para llegar a tu nota?',
    detail: 'Con los porcentajes reales de tu asignatura: exámenes, trabajos, proyectos y actitud. Pones lo que ya tienes y te dice qué necesitas en lo que queda.',
    time: '1 min',
    href: 'herramientas.html#nota'
  },
  {
    id: 'planner',
    name: 'Planificador semanal',
    claim: 'Organiza tus horas de estudio.',
    detail: 'Reparte las horas disponibles entre asignaturas según dificultad y proximidad del examen. Se puede imprimir.',
    time: '1 min',
    href: 'herramientas.html#planner'
  },
  {
    id: 'examen',
    name: 'Plan de examen',
    claim: 'Tengo examen en X días. ¿Por dónde empiezo?',
    detail: 'Convierte los días que quedan en fases: base, ejercicios, problemas tipo, simulacro y repaso.',
    time: '30 s',
    href: 'herramientas.html#examen'
  },
  {
    id: 'precio',
    name: 'Calculadora de precio',
    claim: 'Calcula cuánto costaría el refuerzo.',
    detail: 'Curso, asignatura, modalidad, frecuencia y duración. Devuelve una horquilla orientativa con nuestras tarifas públicas.',
    time: '30 s',
    href: 'herramientas.html#precio'
  },
  {
    id: 'modalidad',
    name: 'Grupo o individual',
    claim: 'Descubre qué modalidad encaja contigo.',
    detail: 'Cinco preguntas. Si la respuesta honesta es el grupo reducido, que es la opción más barata, eso es lo que dice.',
    time: '40 s',
    href: 'herramientas.html#modalidad'
  },
  {
    id: 'plazas',
    name: 'Horarios y plazas',
    claim: 'Mira qué grupos tienen sitio esta semana.',
    detail: 'Los grupos abiertos con sus días, su hora y las plazas que quedan. Al elegir uno, el mensaje de WhatsApp ya va con ese grupo dentro.',
    time: '15 s',
    href: 'herramientas.html#plazas'
  }
];

/* ═══════════  CALCULADORA DE NOTA POR CRITERIOS DE EVALUACIÓN  ═══════════ */
/* En la ESO y en Bachillerato casi nunca puntúan sólo los exámenes: hay
   trabajos, proyectos, cuaderno y actitud. La herramienta parte de eso. */

ACADEMY.gradeCalculator = {
  maxItems: 8,

  presets: [
    {
      id: 'estandar',
      name: 'Reparto habitual',
      hint: '60 / 30 / 10',
      items: [
        { name: 'Exámenes', weight: 60 },
        { name: 'Trabajos y proyectos', weight: 30 },
        { name: 'Actitud y participación', weight: 10 }
      ]
    },
    {
      id: 'examenes',
      name: 'Dos exámenes',
      hint: 'Típico de Bachillerato',
      items: [
        { name: 'Primer examen', weight: 35 },
        { name: 'Segundo examen', weight: 45 },
        { name: 'Trabajos y entregas', weight: 20 }
      ]
    },
    {
      id: 'continua',
      name: 'Evaluación continua',
      hint: 'Mucha entrega pequeña',
      items: [
        { name: 'Pruebas cortas', weight: 35 },
        { name: 'Proyecto del trimestre', weight: 30 },
        { name: 'Cuaderno y entregas', weight: 25 },
        { name: 'Participación', weight: 10 }
      ]
    }
  ],

  help: 'Los porcentajes salen de los criterios de evaluación de tu asignatura. Suelen estar en la programación del departamento o los tiene tu profesor.',
  note: 'Cálculo orientativo. Cada centro aplica sus propios criterios, y algunos exigen además una nota mínima en los exámenes para poder hacer media.'
};

/* ══════════════════════════  RECURSOS (BLOG)  ═══════════════════════════ */
/* El índice, los enlaces relacionados y el teaser de la portada se generan
   desde aquí. El texto de cada artículo vive en su propio HTML, que es más
   cómodo de escribir y de corregir que una cadena dentro de un objeto. */

ACADEMY.articles = [
  {
    slug: 'mi-hijo-estudia-pero-suspende',
    title: 'Mi hijo estudia pero suspende: por dónde empezar',
    excerpt: 'Cuando el esfuerzo no aparece en la nota, el problema casi nunca es la cantidad de horas. Estas son las cuatro causas que vemos, y cómo distinguirlas en casa.',
    date: '2026-09-08',
    dateText: '8 de septiembre de 2026',
    minutes: 6,
    tag: 'Para familias',
    author: 'marta',
    image: 'art-suspende',
    imageAlt: 'Estudiante con la cabeza apoyada en la mano frente a sus apuntes',
    tool: { label: 'Haz el diagnóstico', href: 'diagnostico.html' }
  },
  {
    slug: 'estudiar-para-un-examen-en-una-semana',
    title: 'Cómo estudiar para un examen en una semana',
    excerpt: 'Siete días dan para bastante más de lo que parece, si se reparten bien. El reparto que usamos en la academia, día a día, y los tres errores que lo tiran todo abajo.',
    date: '2026-09-02',
    dateText: '2 de septiembre de 2026',
    minutes: 7,
    tag: 'Para alumnos',
    author: 'javier',
    image: 'art-examen',
    imageAlt: 'Alumno concentrado leyendo sus apuntes sobre la mesa',
    tool: { label: 'Montar mi plan de examen', href: 'herramientas.html#examen' }
  },
  {
    slug: 'nota-de-acceso-pau-madrid',
    title: 'Cómo se calcula la nota de acceso a la universidad',
    excerpt: 'Bachillerato pesa el 60 %, la PAU el 40 %, y luego están las ponderaciones. Explicado con un ejemplo real y sin la jerga de las guías oficiales.',
    date: '2026-08-26',
    dateText: '26 de agosto de 2026',
    minutes: 8,
    tag: 'PAU',
    author: 'carlos',
    image: 'art-pau',
    imageAlt: 'Aula universitaria con pupitres preparados para un examen',
    tool: { label: 'Calcular qué nota necesito', href: 'herramientas.html#nota' }
  },
  {
    slug: 'cuanto-cuesta-una-academia-en-madrid',
    title: 'Cuánto cuesta una academia de refuerzo en Madrid',
    excerpt: 'Precios reales de 2026 por modalidad, qué suele estar incluido y las cinco preguntas que conviene hacer antes de apuntar a nadie.',
    date: '2026-08-19',
    dateText: '19 de agosto de 2026',
    minutes: 5,
    tag: 'Para familias',
    author: 'marta',
    image: 'art-precio',
    imageAlt: 'Agenda abierta sobre un escritorio de madera',
    tool: { label: 'Ver nuestros precios', href: 'precios.html' }
  }
];
