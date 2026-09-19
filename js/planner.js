/**
 * planner.js — «Organiza tu semana».
 *
 * Reparte las horas disponibles entre asignaturas con una lógica
 * determinista: prioridad = dificultad × proximidad del examen.
 * Sin aleatoriedad: el mismo dato produce siempre el mismo plan.
 */

(() => {
  'use strict';

  const host = document.querySelector('[data-tool="planner"]');
  if (!host) return;

  const { el, field, iconSvg, segmented } = NX;
  const CFG = ACADEMY.planner;

  const DAYS = [
    { id: 0, name: 'Lunes', short: 'L' },
    { id: 1, name: 'Martes', short: 'M' },
    { id: 2, name: 'Miércoles', short: 'X' },
    { id: 3, name: 'Jueves', short: 'J' },
    { id: 4, name: 'Viernes', short: 'V' },
    { id: 5, name: 'Sábado', short: 'S' },
    { id: 6, name: 'Domingo', short: 'D' }
  ];

  const URGENCY = [
    { value: 7,  label: 'Esta semana' },
    { value: 14, label: 'En 2 semanas' },
    { value: 30, label: 'Este mes' },
    { value: 0,  label: 'Sin fecha' }
  ];

  const TASKS = {
    alta:  ['Teoría y dudas por escrito', 'Ejercicios guiados', 'Problemas tipo examen', 'Corregir los fallos'],
    media: ['Ejercicios del tema', 'Problemas tipo examen', 'Repaso activo', 'Corregir los fallos'],
    baja:  ['Repaso activo', 'Ejercicios del tema', 'Problemas tipo examen', 'Lectura y esquema']
  };

  let userDriven = false;
  const change = () => { userDriven = true; render(); };

  const state = {
    levelId: 'eso',
    course: '3º ESO',
    subjects: [{ name: 'Matemáticas', difficulty: 'alta', exam: 14 }],
    days: [0, 1, 2, 3],
    hours: 4,
    start: 'tarde'
  };

  /* ──────────────────────────  CONTROLES  ──────────────────────────── */

  const courseSelect = el('select', { class: 'select' }, ACADEMY.levels.map((level) =>
    el('optgroup', { label: level.name }, level.courses.map((course) =>
      el('option', { value: `${level.id}|${course}`, selected: course === state.course }, [course])
    ))
  ));
  courseSelect.addEventListener('change', () => {
    const [levelId, course] = courseSelect.value.split('|');
    state.levelId = levelId;
    state.course = course;
    change();
  });

  const subjectPicker = NX.optionList('planner-subject',
    ACADEMY.subjects.map((s) => ({ value: s.name, label: s.name })),
    {
      type: 'checkbox',
      values: state.subjects.map((s) => s.name),
      className: 'options--grid',
      onChange: (picked) => {
        const limited = picked.slice(0, 4);
        state.subjects = limited.map((name) =>
          state.subjects.find((s) => s.name === name) || { name, difficulty: 'media', exam: 14 });
        if (picked.length > 4) {
          NX.$$('input[name="planner-subject"]', subjectPicker).forEach((input) => {
            if (!limited.includes(input.value)) input.checked = false;
          });
          NX.toast('Máximo cuatro asignaturas: con más, el plan deja de ser realista.');
        }
        renderSubjectSettings();
        change();
      }
    });

  const subjectSettings = el('div', { class: 'stack', 'data-subject-settings': '' });

  const dayPicker = NX.optionList('planner-day',
    DAYS.map((d) => ({ value: d.id, label: d.name })),
    {
      type: 'checkbox',
      values: state.days,
      className: 'options--grid',
      onChange: (picked) => { state.days = picked.map(Number).sort((a, b) => a - b); change(); }
    });

  const hoursOut = el('span', { class: 'slider-row__value' });
  const hoursInput = el('input', { type: 'range', min: 1, max: 10, step: 1, value: state.hours, id: 'planner-hours' });
  hoursInput.addEventListener('input', () => {
    state.hours = Number(hoursInput.value);
    hoursOut.textContent = `${state.hours} h`;
    change();
  });
  hoursOut.textContent = `${state.hours} h`;

  const startGroup = segmented('planner-start', [
    { value: 'tarde', label: `Empezar a las ${CFG.startTimes.tarde}` },
    { value: 'noche', label: `Empezar a las ${CFG.startTimes.noche}` }
  ], { value: state.start, legend: 'Hora de inicio', onChange: (v) => { state.start = v; change(); } });

  /* ──────────────────────────  SALIDA  ─────────────────────────────── */

  const week = el('div', { class: 'week', 'data-week': '' });
  const summary = el('div', { class: 'note', 'data-summary': '' });
  const empty = el('p', { class: 'snapshot__empty', 'data-empty': '', hidden: true });

  const printBtn = el('button', {
    type: 'button', class: 'btn btn--ghost no-print',
    html: `${iconSvg('print')}<span class="btn__label">Imprimir o guardar en PDF</span>`
  });
  printBtn.addEventListener('click', () => window.print());

  const cta = el('a', {
    class: 'btn no-print', target: '_blank', rel: 'noopener',
    html: `${iconSvg('wa')}<span class="btn__label">Quiero ayuda para organizarme</span>`
  });

  /* Los controles ocupan una banda y la semana, la página entera: en
     escritorio una rejilla de siete días no cabe en media columna. */
  host.append(
    el('div', { class: 'planner-controls' }, [
      el('div', { class: 'stack' }, [
        field('Curso', courseSelect),
        el('div', { class: 'slider-row' }, [
          el('div', { class: 'slider-row__top' }, [
            el('label', { for: 'planner-hours', text: 'Horas a la semana', style: 'font-size:var(--step--1);font-weight:500' }),
            hoursOut
          ]),
          hoursInput
        ]),
        el('fieldset', { class: 'field' }, [
          el('legend', { class: 'field-legend', text: 'Hora de inicio' }),
          startGroup
        ])
      ]),

      el('div', { class: 'planner-controls__subjects stack' }, [
        el('fieldset', { class: 'field' }, [
          el('legend', { class: 'field-legend', text: 'Asignaturas' }),
          el('p', { class: 'field__help', text: 'Hasta cuatro. Debajo ajustas dificultad y fecha del examen.' }),
          subjectPicker
        ]),
        subjectSettings
      ]),

      el('div', { class: 'stack' }, [
        el('fieldset', { class: 'field' }, [
          el('legend', { class: 'field-legend', text: 'Días disponibles' }),
          dayPicker
        ])
      ])
    ]),

    el('div', { class: 'planner-output' }, [
      el('div', { class: 'planner-output__head' }, [
        el('h3', { style: 'font-size:var(--step-2)', text: 'Tu semana' }),
        el('div', { style: 'display:flex;flex-wrap:wrap;gap:.5rem' }, [printBtn, cta])
      ]),
      empty, week, summary
    ])
  );
  host.classList.add('tool__body--planner');

  /* ───────────────  AJUSTES POR ASIGNATURA (dificultad)  ───────────── */

  function renderSubjectSettings() {
    if (!state.subjects.length) { subjectSettings.replaceChildren(); return; }

    subjectSettings.replaceChildren(...state.subjects.map((subject) => {
      const diff = segmented(`diff-${slug(subject.name)}`, [
        { value: 'baja', label: 'Le va bien' },
        { value: 'media', label: 'Regular' },
        { value: 'alta', label: 'Le cuesta' }
      ], {
        value: subject.difficulty,
        legend: `Dificultad de ${subject.name}`,
        onChange: (v) => { subject.difficulty = v; change(); }
      });

      const exam = NX.select(URGENCY.map((u) => ({ value: u.value, label: u.label })), {
        value: subject.exam,
        onChange: (v) => { subject.exam = Number(v); change(); }
      });
      exam.setAttribute('aria-label', `Próximo examen de ${subject.name}`);

      return el('fieldset', { class: 'field' }, [
        el('legend', { class: 'field-legend', text: subject.name }),
        el('div', { style: 'display:grid;gap:.5rem' }, [diff, exam])
      ]);
    }));
  }

  /* Nombre técnico para los grupos de radio: sólo ASCII, sin marcas diacríticas. */
  const slug = (str) => Array.from(str.toLowerCase().normalize('NFD'))
    .filter((char) => /[a-z0-9]/.test(char))
    .join('');

  /* ───────────────────────────  REPARTO  ───────────────────────────── */

  /** Reparto proporcional por resto mayor: sin decimales perdidos ni sesgo. */
  function allocate(totalBlocks, weights) {
    const sum = weights.reduce((a, b) => a + b, 0);
    if (!sum) return weights.map(() => 0);

    const exact = weights.map((w) => (w / sum) * totalBlocks);
    const base = exact.map(Math.floor);
    let left = totalBlocks - base.reduce((a, b) => a + b, 0);

    const order = exact
      .map((value, i) => ({ i, frac: value - Math.floor(value) }))
      .sort((a, b) => b.frac - a.frac);

    for (let k = 0; left > 0; k++, left--) base[order[k % order.length].i]++;
    return base;
  }

  function buildPlan() {
    const days = state.days.length ? state.days : [0, 1, 2, 3];
    const totalBlocks = Math.max(1, Math.round((state.hours * 60) / CFG.blockMinutes));
    const maxPerDay = Math.min(3, Math.max(1, Math.ceil(totalBlocks / days.length)));
    const capped = Math.min(totalBlocks, maxPerDay * days.length);

    const weights = state.subjects.map((s) =>
      (CFG.difficultyWeight[s.difficulty] || 1) * (CFG.urgencyWeight[s.exam] || 1));

    const counts = allocate(capped, weights);

    /* Cola ordenada por prioridad: lo urgente cae en los primeros días. */
    const queue = [];
    const pending = state.subjects.map((s, i) => ({ ...s, left: counts[i], weight: weights[i], done: 0 }));
    while (pending.some((p) => p.left > 0)) {
      pending
        .filter((p) => p.left > 0)
        .sort((a, b) => (b.weight / (b.done + 1)) - (a.weight / (a.done + 1)))
        .slice(0, 1)
        .forEach((p) => { queue.push(p); p.left--; p.done++; });
    }

    /* Se reparte por días evitando repetir asignatura de forma consecutiva. */
    const plan = days.map((id) => ({ id, name: DAYS[id].name, blocks: [] }));
    let cursor = 0;

    queue.forEach((item) => {
      let placed = false;
      for (let attempt = 0; attempt < plan.length && !placed; attempt++) {
        const day = plan[(cursor + attempt) % plan.length];
        const last = day.blocks[day.blocks.length - 1];
        if (day.blocks.length >= maxPerDay) continue;
        /* Evitar dos bloques seguidos de lo mismo sólo tiene sentido con varias asignaturas. */
        if (last && last.name === item.name && plan.length > 1 && state.subjects.length > 1 && attempt === 0) continue;
        day.blocks.push({ name: item.name, difficulty: item.difficulty, exam: item.exam });
        placed = true;
        cursor = (cursor + attempt + 1) % plan.length;
      }
      if (!placed) {
        const day = plan.reduce((a, b) => (a.blocks.length <= b.blocks.length ? a : b));
        day.blocks.push({ name: item.name, difficulty: item.difficulty, exam: item.exam });
      }
    });

    /* Horas y tarea concreta de cada bloque. */
    const [h0, m0] = CFG.startTimes[state.start].split(':').map(Number);
    plan.forEach((day) => {
      let minutes = h0 * 60 + m0;
      const seen = {};
      day.blocks.forEach((block) => {
        block.from = toTime(minutes);
        minutes += CFG.blockMinutes;
        block.to = toTime(minutes);
        minutes += CFG.shortBreak;
        const pool = TASKS[block.difficulty] || TASKS.media;
        seen[block.name] = (seen[block.name] || 0);
        const index = block.exam && block.exam <= 7
          ? Math.min(pool.length - 1, seen[block.name] + 2)
          : seen[block.name];
        block.task = pool[index % pool.length];
        seen[block.name]++;
      });
    });

    return { plan, days, totalBlocks: capped, maxPerDay };
  }

  const toTime = (minutes) =>
    `${String(Math.floor(minutes / 60) % 24).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;

  /* ────────────────────────────  PINTADO  ──────────────────────────── */

  function render() {
    if (!state.subjects.length) {
      week.replaceChildren();
      summary.hidden = true;
      empty.hidden = false;
      empty.textContent = 'Elige al menos una asignatura para generar el plan.';
      cta.hidden = true;
      printBtn.hidden = true;
      return;
    }

    empty.hidden = true;
    summary.hidden = false;
    cta.hidden = false;
    printBtn.hidden = false;

    const { plan, totalBlocks } = buildPlan();

    week.replaceChildren(...plan.map((day) => el('article', { class: 'day' }, [
      el('header', { class: 'day__head' }, [
        el('h4', { class: 'day__name', text: day.name }),
        el('span', { class: 'day__total', text: `${NX.decimal(day.blocks.length * CFG.blockMinutes / 60, 1)} h` })
      ]),
      el('div', { class: 'day__list' }, day.blocks.length
        ? day.blocks.map((block) => el('div', { class: 'block', 'data-tone': block.difficulty }, [
            el('span', { class: 'block__time', title: `${block.from} a ${block.to}`, text: block.from }),
            el('span', { class: 'block__subject', text: block.name }),
            el('span', { class: 'block__task', text: block.task })
          ]))
        : [el('p', { text: 'Día libre. Descansar también consolida.' })])
    ])));

    const hoursText = `${NX.decimal(totalBlocks * CFG.blockMinutes / 60, 1)} h en ${plan.filter((d) => d.blocks.length).length} días`;
    const advice = totalBlocks <= 3 ? CFG.advice.few
      : totalBlocks >= 10 ? CFG.advice.many
      : CFG.advice.balanced;

    const leyenda = state.subjects.some((s) => s.difficulty === 'alta')
      ? ' Lo subrayado en rojo es lo que más cuesta.'
      : '';
    summary.innerHTML = `${iconSvg('info')}<p>${NX.esc(`Bloques de ${CFG.blockMinutes} minutos con ${CFG.shortBreak} de descanso.${leyenda} ${advice}`)}</p>`;

    const planText = plan
      .filter((d) => d.blocks.length)
      .map((d) => `${d.name}: ${d.blocks.map((b) => `${b.from} ${b.name}`).join(', ')}`)
      .join(' | ');

    const urgent = state.subjects.filter((s) => s.exam === 7).map((s) => s.name);

    if (!userDriven) return;
    NX.Snapshot.merge({
      level: state.levelId,
      levelId: state.levelId,
      course: state.course,
      subjects: state.subjects.map((s) => s.name),
      subjectsText: NX.list(state.subjects.map((s) =>
        `${s.name} (${s.difficulty === 'alta' ? 'le cuesta' : s.difficulty === 'baja' ? 'le va bien' : 'regular'})`)),
      hoursPerWeek: state.hours,
      hoursText,
      planText,
      examText: urgent.length ? `${NX.list(urgent)} esta semana` : undefined
    });
  }

  NX.bindWhatsApp(cta, () => NX.buildWhatsAppMessage({
    intro: 'He generado un plan semanal en vuestra web pero me cuesta cumplirlo. ¿Me ayudáis a organizarme?',
    rows: window.NXFicha ? window.NXFicha.rows(NX.Snapshot.get()) : []
  }));

  renderSubjectSettings();
  render();
})();
