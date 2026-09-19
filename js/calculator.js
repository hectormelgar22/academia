/**
 * calculator.js — Dos calculadoras y el motor de tarifas.
 *   · Nota objetivo: qué hay que sacar en el próximo examen.
 *   · Precio: horquilla orientativa a partir de las tarifas de content.js.
 */

const Pricing = (() => {
  'use strict';

  const fmt = (n) => new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(n);

  /**
   * Modelo transparente y verificable: €/hora × factor de nivel × horas/mes.
   * Devuelve una horquilla para no dar una cifra falsamente exacta.
   */
  function estimate({ levelId = 'eso', modalityId = 'grupo', frequency = 2, duration = 90 } = {}) {
    const { pricing } = ACADEMY;
    const modality = pricing.modalities.find((m) => m.id === modalityId) || pricing.modalities[0];
    const factor = pricing.levelFactor[levelId] ?? 1;

    const hoursPerMonth = frequency * (duration / 60) * pricing.weeksPerMonth;
    const hourly = modality.hourly * factor;
    const mid = hourly * hoursPerMonth;

    const min = NX.roundTo(mid * (1 - pricing.rangeSpread), 5);
    const max = NX.roundTo(mid * (1 + pricing.rangeSpread), 5);

    return {
      min, max, mid, hourly, hoursPerMonth,
      modality,
      text: `${fmt(min)}–${fmt(max)} €/mes`
    };
  }

  return { estimate, fmt };
})();

/* ═══════════  CALCULADORA DE NOTA POR CRITERIOS DE EVALUACIÓN  ══════════ */
/* No sólo cuentan los exámenes: se trabaja con los porcentajes reales de la
   asignatura y con lo que aún está pendiente de evaluar. */

