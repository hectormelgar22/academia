/**
 * diagnostico.js — «¿Qué necesita realmente el alumno?»
 *
 * Ocho preguntas, puntuación por perfil y una ficha de resultado que
 * alimenta el resto de la web y el mensaje de WhatsApp.
 */

(() => {
  'use strict';

  const host = document.querySelector('[data-tool="diagnostico"]');
  if (!host) return;

  const { el, iconSvg } = NX;
  const D = ACADEMY.diagnostic;

  const wizard = el('div');
  const result = el('div', { class: 'result', hidden: true });
  host.append(wizard, result);

  /* ─────────────────────────  PASOS  ──────────────────────────────── */

  const steps = D.questions.map((question) => {
    if (question.type === 'grades') return gradeStep(question);

    if (question.type === 'multi') {
      return {
        id: question.id,
        title: question.title,
        help: question.help,
        valid: (state) => (state[question.id] || []).length ? true : 'Elige al menos una asignatura.',
        render: (state, api) => NX.optionList(`diag-${question.id}`, question.options, {
          type: 'checkbox',
          values: state[question.id] || [],
          className: 'options--grid',
          onChange: (picked) => {
            const limited = picked.slice(0, question.max || 3);
            if (picked.length > limited.length) {
              NX.$$(`input[name="diag-${question.id}"]`).forEach((input) => {
                if (!limited.includes(input.value)) input.checked = false;
              });
              NX.toast(`Elige como máximo ${question.max} asignaturas.`);
            }
            api.update({ [question.id]: limited });
          }
        })
      };
    }

    return {
      id: question.id,
      title: question.title,
      help: question.help,
      autoNext: true,
      valid: (state) => state[question.id] ? true : 'Elige una opción para continuar.',
      render: (state, api) => NX.optionList(`diag-${question.id}`, question.options, {
        value: state[question.id],
        onChange: (value) => api.update({ [question.id]: value })
      })
    };
  });

  /* Paso doble: nota actual y nota objetivo en la misma pantalla. */
  function gradeStep(question) {
    return {
      id: question.id,
      title: question.title,
      help: question.help,
      valid: () => true,
      render: (state, api) => {
        state.current = state.current ?? 5;
        state.target = state.target ?? 7;

        const currentRow = gradeSlider('Nota actual', state.current, (v) => {
          state.current = v;
          if (state.target < v) { state.target = v; targetRow.set(v); }
          api.update({ current: v, target: state.target });
        });

        const targetRow = gradeSlider('Nota a la que quieres llegar', state.target, (v) => {
          state.target = Math.max(v, state.current);
          targetRow.set(state.target);
          api.update({ target: state.target });
        }, 'green');

        const gap = el('p', { class: 'field__help', 'data-gap': '' });
        const paint = () => {
          const diff = state.target - state.current;
          gap.textContent = diff <= 0
            ? 'Mismo punto de partida y objetivo: trabajaremos para consolidar.'
            : `Hay que subir ${NX.decimal(diff, 1)} ${diff === 1 ? 'punto' : 'puntos'}.`;
        };
        paint();

        const box = el('div', { class: 'stack' }, [currentRow.node, targetRow.node, gap]);
        box.addEventListener('input', paint);
        return box;
      }
    };
  }

  function gradeSlider(label, value, onInput, tone) {
    const id = NX.nextId('g');
    const output = el('span', { class: 'slider-row__value', 'data-tone': tone || '', id: `${id}-out` });
    const input = el('input', {
      type: 'range', id, min: 0, max: 10, step: 0.5, value, 'aria-describedby': `${id}-out`
    });

    const set = (v) => { input.value = String(v); output.textContent = NX.decimal(v, 1); };
    set(value);

    input.addEventListener('input', () => onInput(Number(input.value)));

    return {
      node: el('div', { class: 'slider-row' }, [
        el('div', { class: 'slider-row__top' }, [
          el('label', { for: id, text: label, style: 'font-size:var(--step--1);font-weight:500' }),
          output
        ]),
        input
      ]),
      set
    };
  }

  /* ───────────────────────  PUNTUACIÓN  ───────────────────────────── */

  function score(state) {
    const points = { base: 0, metodo: 0, examen: 0, intensivo: 0 };
    const add = (table) => Object.entries(table || {}).forEach(([k, v]) => { points[k] += v; });

    D.questions.forEach((question) => {
      const answer = state[question.id];
      if (!answer) return;

      if (question.type === 'multi') {
        if (answer.length >= 3) add(question.score && question.score._count3);
        return;
      }
      const option = (question.options || []).find((o) => o.value === answer);
      if (option) add(option.score);
    });

    /* Señales derivadas de las notas y del nivel. */
    const current = state.current ?? 5;
    const target = state.target ?? 7;
    const gap = target - current;

    if (current <= 4) add({ base: 2 });
    if (gap >= 3) add({ base: 1, intensivo: 1 });
    if (gap <= 1 && current >= 6) add({ examen: 1 });
    if (state.level === 'pau') add({ intensivo: 1, examen: 1 });
    if (state.level === 'primaria') add({ base: 1 });

    const best = D.order.reduce((winner, id) =>
      points[id] > points[winner] ? id : winner, D.order[0]);

    return { points, profile: D.profiles[best] };
  }

  /* Evidencias: el resultado se justifica con lo que la persona ha marcado. */
  const BREAK_REASON = {
    teoria:     'Has marcado que se pierde ya en la explicación de clase, no en los ejercicios.',
    ejercicios: 'Entiende la teoría pero se queda en blanco al empezar los ejercicios.',
    examen:     'En casa los ejercicios salen y en el examen no: el contenido está, el examen no.',
    tiempo:     'La sensación es de ir siempre con retraso, acumulando temas sin cerrar.'
  };

  const ROUTINE_REASON = {
    nunca:    'Casi no hay rutina de estudio entre semana.',
    examenes: 'El estudio aparece a ráfagas, sólo cuando hay examen cerca.',
    sinplan:  'Hay constancia diaria, pero sin un plan que diga qué tocar cada día.',
    conplan:  'Ya hay rutina diaria y plan: el problema no es la constancia.'
  };

  function reasons(state) {
    const out = [];
    if (BREAK_REASON[state.breaks]) out.push(BREAK_REASON[state.breaks]);
    if (ROUTINE_REASON[state.routine]) out.push(ROUTINE_REASON[state.routine]);
    if (state.exam === '7') out.push('El examen es esta misma semana: el margen de maniobra es mínimo.');

    const gap = (state.target ?? 7) - (state.current ?? 5);
    if (gap >= 3) {
      out.push(`Subir de ${NX.decimal(state.current, 1)} a ${NX.decimal(state.target, 1)} son ${NX.decimal(gap, 1)} puntos: es mucho para un solo trimestre sin cambiar el método.`);
    }
    if ((state.subjects || []).length >= 3) {
      out.push('Con tres asignaturas a la vez, el riesgo es repartir el tiempo y no avanzar en ninguna.');
    }
    return out.slice(0, 3);
  }

  /* ─────────────────────────  RESULTADO  ──────────────────────────── */

  function finish(state) {
    const { profile } = score(state);
    const subjects = state.subjects || [];
    const levelId = state.level || 'eso';
    const hours = Number(state.hours || 3);

    const estimate = typeof Pricing !== 'undefined'
      ? Pricing.estimate({
          levelId,
          modalityId: profile.modality,
          frequency: profile.sessions,
          duration: profile.duration
        })
      : null;

    const forFamily = state.who === 'familia';
    const subjectsText = subjects.length ? NX.list(subjects) : 'Sin concretar';

    wizard.hidden = true;
    result.hidden = false;
    result.classList.add('result-reveal');

    const waBtn = el('a', {
      class: 'btn', target: '_blank', rel: 'noopener',
      html: `${iconSvg('wa')}<span class="btn__label">Quiero hablar con la academia</span>`
    });

    const why = reasons(state);

    result.replaceChildren(
      el('div', { class: 'result__head' }, [
        el('p', { class: 'result__profile', text: profile.name }),
        el('p', { class: 'result__headline', text: profile.headline })
      ]),

      el('div', { class: 'result__body' }, [
        el('p', { class: 'result__explain', text: profile.explain }),

        why.length ? el('div', {}, [
          el('p', { class: 'spec__k', style: 'margin-bottom:.5rem', text: 'Por qué sale este perfil' }),
          el('ul', { class: 'result__list' }, why.map((line) => el('li', { text: line })))
        ]) : null,

        el('div', { class: 'result__specs' }, [
          spec('Curso', state.course || NX.levelName(levelId)),
          spec('Asignaturas', subjectsText),
          spec('Objetivo', `${NX.decimal(state.current ?? 5, 1)} → ${NX.decimal(state.target ?? 7, 1)}`),
          spec('Horas disponibles', `${hours} h por semana`),
          spec('Recomendación', `${profile.sessions} sesiones de ${profile.duration} min · ${NX.modalityName(profile.modality)}`),
          spec('Trabajo autónomo', profile.selfWork),
          estimate ? spec('Precio orientativo', estimate.text) : null
        ].filter(Boolean)),

        el('div', {}, [
          el('p', { class: 'spec__k', style: 'margin-bottom:.6rem', text: 'Qué haríamos' }),
          el('ul', { class: 'result__list' }, profile.recommendations.map((line) => el('li', { text: line })))
        ]),

        el('p', { class: 'result__explain', text: forFamily
          ? 'Siguiente paso: una valoración inicial de 45 minutos, sin coste, para confirmar el diagnóstico con una prueba real.'
          : 'Siguiente paso: una valoración inicial de 45 minutos, sin coste, para comprobar con una prueba si esto encaja contigo.' }),

        el('div', { class: 'result__actions' }, [
          waBtn,
          el('a', { class: 'btn btn--ghost', href: 'herramientas.html', text: 'Ver las herramientas' })
        ]),

        el('div', { style: 'display:flex;gap:.5rem;flex-wrap:wrap' }, [
          restartButton(),
          el('a', { class: 'btn btn--ghost btn--sm', href: 'contacto.html', text: 'Pedir valoración por formulario' })
        ])
      ])
    );

    /* La ficha recoge el resultado para el resto de la web. */
    NX.Snapshot.merge({
      level: levelId,
      levelId,
      course: state.course || NX.levelName(levelId),
      subjects,
      subjectsText,
      profile: profile.id,
      profileName: profile.name,
      currentGrade: NX.decimal(state.current ?? 5, 1),
      targetGrade: NX.decimal(state.target ?? 7, 1),
      gradesText: `${NX.decimal(state.current ?? 5, 1)} → ${NX.decimal(state.target ?? 7, 1)}`,
      hoursPerWeek: hours,
      hoursText: `${hours} h por semana`,
      modality: profile.modality,
      modalityName: NX.modalityName(profile.modality),
      priceText: estimate ? estimate.text : undefined,
      examText: state.exam && state.exam !== '0'
        ? `dentro de ${state.exam === '7' ? 'menos de 7' : state.exam} días`
        : undefined
    });

    NX.bindWhatsApp(waBtn, () => NX.buildWhatsAppMessage({
      intro: forFamily
        ? `He hecho el diagnóstico de vuestra web para mi hijo/a y el resultado es «${profile.name}».`
        : `He hecho el diagnóstico de vuestra web y me sale el perfil «${profile.name}».`,
      rows: window.NXFicha ? window.NXFicha.rows(NX.Snapshot.get()) : [],
      closing: '¿Cuándo podríamos hacer la valoración inicial?'
    }));

    result.setAttribute('tabindex', '-1');
    result.focus({ preventScroll: true });
    result.scrollIntoView({ behavior: NX.reduced() ? 'auto' : 'smooth', block: 'start' });
  }

  function restartButton() {
    const button = el('button', { type: 'button', class: 'btn btn--ghost btn--sm', text: 'Repetir el diagnóstico' });
    button.addEventListener('click', () => {
      result.hidden = true;
      result.classList.remove('result-reveal');
      wizard.hidden = false;
      stepper.restart();
      wizard.scrollIntoView({ behavior: NX.reduced() ? 'auto' : 'smooth', block: 'start' });
    });
    return button;
  }

  function spec(key, value) {
    return el('div', { class: 'spec' }, [
      el('span', { class: 'spec__k', text: key }),
      el('span', { class: 'spec__v', text: value })
    ]);
  }

  const stepper = NX.createStepper({
    mount: wizard,
    steps,
    meta: D.intro.time,
    finishLabel: 'Ver mi resultado',
    onFinish: finish
  });
})();
