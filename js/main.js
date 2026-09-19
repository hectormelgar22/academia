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

    const header = $('.site-header');

    const setOpen = (open) => {
      toggle.setAttribute('aria-expanded', String(open));
      panel.dataset.open = String(open);
      document.body.style.overflow = open ? 'hidden' : '';
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');

      /* Con el menú abierto el fondo es papel: la cabecera no puede seguir
         en su versión clara sobre vídeo o se volvería ilegible. */
      if (header) {
        header.dataset.menuOpen = String(open);
        if (open) header.dataset.over = 'false';
      }
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

  /* ─────────────  ACCESOS RÁPIDOS: BARRA MÓVIL Y WHATSAPP  ─────────── */
  /* Ambos aparecen cuando la portada deja de verse, para no tapar el vídeo
     ni competir con las llamadas a la acción del encabezado. */
  function initFloatingCtas() {
    const piezas = [$('.sticky-cta'), $('.wa-float')].filter(Boolean);
    if (!piezas.length) return;

    const sentinel = $('.hero-cine') || $('.page-head');
    if (!sentinel || !('IntersectionObserver' in window)) {
      piezas.forEach((p) => { p.dataset.show = 'true'; });
      return;
    }

    new IntersectionObserver(([entry]) => {
      piezas.forEach((p) => { p.dataset.show = String(!entry.isIntersecting); });
    }, { threshold: 0 }).observe(sentinel);
  }

  /* ────────────────────  MAPA BAJO PETICIÓN  ───────────────────────── */
  /* No se carga nada de terceros hasta que el visitante lo pide. */
  function initMap() {
    const caja = $('[data-map]');
    if (!caja) return;

    const boton = $('[data-map-load]', caja);
    if (!boton) return;

    boton.addEventListener('click', () => {
      const marco = el('iframe', {
        src: caja.dataset.embed,
        title: 'Mapa con la ubicación de la academia',
        loading: 'lazy',
        referrerpolicy: 'no-referrer-when-downgrade'
      });
      caja.replaceChildren(marco);
      NX.toast('Mapa cargado desde OpenStreetMap.');
    });
  }


  /* ───────────────────  VÍDEO DE PORTADA  ─────────────────────────── */
  /* El póster se ve siempre; el vídeo sólo se descarga cuando aporta:
     no con movimiento reducido, ni con ahorro de datos, ni en 2G. */
  function initHeroVideo() {
    const video = $('[data-hero-video]');
    if (!video) return;

    const toggle = $('[data-hero-toggle]');
    const conexion = navigator.connection || {};
    const ahorro = conexion.saveData === true || /(^|-)2g$/.test(conexion.effectiveType || '');

    if (NX.reduced() || ahorro) return;

    const estrecho = window.matchMedia('(max-width: 48rem)').matches;
    video.src = estrecho ? video.dataset.srcSmall : video.dataset.src;
    video.load();

    const arrancar = () => video.play().catch(() => { /* el navegador puede negarse */ });

    video.addEventListener('canplay', () => {
      video.dataset.playing = 'true';
      if (toggle) toggle.hidden = false;
      arrancar();
    }, { once: true });

    video.addEventListener('error', () => {
      video.dataset.playing = 'false';
      if (toggle) toggle.hidden = true;
    });

    if (!toggle) return;

    const iconoPausa = $('[data-icon-pause]', toggle);
    const iconoPlay = $('[data-icon-play]', toggle);

    /* toggleAttribute y no .hidden: `hidden` es una propiedad de HTMLElement
       y estos iconos son SVG, donde asignarla no hace absolutamente nada. */
    const pintar = (enMarcha) => {
      iconoPausa.toggleAttribute('hidden', !enMarcha);
      iconoPlay.toggleAttribute('hidden', enMarcha);
      toggle.setAttribute('aria-label', enMarcha ? 'Pausar el vídeo de fondo' : 'Reanudar el vídeo de fondo');
    };

    toggle.addEventListener('click', () => {
      if (video.paused) { arrancar(); } else { video.pause(); }
    });

    video.addEventListener('play', () => pintar(true));
    video.addEventListener('pause', () => pintar(false));
  }

  /* ──────────────  CABECERA SOBRE EL VÍDEO  ───────────────────────── */
  /* Arranca en blanco desde el HTML para que no parpadee, y vuelve al
     papel en cuanto la portada deja de cubrir la franja de la cabecera. */
  function initHeaderOverHero() {
    const header = $('.site-header');
    const hero = $('.hero-cine');
    if (!header || !hero) return;

    if (!('IntersectionObserver' in window)) { header.dataset.over = 'false'; return; }

    const alto = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 60;

    new IntersectionObserver(([entrada]) => {
      if (header.dataset.menuOpen === 'true') return;
      header.dataset.over = String(entrada.isIntersecting);
    }, { rootMargin: `-${Math.round(alto)}px 0px 0px 0px`, threshold: 0 }).observe(hero);
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
    initHeaderOverHero();
    initHeroVideo();
    initReveal();
    initFloatingCtas();
    initMap();
    initFicha();
    initContextLinks();
  });

  /* Expuesto para que las herramientas puedan reutilizar el mensaje maestro. */
  window.NXFicha = { message: fichaMessage, rows: fichaRows };
})();
