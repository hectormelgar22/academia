/**
 * utils.js — Piezas compartidas por todo el sitio.
 * Espacio de nombres único (NX) para no ensuciar el global.
 */

const NX = (() => {
  'use strict';

  /* ───────────────────────────  DOM  ─────────────────────────── */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /**
   * Crea un elemento. Los atributos que empiezan por "on" se registran como
   * eventos; `html` inserta marcado ya construido por nosotros.
   */
  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (value === null || value === undefined || value === false) continue;
      if (key === 'html') node.innerHTML = value;
      else if (key === 'text') node.textContent = value;
      else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2), value);
      else if (key === 'dataset') Object.assign(node.dataset, value);
      else node.setAttribute(key, value === true ? '' : value);
    }
    for (const child of [].concat(children)) {
      if (child === null || child === undefined || child === false) continue;
      node.append(child.nodeType ? child : document.createTextNode(child));
    }
    return node;
  }

  const esc = (str) => String(str).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  /* ─────────────────────────  NÚMEROS  ───────────────────────── */
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const roundTo = (n, step) => Math.round(n / step) * step;

  const euro = (n) => new Intl.NumberFormat('es-ES', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0
  }).format(n);

  const decimal = (n, digits = 1) => new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: digits, maximumFractionDigits: digits
  }).format(n);

  /** Convierte "7,5" y "7.5" en 7.5. Devuelve NaN si no hay número. */
  function parseGrade(value) {
    if (typeof value === 'number') return value;
    const clean = String(value ?? '').trim().replace(',', '.');
    if (clean === '') return NaN;
    return Number(clean);
  }

  /* ──────────────────────  FICHA DEL ALUMNO  ─────────────────── */
  /**
   * Guarda sólo información académica (curso, asignaturas, preferencias).
   * Nunca nombre, teléfono ni correo: esos datos únicamente viajan en el
   * mensaje que la persona decide enviar.
   */
  const STORE_KEY = 'nexo.ficha.v1';
  const listeners = new Set();

  const Snapshot = {
    get() {
      try {
        return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
      } catch {
        return {};
      }
    },
    merge(patch) {
      const next = Object.assign(this.get(), patch, { updatedAt: Date.now() });
      try { localStorage.setItem(STORE_KEY, JSON.stringify(next)); } catch { /* modo privado */ }
      listeners.forEach((fn) => fn(next));
      return next;
    },
    clear() {
      try { localStorage.removeItem(STORE_KEY); } catch { /* ignorar */ }
      listeners.forEach((fn) => fn({}));
    },
    subscribe(fn) {
      listeners.add(fn);
      fn(this.get());
      return () => listeners.delete(fn);
    },
    /** Campos que consideramos «la ficha completa», para la barra de progreso. */
    fields: ['level', 'subjects', 'profile', 'modality', 'hoursPerWeek', 'targetGrade'],
    completeness() {
      const data = this.get();
      const filled = this.fields.filter((key) => {
        const value = data[key];
        return Array.isArray(value) ? value.length > 0 : value !== undefined && value !== '' && value !== null;
      });
      return { filled: filled.length, total: this.fields.length };
    }
  };

  /* ────────────────────────  WHATSAPP  ───────────────────────── */
  /**
   * Construye un mensaje legible y estructurado.
   * Acepta datos de cualquier herramienta: diagnóstico, calculadoras,
   * planificador, plazas o solicitud de clase.
   */
  function buildWhatsAppMessage({ intro, rows = [], notes = [], closing } = {}) {
    const parts = [ACADEMY.messages.intro];

    if (intro) parts.push(intro);

    const clean = rows.filter((row) => row && row[1] !== undefined && row[1] !== null && String(row[1]).trim() !== '');
    if (clean.length) {
      parts.push(clean.map(([label, value]) => `· ${label}: ${value}`).join('\n'));
    }

    notes.filter(Boolean).forEach((note) => parts.push(note));
    parts.push(closing || ACADEMY.messages.closing);

    return parts.join('\n\n');
  }

  /** encodeURIComponent respeta tildes, ñ y saltos de línea en UTF-8. */
  const waUrl = (message) =>
    `https://wa.me/${ACADEMY.contact.whatsapp}?text=${encodeURIComponent(message)}`;

  const mailUrl = (subject, body) =>
    `mailto:${ACADEMY.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  /**
   * Conecta un botón (o enlace) a un mensaje de WhatsApp que se recalcula
   * en el momento del clic, para que siempre lleve los últimos datos.
   */
  function bindWhatsApp(node, getMessage) {
    if (!node) return;
    const update = () => {
      const message = getMessage();
      node.setAttribute('href', waUrl(message));
    };
    update();
    node.addEventListener('pointerenter', update);
    node.addEventListener('focus', update);
    node.addEventListener('click', update);
    return update;
  }

  /* ─────────────────────────  AVISOS  ────────────────────────── */
  let toastNode = null;
  let toastTimer = null;

  function toast(message) {
    if (!toastNode) {
      toastNode = el('div', { class: 'toast', role: 'status', 'aria-live': 'polite' }, [
        el('span', { html: iconSvg('check') }),
        el('span', { class: 'toast__text' })
      ]);
      document.body.append(toastNode);
    }
    $('.toast__text', toastNode).textContent = message;
    requestAnimationFrame(() => toastNode.setAttribute('data-show', 'true'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastNode.setAttribute('data-show', 'false'), 3200);
  }

  /* ──────────────────────────  ICONOS  ───────────────────────── */
  /* Trazo único de 1.6 px, dibujados a mano. Sin emoji ni glifos. */
  const ICONS = {
    arrow:  '<path d="M4 12h15"/><path d="m13 6 6 6-6 6"/>',
    check:  '<path d="M20 6 9 17l-5-5"/>',
    wa:     '<path d="M3.5 20.5 5 16a8.5 8.5 0 1 1 3.2 3.1l-4.7 1.4Z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5.6 0 1-.4 1-.9l-.2-1-1.6-.5-.8.9a5.7 5.7 0 0 1-2.4-2.4l.9-.8-.5-1.6-1-.2c-.5 0-.9.4-.9 1Z"/>',
    info:   '<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.6v.1"/>',
    alert:  '<path d="M12 4 2.5 20h19L12 4Z"/><path d="M12 10v4"/><path d="M12 17.4v.1"/>',
    print:  '<path d="M7 9V3h10v6"/><path d="M7 19H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><path d="M7 15h10v6H7z"/>',
    pin:    '<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
    clock:  '<circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 1.8"/>',
    mail:   '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6 8.5-6"/>',
    phone:  '<path d="M7 3.5h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 5.5 5.7 2 2 0 0 1 7 3.5Z"/>',
    star:   '<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8L12 3.5Z"/>'
  };

  function iconSvg(name, { size = 16, fill = 'none' } = {}) {
    return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="${fill}" stroke="${fill === 'none' ? 'currentColor' : 'none'}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;
  }

  /* ─────────────────────  ANIMACIÓN DE CIFRAS  ───────────────── */
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Interpola un número en pantalla. La cifra final se garantiza siempre:
   * con movimiento reducido, en la primera pintada y aunque el navegador
   * no dibuje (pestaña en segundo plano), donde requestAnimationFrame no corre.
   */
  function countTo(node, to, { duration = 520, format = (n) => decimal(n, 0) } = {}) {
    const from = Number(node.dataset.value);
    node.dataset.value = String(to);

    const fijar = () => { node.textContent = format(to); };
    if (reduced() || !Number.isFinite(from) || from === to) { fijar(); return; }

    let terminado = false;
    const start = performance.now();

    const tick = (now) => {
      if (terminado) return;
      const t = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      node.textContent = format(from + (to - from) * eased);
      if (t < 1) requestAnimationFrame(tick);
      else terminado = true;
    };

    requestAnimationFrame(tick);
    setTimeout(() => { if (!terminado) { terminado = true; fijar(); } }, duration + 120);
  }

  /* ──────────────────────  FÁBRICAS DE UI  ───────────────────── */
  let uid = 0;
  const nextId = (prefix) => `${prefix}-${++uid}`;

  /** Campo con etiqueta, ayuda opcional y hueco reservado para el error. */
  function field(labelText, control, { help, id } = {}) {
    const controlId = id || control.id || nextId('f');
    control.id = controlId;

    const errorId = `${controlId}-error`;
    const error = el('p', { class: 'field__error', id: errorId, hidden: true, role: 'alert' });
    const nodes = [el('label', { for: controlId, text: labelText })];
    if (help) nodes.push(el('p', { class: 'field__help', text: help }));
    nodes.push(control, error);

    const wrapper = el('div', { class: 'field' }, nodes);
    wrapper.setError = (message) => {
      if (message) {
        error.innerHTML = `${iconSvg('alert', { size: 14 })}<span>${esc(message)}</span>`;
        error.hidden = false;
        control.setAttribute('aria-invalid', 'true');
        control.setAttribute('aria-describedby', errorId);
      } else {
        error.hidden = true;
        control.removeAttribute('aria-invalid');
        control.removeAttribute('aria-describedby');
      }
    };
    return wrapper;
  }

  function select(options, { value, onChange } = {}) {
    const node = el('select', { class: 'select' }, options.map((opt) =>
      el('option', { value: opt.value, selected: opt.value === value }, [opt.label])
    ));
    if (onChange) node.addEventListener('change', () => onChange(node.value));
    return node;
  }

  function numberInput({ value, min, max, step = 'any', inputmode = 'decimal', onInput } = {}) {
    const node = el('input', {
      class: 'input', type: 'number', value, min, max, step, inputmode
    });
    if (onInput) node.addEventListener('input', () => onInput(node.value));
    return node;
  }

  /** Grupo de radios con aspecto de botonera. Accesible con flechas del teclado. */
  function segmented(name, items, { value, onChange, legend } = {}) {
    const group = el('div', { class: 'segmented', role: 'radiogroup', 'aria-label': legend || name });

    items.forEach((item) => {
      const input = el('input', {
        type: 'radio', name, value: String(item.value), checked: String(item.value) === String(value)
      });
      input.addEventListener('change', () => onChange && onChange(item.value));
      group.append(el('label', {}, [input, el('span', { text: item.label })]));
    });

    return group;
  }

  /** Lista de opciones grandes (radio o checkbox) para los asistentes. */
  function optionList(name, items, { type = 'radio', value, values = [], onChange, className = '' } = {}) {
    const list = el('div', { class: `options ${className}`.trim(), role: type === 'radio' ? 'radiogroup' : 'group' });

    items.forEach((item) => {
      const checked = type === 'radio'
        ? String(item.value) === String(value)
        : values.map(String).includes(String(item.value));

      const input = el('input', { type, name, value: String(item.value), checked });
      const label = el('label', { class: `option${type === 'checkbox' ? ' option--check' : ''}` }, [
        input,
        el('span', { class: 'option__box', 'aria-hidden': 'true' }),
        el('span', { class: 'option__text' }, [
          el('span', { class: 'option__label', text: item.label }),
          item.hint ? el('span', { class: 'option__hint', text: item.hint }) : null
        ])
      ]);

      input.addEventListener('change', () => {
        if (!onChange) return;
        if (type === 'radio') return onChange(item.value);
        const picked = $$(`input[name="${name}"]:checked`, list).map((node) => node.value);
        onChange(picked);
      });

      list.append(label);
    });

    return list;
  }

  /* ──────────────────────────  ASISTENTE  ────────────────────── */
  /**
   * Formulario por pasos con barra de progreso, validación por paso y
   * avance automático al elegir con el ratón (nunca con el teclado, para
   * no saltar de pregunta mientras se navega con las flechas).
   */
  function createStepper({ mount, steps, meta = '', onFinish, finishLabel = 'Ver resultado' }) {
    const state = {};
    let index = 0;

    const fill = el('span', { class: 'stepper__fill' });
    const counter = el('span');
    const panel = el('div', { class: 'step-panel' });

    const backBtn = el('button', { type: 'button', class: 'btn btn--ghost btn--sm', text: 'Atrás' });
    const nextBtn = el('button', { type: 'button', class: 'btn' });
    const live = el('p', { class: 'visually-hidden', 'aria-live': 'polite' });

    const head = el('div', {}, [
      el('div', { class: 'stepper__bar' }, [fill]),
      el('p', { class: 'stepper__meta' }, [counter, el('span', { text: meta })])
    ]);

    mount.replaceChildren(head, panel, el('div', { class: 'step-nav' }, [backBtn, nextBtn]), live);

    const api = {
      state,
      update(patch) { Object.assign(state, patch); refreshNav(); },
      next() { go(index + 1); },
      back() { go(index - 1); },
      goTo: go,
      restart() { steps.forEach((s) => delete state[s.id]); go(0); }
    };

    function validate() {
      const step = steps[index];
      return step.valid ? step.valid(state) : true;
    }

    function refreshNav() {
      const ok = validate();
      const last = index === steps.length - 1;
      nextBtn.textContent = last ? finishLabel : 'Siguiente';
      nextBtn.disabled = ok !== true;
      nextBtn.setAttribute('aria-disabled', String(ok !== true));
      backBtn.hidden = index === 0;
    }

    function go(target) {
      if (target > index && validate() !== true) return;
      if (target < 0) return;

      if (target >= steps.length) {
        onFinish(state);
        return;
      }

      index = target;
      const step = steps[index];

      const body = el('div', { class: 'step-enter' }, [
        el('h3', { class: 'step-panel__title', id: 'step-title', text: step.title }),
        step.help ? el('p', { class: 'step-panel__help', text: step.help }) : null,
        step.render(state, api)
      ]);

      panel.replaceChildren(body);
      panel.setAttribute('aria-labelledby', 'step-title');

      fill.style.setProperty('--p', String((index + 1) / steps.length));
      counter.textContent = `Pregunta ${index + 1} de ${steps.length}`;
      live.textContent = `Paso ${index + 1} de ${steps.length}. ${step.title}`;

      refreshNav();

      /* Foco al primer control, sin robarlo en la carga inicial. */
      if (target !== 0 || mount.dataset.started === 'true') {
        const first = panel.querySelector('input, select, button, [tabindex]');
        if (first) first.focus({ preventScroll: true });
      }
      mount.dataset.started = 'true';

      if (step.autoNext) {
        panel.addEventListener('click', (event) => {
          if (event.detail === 0) return;           // clic generado por teclado
          if (!event.target.closest('.option')) return;
          if (validate() !== true) return;
          setTimeout(() => { if (index === target) go(target + 1); }, 240);
        }, { once: true });
      }
    }

    backBtn.addEventListener('click', api.back);
    nextBtn.addEventListener('click', api.next);

    panel.addEventListener('change', refreshNav);
    panel.addEventListener('input', refreshNav);

    go(0);
    return api;
  }

  /* ─────────────────────────  VARIOS  ────────────────────────── */
  const levelName = (id) => (ACADEMY.levels.find((lv) => lv.id === id) || {}).name || '';
  const modalityName = (id) => (ACADEMY.pricing.modalities.find((m) => m.id === id) || {}).name || '';

  const list = (items) => {
    const arr = [].concat(items).filter(Boolean);
    if (arr.length <= 1) return arr.join('');
    return `${arr.slice(0, -1).join(', ')} y ${arr[arr.length - 1]}`;
  };

  return {
    $, $$, el, esc, clamp, roundTo, euro, decimal, parseGrade, nextId,
    Snapshot, buildWhatsAppMessage, waUrl, mailUrl, bindWhatsApp,
    toast, iconSvg, countTo, reduced, levelName, modalityName, list,
    field, select, numberInput, segmented, optionList, createStepper
  };
})();
