/**
 * tools.js — Herramientas cortas:
 *   · Plan de examen en X días
 *   · Grupo o individual
 *   · Horarios y plazas libres
 *   · Solicitud de clase de prueba (asistente de contacto)
 */

/* ═════════════════════  PLAN «TENGO EXAMEN EN X DÍAS»  ══════════════ */

(() => {
  'use strict';

  const host = document.querySelector('[data-tool="examen"]');
  if (!host) return;

  const { el, field, iconSvg, segmented, numberInput } = NX;
  const CFG = ACADEMY.examPlan;

  const state = { days: 12, subject: 'Matemáticas', difficulty: 'media', hoursPerDay: 1.5 };

  const daysInput = numberInput({
    value: state.days, min: CFG.minDays, max: CFG.maxDays, step: 1, inputmode: 'numeric',
    onInput: (v) => update({ days: Number(v) })
  });
  const daysField = field('¿Cuántos días faltan para el examen?', daysInput, {
    help: `Entre ${CFG.minDays} y ${CFG.maxDays} días.`
  });

  const subjectSelect = NX.select(
    ACADEMY.subjects.map((s) => ({ value: s.name, label: s.name })),
    { value: state.subject, onChange: (v) => update({ subject: v }) }
  );

  const difficultyGroup = segmented('examen-dificultad', [
    { value: 'baja', label: 'La llevo bien' },
    { value: 'media', label: 'Regular' },
    { value: 'alta', label: 'Voy muy justo' }
  ], { value: state.difficulty, legend: 'Cómo llevas la asignatura', onChange: (v) => update({ difficulty: v }) });

  const hoursGroup = segmented('examen-horas', [
    { value: 1, label: '1 h' },
    { value: 1.5, label: '1 h 30' },
    { value: 2, label: '2 h' },
    { value: 3, label: '3 h' }
  ], { value: state.hoursPerDay, legend: 'Horas al día', onChange: (v) => update({ hoursPerDay: Number(v) }) });

  const phases = el('div', { class: 'phases', 'data-phases': '' });
  const totals = el('div', { class: 'note', 'data-totals': '' });
  const disclaimer = el('div', { class: 'note' }, [
    el('span', { html: iconSvg('info') }),
    el('p', { text: CFG.note })
  ]);

  const printBtn = el('button', {
    type: 'button', class: 'btn btn--ghost no-print',
    html: `${iconSvg('print')}<span class="btn__label">Imprimir el plan</span>`
  });
  printBtn.addEventListener('click', () => window.print());

  const cta = el('a', {
    class: 'btn no-print', target: '_blank', rel: 'noopener',
    html: `${iconSvg('wa')}<span class="btn__label">¿Lo hacemos juntos?</span>`
  });

  host.append(
    el('div', { class: 'stack' }, [
      daysField,
      field('Asignatura', subjectSelect),
      el('fieldset', { class: 'field' }, [el('legend', { class: 'field-legend', text: 'Cómo llevas la asignatura' }), difficultyGroup]),
      el('fieldset', { class: 'field' }, [el('legend', { class: 'field-legend', text: 'Horas que puedes dedicar cada día' }), hoursGroup])
    ]),
    el('div', { class: 'stack' }, [
      el('h3', { style: 'font-size:var(--step-1)', 'data-plan-title': '' }),
      phases, totals, disclaimer,
      el('div', { style: 'display:flex;flex-wrap:wrap;gap:.5rem' }, [printBtn, cta])
    ])
  );
  host.classList.add('tool__body--split');

  /** Reparte los días entre fases respetando mínimos y sin perder días. */
  function distribute(days) {
    const simulacro = days >= 30 ? 2 : days >= 5 ? 1 : 0;
    const repaso = days >= 3 ? 1 : 0;
    const working = CFG.phases.filter((p) => p.id !== 'simulacro' && p.id !== 'repaso');
    const available = days - simulacro - repaso;

    const shareSum = working.reduce((a, p) => a + p.share, 0);
    const exact = working.map((p) => (p.share / shareSum) * available);
    const counts = exact.map(Math.floor);
    let left = available - counts.reduce((a, b) => a + b, 0);

    exact
      .map((value, i) => ({ i, frac: value - Math.floor(value) }))
      .sort((a, b) => b.frac - a.frac)
      .forEach((entry) => { if (left-- > 0) counts[entry.i]++; });

    /* Cuando el examen está encima, la teoría cede sitio a los problemas. */
    if (days <= 5 && counts[0] > 1) {
      const move = counts[0] - 1;
      counts[0] -= move;
      counts[2] += move;
    }
    /* Con cuatro días o menos, siempre cae al menos un día de problemas tipo examen. */
    if (days <= 4 && counts[2] === 0) {
      const from = counts[0] > 0 ? 0 : 1;
      if (counts[from] > 0) { counts[from] -= 1; counts[2] += 1; }
    }

    const result = [];
    working.forEach((phase, i) => { if (counts[i] > 0) result.push({ ...phase, days: counts[i] }); });
    if (simulacro) result.push({ ...CFG.phases.find((p) => p.id === 'simulacro'), days: simulacro });
    if (repaso) result.push({ ...CFG.phases.find((p) => p.id === 'repaso'), days: 1 });

    return result;
  }

  function update(patch) {
    const userDriven = patch !== undefined;
    Object.assign(state, patch || {});

    const days = Math.round(state.days);
    if (!Number.isFinite(days) || days < CFG.minDays || days > CFG.maxDays) {
      daysField.setError(`Escribe un número de días entre ${CFG.minDays} y ${CFG.maxDays}.`);
      phases.replaceChildren();
      totals.hidden = true;
      return;
    }
    daysField.setError(null);
    totals.hidden = false;

    const blocks = distribute(days);
    let cursor = 1;

    host.querySelector('[data-plan-title]').textContent =
      `${state.subject}: ${days} ${days === 1 ? 'día' : 'días'} de preparación`;

    phases.replaceChildren(...blocks.map((phase) => {
      const from = cursor;
      const to = cursor + phase.days - 1;
      cursor = to + 1;
      const label = from === to ? `Día ${from}` : `Días ${from}–${to}`;
      return el('div', { class: 'phase' }, [
        el('p', { class: 'phase__days', text: label }),
        el('p', { class: 'phase__name', text: phase.name }),
        el('p', { class: 'phase__detail', text: phase.detail })
      ]);
    }));

    const totalHours = days * state.hoursPerDay;
    const extra = state.difficulty === 'alta'
      ? 'Vas justo: no intentes abarcar el tema entero. Elige lo que más puntúa y asegúralo.'
      : state.difficulty === 'baja'
        ? 'Lo llevas bien: dedica la mayor parte del tiempo a problemas tipo examen, no a releer.'
        : 'Reparte el tiempo entre entender y practicar. Releer apuntes no cuenta como estudiar.';

    totals.innerHTML = `${iconSvg('clock')}<p>${NX.esc(`Unas ${NX.decimal(totalHours, 1)} horas en total. ${extra}`)}</p>`;

    if (!userDriven) return;
    NX.Snapshot.merge({
      examInDays: days,
      examText: `${state.subject} en ${days} días`,
      subjects: [state.subject],
      subjectsText: state.subject
    });
  }

  NX.bindWhatsApp(cta, () => NX.buildWhatsAppMessage({
    intro: `Tengo examen de ${state.subject} en ${Math.round(state.days)} días y he generado un plan en vuestra web. ¿Podemos prepararlo con vosotros?`,
    rows: window.NXFicha ? window.NXFicha.rows(NX.Snapshot.get()) : []
  }));

  update();
})();