(() => {
  'use strict';

  const host = document.querySelector('[data-tool="nota"]');
  if (!host) return;

  const { el, field, iconSvg } = NX;
  const CFG = ACADEMY.gradeCalculator;

  const state = {
    preset: CFG.presets[0].id,
    items: CFG.presets[0].items.map((item) => ({ ...item, grade: '' })),
    target: 5
  };

  /* ──────────────────────────  CONTROLES  ─────────────────────────── */

  const presetGroup = NX.segmented('nota-preset',
    CFG.presets.map((p) => ({ value: p.id, label: p.name })),
    {
      value: state.preset,
      legend: 'Reparto de la nota',
      onChange: (id) => {
        const preset = CFG.presets.find((p) => p.id === id);
        state.preset = id;
        state.items = preset.items.map((item) => ({ ...item, grade: '' }));
        renderCriteria();
        update();
      }
    });

  const criteria = el('div', { class: 'criteria' });

  const addBtn = el('button', {
    type: 'button', class: 'btn btn--ghost btn--sm',
    text: '+ Añadir criterio'
  });
  addBtn.addEventListener('click', () => {
    if (state.items.length >= CFG.maxItems) {
      NX.toast(`Como mucho ${CFG.maxItems} criterios.`);
      return;
    }
    state.items.push({ name: 'Nuevo criterio', weight: 0, grade: '' });
    renderCriteria();
    update();
  });

  const weightNote = el('p', { class: 'field__help', 'data-weight-note': '' });

  const targetOut = el('span', { class: 'slider-row__value', 'data-tone': 'green', id: 'nota-objetivo-val' });
  const targetInput = el('input', {
    type: 'range', id: 'nota-objetivo', min: 1, max: 10, step: 0.5,
    value: state.target, 'aria-describedby': 'nota-objetivo-val'
  });
  targetInput.addEventListener('input', () => {
    state.target = Number(targetInput.value);
    targetOut.textContent = NX.decimal(state.target, 1);
    update();
  });
  targetOut.textContent = NX.decimal(state.target, 1);

  /* ───────────────────────────  SALIDA  ───────────────────────────── */

  const figure = el('div', { class: 'figure-out' }, [
    el('p', { class: 'figure-out__value' }, [el('span', { 'data-needed': '', text: '—' })]),
    el('p', { class: 'figure-out__label', 'data-needed-label': '' })
  ]);

  const bar = el('div', { class: 'weights' }, [
    el('div', { class: 'weights__track', 'data-weights': '', role: 'img', 'aria-label': 'Reparto de la nota' }),
    el('div', { class: 'gradebar__legend' }, [
      legend('var(--blue)', 'Ya evaluado'),
      legend('var(--amber)', 'Pendiente')
    ])
  ]);

  const rangeNote = el('p', { class: 'small', 'data-range': '' });
  const note = el('div', { class: 'note', 'data-note': '', hidden: true });

  const disclaimer = el('div', { class: 'note' }, [
    el('span', { html: iconSvg('info') }),
    el('p', { text: CFG.note })
  ]);

  const cta = el('a', {
    class: 'btn btn--wa', target: '_blank', rel: 'noopener',
    html: `${iconSvg('wa')}<span class="btn__label">No sé cómo llegar a esa nota</span>`
  });

  host.append(
    el('div', { class: 'stack' }, [
      el('fieldset', { class: 'field' }, [
        el('legend', { class: 'field-legend', text: 'Cómo reparte la nota tu asignatura' }),
        el('p', { class: 'field__help', text: CFG.help }),
        presetGroup
      ]),
      el('div', {}, [
        el('div', { class: 'criteria-head' }, [
          el('span', { text: 'Criterio' }),
          el('span', { text: 'Peso' }),
          el('span', { text: 'Nota' }),
          el('span', {})
        ]),
        criteria,
        el('div', { style: 'display:flex;gap:.5rem;align-items:center;margin-top:.6rem;flex-wrap:wrap' }, [addBtn]),
        weightNote
      ]),
      el('div', { class: 'slider-row' }, [
        el('div', { class: 'slider-row__top' }, [
          el('label', { for: 'nota-objetivo', text: 'Nota a la que quieres llegar', style: 'font-size:var(--step--1);font-weight:500' }),
          targetOut
        ]),
        targetInput
      ])
    ]),
    el('div', { class: 'stack' }, [figure, bar, rangeNote, note, disclaimer, cta])
  );
  host.classList.add('tool__body--split');

  /* ─────────────────────  PINTADO DE CRITERIOS  ───────────────────── */

  function renderCriteria() {
    criteria.replaceChildren(...state.items.map((item, index) => {
      const nameInput = el('input', {
        class: 'input criterion__name', type: 'text', value: item.name,
        'aria-label': `Nombre del criterio ${index + 1}`
      });
      nameInput.addEventListener('input', () => { item.name = nameInput.value; update(); });

      const weightInput = el('input', {
        class: 'input', type: 'number', min: 0, max: 100, step: 1, inputmode: 'numeric',
        value: item.weight, 'aria-label': `Peso de ${item.name} en porcentaje`
      });
      weightInput.addEventListener('input', () => {
        item.weight = weightInput.value === '' ? 0 : Number(weightInput.value);
        update();
      });

      const gradeInput = el('input', {
        class: 'input', type: 'number', min: 0, max: 10, step: 0.1, inputmode: 'decimal',
        value: item.grade, placeholder: '—', 'aria-label': `Nota obtenida en ${item.name}`
      });
      gradeInput.addEventListener('input', () => { item.grade = gradeInput.value; update(); });

      const drop = el('button', {
        type: 'button', class: 'criterion__drop',
        'aria-label': `Quitar ${item.name}`,
        html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>'
      });
      drop.addEventListener('click', () => {
        if (state.items.length <= 1) { NX.toast('Tiene que quedar al menos un criterio.'); return; }
        state.items.splice(index, 1);
        renderCriteria();
        update();
      });

      return el('div', { class: 'criterion' }, [nameInput, weightInput, gradeInput, drop]);
    }));
  }

  /* ─────────────────────────────  CÁLCULO  ────────────────────────── */

  function update() {
    const total = state.items.reduce((sum, item) => sum + (Number(item.weight) || 0), 0);
    const valueNode = figure.querySelector('[data-needed]');
    const labelNode = figure.querySelector('[data-needed-label]');

    if (total <= 0) {
      weightNote.textContent = 'Pon el peso de cada criterio para poder calcular.';
      figure.dataset.state = '';
      valueNode.textContent = '—';
      labelNode.textContent = 'Faltan los porcentajes de la asignatura.';
      paintBar(0);
      rangeNote.textContent = '';
      hideNote();
      return;
    }

    weightNote.textContent = total === 100
      ? 'Los pesos suman 100 %.'
      : `Los pesos suman ${NX.decimal(total, 0)} %. El cálculo se ajusta a ese total, pero revísalo.`;

    /* Peso normalizado: así el cálculo sigue siendo correcto aunque no sumen 100. */
    let hechos = 0;      // puntos ya conseguidos sobre 10
    let pesoHecho = 0;   // fracción del total ya evaluada
    let pesoPendiente = 0;

    state.items.forEach((item) => {
      const peso = (Number(item.weight) || 0) / total;
      const nota = NX.parseGrade(item.grade);
      if (Number.isFinite(nota) && item.grade !== '') {
        hechos += NX.clamp(nota, 0, 10) * peso;
        pesoHecho += peso;
      } else {
        pesoPendiente += peso;
      }
    });

    paintBar(total);

    const minima = hechos;                    // un 0 en todo lo pendiente
    const maxima = hechos + 10 * pesoPendiente;
    rangeNote.textContent = pesoPendiente > 0
      ? `Con lo que llevas, tu nota final puede quedar entre ${NX.decimal(minima, 1)} y ${NX.decimal(maxima, 1)}.`
      : '';

    /* Nada pendiente: ya hay nota final. */
    if (pesoPendiente <= 0.0001) {
      figure.dataset.state = hechos >= state.target ? 'ok' : 'alert';
      NX.countTo(valueNode, hechos, { format: (n) => NX.decimal(n, 1) });
      labelNode.textContent = hechos >= state.target
        ? `es tu nota final. Has llegado al ${NX.decimal(state.target, 1)} que buscabas.`
        : `es tu nota final con todo evaluado. Te has quedado a ${NX.decimal(state.target - hechos, 1)} del objetivo.`;
      hideNote();
      guardar(hechos, null);
      return;
    }

    const necesario = (state.target - hechos) / pesoPendiente;
    const pendientes = state.items.filter((item) => item.grade === '' || !Number.isFinite(NX.parseGrade(item.grade)));
    const nombresPendientes = pendientes.map((item) => item.name).filter(Boolean);

    if (necesario > 10) {
      figure.dataset.state = 'alert';
      valueNode.textContent = 'No llega';
      labelNode.textContent = `Aunque saques un 10 en todo lo que queda, te quedarías en ${NX.decimal(maxima, 1)}.`;
      showNote('alert', `Para un ${NX.decimal(state.target, 1)} tendrías que recuperar nota de lo ya evaluado. Si la asignatura lo permite, pregunta por recuperaciones o por subir nota.`);
      guardar(null, 'inalcanzable con lo que queda');
      return;
    }

    if (necesario <= 0) {
      figure.dataset.state = 'ok';
      valueNode.textContent = 'Ya lo tienes';
      labelNode.textContent = `Con lo evaluado ya superas el ${NX.decimal(state.target, 1)}, incluso sacando un 0 en lo que queda.`;
      showNote('info', 'Buen momento para cerrar lagunas sin presión, antes de que el temario se complique.');
      guardar(null, 'ya asegurada');
      return;
    }

    figure.dataset.state = necesario <= 5 ? 'ok' : '';
    NX.countTo(valueNode, necesario, { format: (n) => NX.decimal(n, 1) });

    labelNode.textContent = nombresPendientes.length === 1
      ? `es lo que necesitas en «${nombresPendientes[0]}» para terminar con un ${NX.decimal(state.target, 1)}.`
      : `es la media que necesitas en lo que queda (${NX.list(nombresPendientes)}) para terminar con un ${NX.decimal(state.target, 1)}.`;

    const mediaActual = pesoHecho > 0 ? hechos / pesoHecho : null;
    if (mediaActual !== null && necesario - mediaActual >= 2) {
      showNote('info', `Estás pidiendo ${NX.decimal(necesario - mediaActual, 1)} puntos por encima de tu media actual (${NX.decimal(mediaActual, 1)}). Se puede, pero no sale de repetir lo mismo que estás haciendo.`);
    } else if (necesario >= 9) {
      showNote('info', 'Necesitas casi la nota máxima en lo que queda. Merece la pena repartir el objetivo entre varias entregas y no jugárselo todo al examen.');
    } else {
      hideNote();
    }

    guardar(mediaActual, NX.decimal(necesario, 1));
  }

  /* Barra de reparto: un segmento por criterio, verde si ya tiene nota. */
  function paintBar(total) {
    const track = bar.querySelector('[data-weights]');
    if (!total) { track.replaceChildren(); return; }

    const descripcion = [];
    track.replaceChildren(...state.items.map((item) => {
      const porcentaje = ((Number(item.weight) || 0) / total) * 100;
      const nota = NX.parseGrade(item.grade);
      const hecho = Number.isFinite(nota) && item.grade !== '';

      descripcion.push(`${item.name}, ${NX.decimal(porcentaje, 0)} por ciento, ${hecho ? NX.decimal(nota, 1) : 'pendiente'}`);

      const seg = el('span', {
        class: 'weights__seg',
        'data-state': hecho ? 'hecho' : 'pendiente',
        style: `--w:${porcentaje}`,
        title: `${item.name} · ${NX.decimal(porcentaje, 0)} %`
      });
      if (porcentaje >= 11) seg.textContent = hecho ? NX.decimal(nota, 1) : '?';
      return seg;
    }));

    track.setAttribute('aria-label', `Reparto de la nota: ${descripcion.join('; ')}.`);
  }

  function guardar(mediaActual, necesarioTexto) {
    NX.Snapshot.merge({
      targetGrade: NX.decimal(state.target, 1),
      currentGrade: mediaActual !== null && mediaActual !== undefined ? NX.decimal(mediaActual, 1) : undefined,
      gradesText: mediaActual !== null && mediaActual !== undefined
        ? `${NX.decimal(mediaActual, 1)} → ${NX.decimal(state.target, 1)}`
        : `objetivo ${NX.decimal(state.target, 1)}`,
      neededText: necesarioTexto || undefined
    });
  }

  function showNote(kind, text) {
    note.hidden = false;
    note.className = `note${kind === 'alert' ? ' note--alert' : ''}`;
    note.innerHTML = `${iconSvg(kind === 'alert' ? 'alert' : 'info')}<p>${NX.esc(text)}</p>`;
  }
  function hideNote() { note.hidden = true; }

  function legend(color, label) {
    return el('span', {}, [
      el('i', { style: `background:${color};border:1px solid var(--rule-strong)` }),
      el('span', { text: label })
    ]);
  }

  NX.bindWhatsApp(cta, () => NX.buildWhatsAppMessage({
    intro: 'He usado vuestra calculadora de nota y no veo cómo llegar al objetivo.',
    rows: window.NXFicha ? window.NXFicha.rows(NX.Snapshot.get()) : []
  }));

  renderCriteria();
  update();
})();

