/**
 * main.js — Comportamiento común a todas las páginas:
 * navegación, revelado al scroll, barra fija en móvil y la ficha del alumno
 * (el panel que conecta todas las herramientas con el contacto).
 */

(() => {
  'use strict';

  const { $, $$, el, iconSvg } = NX;

  /* ─────────────────────────  NAVEGACIÓN  ──────────────────────────── */
  function initNav() {
    const toggle = $('.nav-toggle');
    const panel = $('.mobile-nav');
    if (!toggle || !panel) return;

    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      panel.dataset.open = String(open);
      document.body.style.overflow = open ? 'hidden' : '';
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    };

    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));

    panel.addEventListener('click', (e) => {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel.dataset.open === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });

    /* Si se pasa a escritorio con el menú abierto, se cierra sin dejar el scroll bloqueado. */
    window.matchMedia('(min-width: 64rem)').addEventListener('change', (e) => {
      if (e.matches) setOpen(false);
    });

    /* Marca la página actual sin duplicar lógica en cada HTML. */
    const here = location.pathname.split('/').pop() || 'index.html';
    $$('.nav__link, .mobile-nav__link').forEach((link) => {
      if (link.getAttribute('href') === here) link.setAttribute('aria-current', 'page');
    });
  }

  /* ────────────────────────  REVELADO AL SCROLL  ───────────────────── */
  function initReveal() {
    const items = $$('[data-reveal]');
    if (!items.length) return;

    if (NX.reduced() || !('IntersectionObserver' in window)) {
      items.forEach((node) => node.classList.add('is-in'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    items.forEach((node) => observer.observe(node));

    /* Los bloques que se pintan desde JS se observan después de existir. */
    document.addEventListener('nx:rendered', () => {
      $$('[data-reveal]:not(.is-in)').forEach((node) => observer.observe(node));
    });
  }

  /* ───────────────────────  BARRA FIJA EN MÓVIL  ───────────────────── */
  function initStickyCta() {
    const bar = $('.sticky-cta');
    if (!bar) return;

    const sentinel = $('.hero') || $('.page-head');
    if (!sentinel || !('IntersectionObserver' in window)) { bar.dataset.show = 'true'; return; }

    const observer = new IntersectionObserver(([entry]) => {
      bar.dataset.show = String(!entry.isIntersecting);
    }, { threshold: 0 });

    observer.observe(sentinel);
  }

  /* ───────────────────────  FICHA DEL ALUMNO  ──────────────────────── */
  /* Es la pieza que convierte herramientas sueltas en un embudo: cada
     resultado se guarda aquí y de aquí sale un único mensaje completo. */

  const LABELS = {
    course:       'Curso',
    subjectsText: 'Asignaturas',
    profileName:  'Perfil del diagnóstico',
    gradesText:   'Nota actual → objetivo',
    neededText:   'Nota necesaria en el próximo examen',
    hoursText:    'Horas disponibles',
    modalityName: 'Modalidad recomendada',
    priceText:    'Precio orientativo',
    examText:     'Próximo examen',
    slotText:     'Grupo de interés',
    planText:     'Plan de estudio'
  };

  const ORDER = ['course', 'subjectsText', 'profileName', 'gradesText', 'neededText',
                 'examText', 'hoursText', 'modalityName', 'priceText', 'slotText', 'planText'];

  function fichaRows(data) {
    return ORDER
      .filter((key) => data[key])
      .map((key) => [LABELS[key], data[key]]);
  }

  /** Mensaje maestro: reúne todo lo que la persona ha hecho en la web. */
  function fichaMessage(data = NX.Snapshot.get()) {
    const rows = fichaRows(data);
    const intro = rows.length
      ? 'He usado las herramientas de la web y este es mi resumen:'
      : 'Me gustaría información sobre las clases de refuerzo.';

    return NX.buildWhatsAppMessage({
      intro,
      rows,
      closing: rows.length
        ? '¿Podemos concretar una valoración inicial? Decidme qué días tenéis hueco.'
        : ACADEMY.messages.closing
    });
  }

  function initFicha() {
    const panel = $('[data-snapshot]');
    if (!panel) return;

    const rowsBox = $('[data-snapshot-rows]', panel);
    const meterFill = $('[data-snapshot-fill]', panel);
    const meterLabel = $('[data-snapshot-label]', panel);
    const actions = $('[data-snapshot-actions]', panel);

    const waBtn = el('a', {
      class: 'btn btn--block',
      href: '#',
      target: '_blank',
      rel: 'noopener',
      html: `${iconSvg('wa')}<span class="btn__label">Enviar mi ficha por WhatsApp</span>`
    });

    const clearBtn = el('button', {
      type: 'button',
      class: 'btn btn--ghost btn--sm btn--block',
      text: 'Borrar mis datos'
    });

    clearBtn.addEventListener('click', () => {
      NX.Snapshot.clear();
      NX.toast('Ficha borrada de este navegador.');
    });

    actions.replaceChildren(waBtn, clearBtn);
    NX.bindWhatsApp(waBtn, () => fichaMessage());

    NX.Snapshot.subscribe((data) => {
      const rows = fichaRows(data);
      const { filled, total } = NX.Snapshot.completeness();

      if (meterFill) meterFill.style.setProperty('--p', String(filled / total));
      if (meterLabel) meterLabel.textContent = `${filled} de ${total} datos recogidos`;

      if (!rows.length) {
        rowsBox.replaceChildren(el('p', {
          class: 'snapshot__empty',
          text: 'Todavía está vacía. Usa cualquier herramienta y los resultados aparecerán aquí.'
        }));
        waBtn.setAttribute('aria-disabled', 'false');
        $('.btn__label', waBtn).textContent = 'Escribir por WhatsApp';
        clearBtn.hidden = true;
        return;
      }

      clearBtn.hidden = false;
      $('.btn__label', waBtn).textContent = 'Enviar mi ficha por WhatsApp';

      rowsBox.replaceChildren(el('dl', { class: 'snapshot__rows' }, rows.flatMap(([k, v]) => [
        el('div', { class: 'snapshot__row' }, [
          el('dt', { text: k }),
          el('dd', { text: v })
        ])
      ])));
    });
  }

  /* ───────────────  ENLACES DE WHATSAPP CON CONTEXTO  ──────────────── */
  /* Cualquier enlace con data-wa-context recoge la ficha al pulsarlo. */
  function initContextLinks() {
    $$('[data-wa-context]').forEach((node) => {
      node.target = '_blank';
      node.rel = 'noopener';
      NX.bindWhatsApp(node, () => {
        const data = NX.Snapshot.get();
        return NX.buildWhatsAppMessage({
          intro: node.dataset.waContext,
          rows: fichaRows(data)
        });
      });
    });
  }

  /* ─────────────────────────────  INICIO  ──────────────────────────── */
  document.documentElement.classList.add('js');

  /**
   * Los bloques que se pintan desde content.js no existen cuando el navegador
   * resuelve el #ancla de la URL. Tras pintar, se vuelve a colocar el foco.
   */
  function restoreHash() {
    if (!location.hash || location.hash.length < 2) return;
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!target) return;

    const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 60;
    const top = target.getBoundingClientRect().top + window.scrollY - header - 24;
    window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
  }

  document.addEventListener('DOMContentLoaded', () => {
    Render.init();
    document.dispatchEvent(new CustomEvent('nx:rendered'));
    restoreHash();

    initNav();
    initReveal();
    initStickyCta();
    initFicha();
    initContextLinks();
  });

  /* Expuesto para que las herramientas puedan reutilizar el mensaje maestro. */
  window.NXFicha = { message: fichaMessage, rows: fichaRows };
})();