/* ══════════════════════  ¿GRUPO O INDIVIDUAL?  ══════════════════════ */

(() => {
  'use strict';

  const host = document.querySelector('[data-tool="modalidad"]');
  if (!host) return;

  const { el, iconSvg } = NX;
  const QUIZ = ACADEMY.modalityQuiz;
  const answers = {};

  const result = el('div', { class: 'result', hidden: true, 'data-result': '' });

  const questions = el('div', { class: 'stack-lg' }, QUIZ.questions.map((question, i) =>
    el('fieldset', { class: 'field' }, [
      el('legend', { class: 'field-legend', style: 'font-size:var(--step-0);margin-bottom:.5rem' },
        [`${i + 1}. ${question.title}`]),
      NX.optionList(`modalidad-${question.id}`, question.options, {
        onChange: (value) => { answers[question.id] = value; evaluate(); }
      })
    ])
  ));

  host.append(questions, result);

  function evaluate() {
    const answered = QUIZ.questions.filter((q) => answers[q.id]);
    if (answered.length < QUIZ.questions.length) return;

    const score = { grupo: 0, individual: 0 };
    answered.forEach((question) => {
      const option = question.options.find((o) => o.value === answers[question.id]);
      Object.entries(option.score || {}).forEach(([key, value]) => { score[key] += value; });
    });

    const diff = score.grupo - score.individual;
    const key = Math.abs(diff) <= 1 ? 'mixto' : diff > 0 ? 'grupo' : 'individual';
    const data = QUIZ.results[key];

    const modalityId = key === 'individual' ? 'individual' : 'grupo';
    const estimate = typeof Pricing !== 'undefined'
      ? Pricing.estimate({ levelId: NX.Snapshot.get().levelId || 'eso', modalityId, frequency: 2, duration: 90 })
      : null;

    result.hidden = false;
    result.classList.remove('result-reveal');
    void result.offsetWidth;                 // reinicia la animación
    result.classList.add('result-reveal');

    const cta = el('a', {
      class: 'btn', target: '_blank', rel: 'noopener',
      html: `${iconSvg('wa')}<span class="btn__label">Comentarlo con la academia</span>`
    });

    result.replaceChildren(
      el('div', { class: 'result__head' }, [
        el('p', { class: 'result__profile', text: data.name }),
        el('p', { class: 'result__headline', text: data.headline })
      ]),
      el('div', { class: 'result__body' }, [
        el('ul', { class: 'result__list' }, data.why.map((line) => el('li', { text: line }))),
        estimate
          ? el('div', { class: 'result__specs' }, [spec('Orientativo', `${estimate.text} · 2 días de 90 min`)])
          : null,
        el('p', { class: 'result__explain', text: data.caveat }),
        el('div', { class: 'result__actions' }, [
          cta,
          el('a', { class: 'btn btn--ghost', href: 'contacto.html', text: 'Pedir una valoración' })
        ])
      ])
    );

    NX.bindWhatsApp(cta, () => NX.buildWhatsAppMessage({
      intro: `He hecho vuestro test de modalidad y me recomienda ${data.name.toLowerCase()}.`,
      rows: window.NXFicha ? window.NXFicha.rows(NX.Snapshot.get()) : []
    }));

    NX.Snapshot.merge({ modality: modalityId, modalityName: data.name });

    result.setAttribute('tabindex', '-1');
    result.focus({ preventScroll: true });
  }

  function spec(key, value) {
    return el('div', { class: 'spec' }, [
      el('span', { class: 'spec__k', text: key }),
      el('span', { class: 'spec__v', text: value })
    ]);
  }
})();