/* ═════════════════════  CALCULADORA DE PRECIO  ══════════════════════ */

(() => {
  'use strict';

  const host = document.querySelector('[data-tool="precio"]');
  if (!host) return;

  const { el, field, select, segmented, iconSvg } = NX;

  const state = {
    levelId: 'eso',
    course: '3º ESO',
    subject: 'Matemáticas',
    modalityId: 'grupo',
    frequency: 2,
    duration: 90
  };

  /* Curso: agrupado por nivel para que la lista sea navegable. */
  const courseSelect = el('select', { class: 'select' }, ACADEMY.levels.map((level) =>
    el('optgroup', { label: level.name }, level.courses.map((course) =>
      el('option', { value: `${level.id}|${course}`, selected: course === state.course }, [course])
    ))
  ));
  courseSelect.addEventListener('change', () => {
    const [levelId, course] = courseSelect.value.split('|');
    update({ levelId, course });
  });

  const subjectSelect = select(
    ACADEMY.subjects.map((s) => ({ value: s.name, label: s.name })),
    { value: state.subject, onChange: (v) => update({ subject: v }) }
  );

  const modalityGroup = segmented('precio-modalidad',
    ACADEMY.pricing.modalities.map((m) => ({ value: m.id, label: m.name })),
    { value: state.modalityId, legend: 'Modalidad', onChange: (v) => update({ modalityId: v }) });

  const freqGroup = segmented('precio-frecuencia',
    ACADEMY.pricing.frequencies.map((f) => ({ value: f.id, label: f.label })),
    { value: state.frequency, legend: 'Frecuencia', onChange: (v) => update({ frequency: Number(v) }) });

  const durationGroup = segmented('precio-duracion',
    ACADEMY.pricing.durations.map((d) => ({ value: d.id, label: d.label })),
    { value: state.duration, legend: 'Duración de la sesión', onChange: (v) => update({ duration: Number(v) }) });

  const figure = el('div', { class: 'figure-out' }, [
    el('p', { class: 'figure-out__value', 'data-price': '' }),
    el('p', { class: 'figure-out__label', text: 'Precio orientativo al mes, con nuestras tarifas públicas.' })
  ]);

  const breakdown = el('div', { class: 'table-wrap' }, [
    el('table', { class: 'table' }, [
      el('caption', { class: 'visually-hidden', text: 'Desglose del cálculo' }),
      el('tbody', { 'data-breakdown': '' })
    ])
  ]);

  const perks = el('ul', { class: 'chips' }, ACADEMY.pricing.discounts.map((d) =>
    el('li', { class: 'chip', text: `${d.label}: ${d.value}` })
  ));

  const disclaimer = el('div', { class: 'note' }, [
    el('span', { html: iconSvg('info') }),
    el('p', { text: ACADEMY.pricing.disclaimer })
  ]);

  const cta = el('a', {
    class: 'btn',
    target: '_blank',
    rel: 'noopener',
    html: `${iconSvg('wa')}<span class="btn__label">Consultar disponibilidad</span>`
  });

  host.append(
    el('div', { class: 'stack' }, [
      field('Curso', courseSelect),
      field('Asignatura', subjectSelect),
      el('fieldset', { class: 'field' }, [
        el('legend', { class: 'field-legend', text: 'Modalidad' }),
        modalityGroup,
        el('p', { class: 'field__help', 'data-modality-note': '' })
      ]),
      el('fieldset', { class: 'field' }, [
        el('legend', { class: 'field-legend', text: 'Frecuencia' }),
        freqGroup
      ]),
      el('fieldset', { class: 'field' }, [
        el('legend', { class: 'field-legend', text: 'Duración de cada sesión' }),
        durationGroup
      ])
    ]),
    el('div', { class: 'stack' }, [figure, breakdown, perks, disclaimer, cta])
  );
  host.classList.add('tool__body--split');

  function update(patch) {
    const userDriven = patch !== undefined;
    Object.assign(state, patch || {});
    const result = Pricing.estimate(state);

    const priceNode = figure.querySelector('[data-price]');
    priceNode.textContent = `${Pricing.fmt(result.min)}–${Pricing.fmt(result.max)}`;
    priceNode.insertAdjacentHTML('beforeend', ' <span class="figure-out__unit">€/mes</span>');

    host.querySelector('[data-modality-note]').textContent = result.modality.note;

    host.querySelector('[data-breakdown]').replaceChildren(
      row('Sesiones al mes', `${NX.decimal(state.frequency * ACADEMY.pricing.weeksPerMonth, 0)}`),
      row('Horas al mes', NX.decimal(result.hoursPerMonth, 1)),
      row('Precio por hora', `${Pricing.fmt(Math.round(result.hourly * 10) / 10)} €`),
      row('Matrícula', '0 €'),
      row('Total orientativo', result.text, true)
    );

    if (!userDriven) return;
    NX.Snapshot.merge({
      level: state.levelId,
      levelId: state.levelId,
      course: state.course,
      subjects: [state.subject],
      subjectsText: state.subject,
      modality: state.modalityId,
      modalityName: result.modality.name,
      priceText: result.text,
      priceMin: result.min,
      priceMax: result.max
    });
  }

  function row(label, value, strong) {
    return el('tr', {}, [
      el('th', { scope: 'row', style: 'text-transform:none;letter-spacing:0;font-size:var(--step--1);color:var(--tx-2);font-weight:400', text: label }),
      el('td', { class: strong ? 'is-strong' : '', text: value })
    ]);
  }

  NX.bindWhatsApp(cta, () => {
    const result = Pricing.estimate(state);
    return NX.buildWhatsAppMessage({
      intro: 'He calculado un precio orientativo en vuestra web y quiero confirmar disponibilidad.',
      rows: [
        ['Curso', state.course],
        ['Asignatura', state.subject],
        ['Modalidad', result.modality.name],
        ['Frecuencia', `${state.frequency} ${state.frequency === 1 ? 'día' : 'días'} por semana`],
        ['Duración', `${state.duration} minutos`],
        ['Estimación de la web', result.text]
      ]
    });
  });

  update();
})();