/* ═════════════════════  HORARIOS Y PLAZAS LIBRES  ═══════════════════ */

(() => {
  'use strict';

  const host = document.querySelector('[data-tool="plazas"]');
  if (!host) return;

  const { el, iconSvg } = NX;
  let filter = 'todos';
  let selected = null;
  let selectedSlot = null;

  const filters = NX.segmented('plazas-nivel', [
    { value: 'todos', label: 'Todos' },
    ...ACADEMY.levels.map((l) => ({ value: l.id, label: l.name }))
  ], { value: filter, legend: 'Filtrar por nivel', onChange: (v) => { filter = v; render(); } });

  const list = el('div', { class: 'slots', role: 'group', 'aria-label': 'Grupos con plazas' });
  const empty = el('p', { class: 'snapshot__empty', hidden: true });

  const cta = el('a', {
    class: 'btn', target: '_blank', rel: 'noopener', 'aria-disabled': 'true',
    html: `${iconSvg('wa')}<span class="btn__label">Elige un grupo para preguntar</span>`
  });

  host.append(
    el('div', { class: 'stack' }, [
      el('p', { class: 'small', text: ACADEMY.schedule.updatedLabel }),
      filters,
      list,
      empty,
      cta
    ])
  );

  function render() {
    const slots = ACADEMY.schedule.slots.filter((s) => filter === 'todos' || s.level === filter);

    empty.hidden = slots.length > 0;
    if (!slots.length) empty.textContent = 'No hay grupos abiertos de ese nivel ahora mismo. Escríbenos y lo valoramos.';

    list.replaceChildren(...slots.map((slot) => {
      const free = slot.seats - slot.taken;
      const full = free <= 0;

      const dots = el('span', { class: 'seats-dots', 'aria-hidden': 'true' },
        Array.from({ length: slot.seats }, (_, i) =>
          el('i', { 'data-taken': String(i < slot.taken) })));

      const button = el('button', {
        type: 'button',
        class: 'slot',
        'data-full': String(full),
        'aria-pressed': String(selected === slot.id),
        dataset: { id: slot.id }
      }, [
        el('span', { class: 'slot__main' }, [
          el('span', { class: 'slot__course', text: `${slot.subject} · ${slot.course}` }),
          el('span', { class: 'slot__when', text: `${slot.days} · ${slot.time} · ${slot.duration} min` })
        ]),
        el('span', { class: 'slot__seats' }, [
          dots,
          el('span', {
            class: 'seats-label',
            'data-low': String(!full && free <= 2),
            text: full ? 'Completo' : `${free} ${free === 1 ? 'plaza libre' : 'plazas libres'}`
          })
        ])
      ]);

      button.addEventListener('click', () => {
        selected = slot.id;
        NX.$$('.slot', list).forEach((node) =>
          node.setAttribute('aria-pressed', String(node.dataset.id === slot.id)));
        updateCta(slot, full);
      });

      return button;
    }));

    if (selected && !slots.some((s) => s.id === selected)) {
      selected = null;
      resetCta();
    }
  }

  function resetCta() {
    selectedSlot = null;
    cta.setAttribute('aria-disabled', 'true');
    NX.$('.btn__label', cta).textContent = 'Elige un grupo para preguntar';
  }

  function updateCta(slot, full) {
    selectedSlot = { slot, full };
    cta.setAttribute('aria-disabled', 'false');
    NX.$('.btn__label', cta).textContent = full
      ? 'Preguntar por la lista de espera'
      : 'Preguntar por esta plaza';

    NX.Snapshot.merge({
      slotText: `${slot.subject} · ${slot.course} · ${slot.days} ${slot.time}`,
      level: slot.level,
      levelId: slot.level,
      course: slot.course,
      subjects: [slot.subject],
      subjectsText: slot.subject
    });

    refreshWa();
  }

  /* Se enlaza una sola vez: el mensaje se recalcula al pulsar. */
  const refreshWa = NX.bindWhatsApp(cta, () => {
    if (!selectedSlot) return ACADEMY.messages.generic;
    const { slot, full } = selectedSlot;
    return NX.buildWhatsAppMessage({
      intro: full
        ? `He visto en la web que el grupo de ${slot.subject} de ${slot.course} está completo. ¿Tenéis lista de espera?`
        : `He visto en la web que quedan plazas en el grupo de ${slot.subject} de ${slot.course}.`,
      rows: window.NXFicha ? window.NXFicha.rows(NX.Snapshot.get()) : [],
      closing: full
        ? '¿Me avisáis si se libera una plaza? Gracias.'
        : '¿Sigue disponible? ¿Cuándo podríamos hacer la valoración inicial?'
    });
  });

  render();
})();

/* ══════════════  SOLICITUD DE CLASE DE PRUEBA (asistente)  ══════════ */

(() => {
  'use strict';

  const host = document.querySelector('[data-tool="solicitud"]');
  if (!host) return;

  const { el, iconSvg } = NX;

  /* Los pasos 2 y 3 se rellenan desde los datos de la academia. */
  const REQUEST = ACADEMY.request.steps.map((step) => {
    if (step.id === 'course') {
      return {
        ...step,
        options: ACADEMY.levels.flatMap((level) =>
          level.courses.map((course) => ({ value: course, label: course, hint: level.name })))
      };
    }
    if (step.id === 'subject') {
      return { ...step, options: ACADEMY.subjects.map((s) => ({ value: s.name, label: s.name })) };
    }
    return step;
  });

  const params = new URLSearchParams(location.search);
  const saved = NX.Snapshot.get();

  const prefill = {
    course: params.get('curso') || saved.course,
    subject: params.get('asignatura') || (saved.subjects && saved.subjects[0]),
    modality: saved.modalityName
  };

  const wizard = el('div');
  const output = el('div', { class: 'result', hidden: true });
  host.append(wizard, output);

  const steps = REQUEST.map((step) => ({
    id: step.id,
    title: step.title,
    autoNext: true,
    valid: (state) => state[step.id] ? true : 'Elige una opción para continuar.',
    render: (state, api) => NX.optionList(`req-${step.id}`, step.options, {
      value: state[step.id],
      className: step.options.length > 5 ? 'options--grid' : '',
      onChange: (value) => api.update({ [step.id]: value })
    })
  }));

  /* Prellenado: si venimos de un programa concreto, ese paso ya está resuelto. */
  const stepper = NX.createStepper({
    mount: wizard,
    steps,
    meta: 'Menos de un minuto',
    finishLabel: 'Ver mi solicitud',
    onFinish: (state) => finish(state, stepper)
  });

  Object.entries(prefill).forEach(([key, value]) => {
    if (value && steps.some((s) => s.id === key)) stepper.state[key] = value;
  });
  stepper.goTo(0);

  function finish(state) {
    wizard.hidden = true;
    output.hidden = false;
    output.classList.add('result-reveal');

    const rows = [
      ['Para quién', state.for],
      ['Curso', state.course],
      ['Asignatura', state.subject],
      ['Problema principal', state.problem],
      ['Modalidad preferida', state.modality],
      ['Franja horaria', state.when]
    ];

    const message = NX.buildWhatsAppMessage({
      intro: 'Quiero pedir una valoración inicial. Estos son mis datos:',
      rows,
      closing: '¿Qué días tenéis hueco esta semana?'
    });

    const waBtn = el('a', {
      class: 'btn', target: '_blank', rel: 'noopener', href: NX.waUrl(message),
      html: `${iconSvg('wa')}<span class="btn__label">Enviar solicitud por WhatsApp</span>`
    });

    const mailBtn = el('a', {
      class: 'btn btn--ghost',
      href: NX.mailUrl('Solicitud de valoración inicial', message),
      html: `${iconSvg('mail')}<span class="btn__label">Enviarlo por correo</span>`
    });

    const again = el('button', {
      type: 'button', class: 'btn btn--ghost btn--sm', text: 'Empezar de nuevo'
    });
    again.addEventListener('click', () => {
      output.hidden = true;
      wizard.hidden = false;
      stepper.restart();
    });

    output.replaceChildren(
      el('div', { class: 'result__head' }, [
        el('p', { class: 'result__profile', text: 'Solicitud lista' }),
        el('p', { class: 'result__headline', text: 'Ya tenemos una primera idea de lo que necesitas. Revisa el mensaje antes de enviarlo.' })
      ]),
      el('div', { class: 'result__body' }, [
        el('div', { class: 'result__specs' }, rows.map(([k, v]) => el('div', { class: 'spec' }, [
          el('span', { class: 'spec__k', text: k }),
          el('span', { class: 'spec__v', text: v })
        ]))),
        el('div', { class: 'wa-preview' }, [
          el('p', { class: 'spec__k', text: 'Mensaje que se enviará' }),
          el('pre', { class: 'wa-preview__box', text: message })
        ]),
        el('p', { class: 'result__explain', text: ACADEMY.messages.privacy }),
        el('div', { class: 'result__actions' }, [waBtn, mailBtn]),
        el('div', {}, [again])
      ])
    );

    NX.Snapshot.merge({
      course: state.course,
      subjects: [state.subject],
      subjectsText: state.subject,
      modalityName: state.modality
    });

    output.setAttribute('tabindex', '-1');
    output.focus({ preventScroll: true });
  }
})();
