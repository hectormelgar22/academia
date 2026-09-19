/**
 * render.js — Pinta en el HTML todo lo que vive en content.js.
 *
 * Cada bloque se declara con data-render="nombre" y, si hace falta, un
 * data-limit o data-filter. Así el HTML no guarda información comercial.
 */

const Render = (() => {
  'use strict';

  const { el, $, $$, iconSvg, esc } = NX;

  /* ────────────────────  ENLACES Y DATOS DE CONTACTO  ──────────────── */
  function bindings(root = document) {
    const { contact, brand } = ACADEMY;

    const values = {
      'brand.name': brand.name,
      'brand.claim': brand.claim,
      'brand.descriptor': brand.descriptor,
      'contact.phone': contact.phoneDisplay,
      'contact.email': contact.email,
      'contact.street': contact.address.street,
      'contact.city': `${contact.address.postalCode} ${contact.address.city}`,
      'contact.district': contact.address.district,
      'stats.years': String(ACADEMY.stats.yearsOpen),
      'stats.students': `+${ACADEMY.stats.studentsHelped}`,
      'stats.group': String(ACADEMY.stats.maxGroupSize),
      'stats.teachers': String(ACADEMY.stats.teachers),
      'stats.rating': NX.decimal(ACADEMY.stats.rating, 1),
      'stats.reviews': String(ACADEMY.stats.reviews),
      'year': String(new Date().getFullYear())
    };

    $$('[data-academy]', root).forEach((node) => {
      const value = values[node.dataset.academy];
      if (value !== undefined) node.textContent = value;
    });

    $$('[data-link]', root).forEach((node) => {
      switch (node.dataset.link) {
        case 'tel':   node.href = `tel:${contact.phoneHref}`; break;
        case 'mail':  node.href = `mailto:${contact.email}`; break;
        case 'maps':  node.href = contact.mapsUrl; break;
        case 'wa': {
          const custom = node.dataset.waIntro;
          node.href = NX.waUrl(custom
            ? NX.buildWhatsAppMessage({ intro: custom })
            : ACADEMY.messages.generic);
          node.rel = 'noopener';
          node.target = '_blank';
          break;
        }
      }
    });

    /* Horario en el pie y en contacto */
    $$('[data-render="hours"]', root).forEach((node) => {
      node.replaceChildren(...ACADEMY.hours.map((h) => el('li', {}, [
        el('span', { text: h.label }),
        el('span', { class: 'tnum', text: h.value })
      ])));
    });
  }

  /* ───────────────────────────  SÍNTOMAS  ──────────────────────────── */
  function symptoms(node) {
    node.replaceChildren(...ACADEMY.symptoms.map((item, i) => el('div', {
      class: 'symptom',
      'data-reveal': '',
      style: `--reveal-delay:${i * 60}ms`
    }, [
      el('p', { class: 'symptom__quote', text: item.quote }),
      el('p', { class: 'symptom__note', text: item.note })
    ])));
  }

  /* ────────────────────────────  MÉTODO  ───────────────────────────── */
  function method(node) {
    const brief = node.dataset.brief === 'true';
    node.replaceChildren(...ACADEMY.method.map((step) => el('article', { class: 'method__item' }, [
      el('div', {}, [
        el('p', { class: 'method__step', text: step.step }),
        el('p', { class: 'method__time', text: step.time })
      ]),
      el('div', { class: 'method__body' }, [el('h3', { class: 'method__title', text: step.title })]),
      brief ? null : el('p', { class: 'method__text', text: step.text })
    ])));
  }

  /* ───────────────────────────  PROGRAMAS  ─────────────────────────── */
  function programs(node) {
    const only = node.dataset.filter;
    const items = only === 'featured'
      ? ACADEMY.programs.filter((p) => p.featured)
      : ACADEMY.programs;

    node.replaceChildren(...items.map((program) => el('article', {
      class: 'program',
      id: `programa-${program.id}`
    }, [
      el('div', {}, [
        program.image && node.dataset.photos === 'true' ? programShot(program) : null,
        el('h3', { class: 'program__name', text: program.name }),
        el('p', { class: 'program__ages', text: program.ages })
      ]),
      el('div', {}, [
        el('p', { class: 'program__lead', text: program.lead }),
        el('p', { class: 'program__body', text: program.body }),
        el('ul', { class: 'chips' }, program.subjects.map((s) => el('li', { class: 'chip', text: s })))
      ]),
      el('div', { class: 'program__meta' }, [
        el('dl', { class: 'grid', style: 'gap:.75rem' }, [
          metaRow('Grupo', program.groupSize),
          metaRow('Frecuencia', program.frequency),
          metaRow('Duración', program.duration),
          metaRow('Modalidad', NX.list(program.modalities.map(NX.modalityName)))
        ]),
        el('a', {
          class: 'link-arrow',
          href: `contacto.html?curso=${encodeURIComponent(program.name)}`,
          html: `Ver programa${iconSvg('arrow', { size: 14 })}`
        })
      ])
    ])));
  }

  function programShot(program) {
    return el('div', { class: 'shot shot--photo', style: 'margin-bottom:var(--s-4)' }, [
      el('img', {
        src: `assets/images/${program.image}.webp`,
        srcset: `assets/images/${program.image}-640.webp 640w, assets/images/${program.image}.webp 1200w`,
        sizes: '(min-width: 60rem) 24rem, 90vw',
        width: 1200, height: 900,
        alt: program.imageAlt || program.name,
        loading: 'lazy', decoding: 'async'
      })
    ]);
  }

  /** Índice de programas con foto para la portada: uno grande y el resto compactos. */
  function programCards(node) {
    const items = ACADEMY.programs.filter((p) => p.featured);

    node.replaceChildren(...items.map((program, i) => el('a', {
      class: `pcard${i === 0 ? ' pcard--lead' : ''}`,
      href: `cursos.html#programa-${program.id}`,
      'data-reveal': '',
      style: `--reveal-delay:${i * 60}ms`
    }, [
      el('div', { class: 'shot' }, [
        el('img', {
          src: `assets/images/${program.image}.webp`,
          srcset: `assets/images/${program.image}-640.webp 640w, assets/images/${program.image}.webp 1200w`,
          sizes: i === 0 ? '(min-width: 58rem) 56rem, 92vw' : '(min-width: 58rem) 18rem, 92vw',
          width: 1200, height: 900,
          alt: program.imageAlt || program.name,
          loading: i === 0 ? 'eager' : 'lazy', decoding: 'async'
        })
      ]),
      el('div', { class: 'pcard__body' }, [
        el('h3', { class: 'pcard__name', text: program.name }),
        el('p', { class: 'pcard__ages', text: `${program.ages} · ${program.groupSize}` }),
        i === 0 ? el('p', { class: 'pcard__lead', text: program.lead }) : null
      ])
    ])));
  }

  function metaRow(label, value) {
    return el('div', { class: 'meta-row' }, [
      el('dt', { text: label }),
      el('dd', { text: value })
    ]);
  }

  /* ──────────────────────────  PROFESORADO  ────────────────────────── */
  const ACCENT = { azul: '#15507f', tinta: '#171c26', rojo: '#ce4b21' };

  /**
   * Retrato de plancha: silueta a línea, trama de puntos y una segunda
   * plancha desplazada, como una impresión mal registrada. Cada profesor
   * recibe una geometría distinta para que los seis no parezcan clones.
   */
  function portrait(teacher, index) {
    const accent = ACCENT[teacher.accent] || ACCENT.azul;
    const uid = `p-${teacher.id}`;
    const head = 70 + (index % 3) * 6;               // 70 · 76 · 82
    const shoulder = 128 + ((index + 1) % 3) * 16;   // ancho de hombros
    const tilt = [-2.5, 1.8, -1.2, 2.4, -1.8, 1.2][index % 6];
    const dot = 1.5 + (index % 2) * 0.5;
    const cy = 236;

    const silhouette = `M ${200 - shoulder} 470
      C ${200 - shoulder} ${372 - (index % 2) * 10}, ${200 - shoulder * 0.52} 338, 200 338
      C ${200 + shoulder * 0.52} 338, ${200 + shoulder} ${372 - (index % 2) * 10}, ${200 + shoulder} 470 Z`;

    return `
<svg viewBox="0 0 400 500" role="img" aria-label="Retrato ilustrado de ${esc(teacher.name)}" preserveAspectRatio="xMidYMid slice">
  <defs>
    <pattern id="${uid}-dots" width="9" height="9" patternUnits="userSpaceOnUse">
      <circle cx="4.5" cy="4.5" r="${dot}" fill="${accent}" opacity=".55"/>
    </pattern>
    <pattern id="${uid}-rules" width="400" height="25" patternUnits="userSpaceOnUse">
      <line x1="0" y1="24.5" x2="400" y2="24.5" stroke="#171c26" stroke-width="1" opacity=".07"/>
    </pattern>
    <clipPath id="${uid}-clip">
      <circle cx="200" cy="${cy}" r="${head}"/>
      <path d="${silhouette}"/>
    </clipPath>
  </defs>

  <rect width="400" height="500" fill="#f4ecdf"/>
  <rect width="400" height="500" fill="url(#${uid}-rules)"/>

  <g transform="rotate(${tilt} 200 300)">
    <g transform="translate(-7 5)" opacity=".16">
      <circle cx="200" cy="${cy}" r="${head}" fill="${accent}"/>
      <path d="${silhouette}" fill="${accent}"/>
    </g>
    <g clip-path="url(#${uid}-clip)">
      <rect width="400" height="500" fill="url(#${uid}-dots)"/>
    </g>
    <g fill="none" stroke="#171c26" stroke-width="1.5">
      <circle cx="200" cy="${cy}" r="${head}"/>
      <path d="${silhouette}"/>
    </g>
  </g>

  <line x1="0" y1="428" x2="400" y2="428" stroke="#171c26" stroke-width="1.5"/>
  <text x="26" y="478" fill="#171c26" font-family="Fraunces, Georgia, serif" font-size="46" font-weight="600" letter-spacing="-1">${esc(teacher.initials)}</text>
  <text x="374" y="474" fill="${accent}" text-anchor="end" font-family="Archivo, system-ui, sans-serif" font-size="14" font-weight="600" letter-spacing="1.4">${teacher.years} AÑOS</text>
</svg>`;
  }

  /** Foto real si la hay; si no, la plancha dibujada. */
  function portraitNode(teacher, index) {
    if (!teacher.photo) {
      return el('div', { class: 'teacher__portrait', html: portrait(teacher, index) });
    }
    const base = teacher.photo.replace(/\.webp$/, '');
    return el('div', { class: 'teacher__portrait shot shot--tall' }, [
      el('img', {
        src: teacher.photo,
        srcset: `${base}-420.webp 420w, ${teacher.photo} 800w`,
        sizes: '(min-width: 76rem) 22rem, (min-width: 48rem) 45vw, 90vw',
        width: 800, height: 1000,
        alt: teacher.photoAlt || teacher.name,
        loading: index < 3 ? 'eager' : 'lazy',
        decoding: 'async'
      })
    ]);
  }

  function teachers(node) {
    const limit = Number(node.dataset.limit) || ACADEMY.teachers.length;
    node.replaceChildren(...ACADEMY.teachers.slice(0, limit).map((teacher, i) => el('article', {
      class: 'teacher',
      id: `profesor-${teacher.id}`,
      'data-reveal': '',
      style: `--reveal-delay:${(i % 3) * 70}ms`
    }, [
      portraitNode(teacher, i),
      el('div', {}, [
        el('h3', { class: 'teacher__name', text: teacher.name }),
        el('p', { class: 'teacher__role', text: teacher.role }),
        el('p', { class: 'teacher__years', text: `${teacher.years} años dando clase` }),
        node.dataset.brief === 'true' ? null : el('p', { class: 'teacher__bio', text: teacher.bio })
      ])
    ])));
  }

  /* ─────────────────────────  TESTIMONIOS  ─────────────────────────── */
  function testimonials(node) {
    const limit = Number(node.dataset.limit) || ACADEMY.testimonials.length;
    node.replaceChildren(...ACADEMY.testimonials.slice(0, limit).map((item, i) => el('figure', {
      class: 'quote',
      'data-reveal': '',
      style: `--reveal-delay:${(i % 2) * 80}ms`
    }, [
      el('blockquote', { text: `«${item.text}»` }),
      el('figcaption', {}, [
        el('span', { class: 'avatar', text: item.initials, 'aria-hidden': 'true' }),
        el('span', {}, [
          el('span', { class: 'quote__who', style: 'display:block', text: item.author }),
          el('span', { class: 'quote__rel', text: item.relation })
        ])
      ])
    ])));
  }

  /* ───────────────────────────  PREGUNTAS  ─────────────────────────── */
  function faqs(node) {
    const limit = Number(node.dataset.limit) || ACADEMY.faqs.length;
    node.replaceChildren(...ACADEMY.faqs.slice(0, limit).map((item, i) => {
      const panelId = `faq-panel-${i}`;
      const btnId = `faq-btn-${i}`;
      const wrapper = el('div', { class: 'acc-item', 'data-open': 'false' });

      const button = el('button', {
        class: 'acc-btn',
        type: 'button',
        id: btnId,
        'aria-expanded': 'false',
        'aria-controls': panelId
      }, [
        el('span', { text: item.q }),
        el('span', { class: 'acc-btn__icon', 'aria-hidden': 'true' })
      ]);

      const panel = el('div', {
        class: 'acc-panel',
        id: panelId,
        role: 'region',
        'aria-labelledby': btnId
      }, [el('div', {}, [el('p', { text: item.a })])]);

      button.addEventListener('click', () => {
        const open = wrapper.dataset.open === 'true';
        wrapper.dataset.open = String(!open);
        button.setAttribute('aria-expanded', String(!open));
      });

      wrapper.append(button, panel);
      return wrapper;
    }));
  }

  /* ─────────────────────  ÍNDICE DE HERRAMIENTAS  ──────────────────── */
  function toolIndex(node) {
    const exclude = (node.dataset.exclude || '').split(',').filter(Boolean);
    const limit = Number(node.dataset.limit) || ACADEMY.tools.length;

    node.replaceChildren(...ACADEMY.tools
      .filter((tool) => !exclude.includes(tool.id))
      .slice(0, limit)
      .map((tool) => el('a', { class: 'tool-link', href: tool.href }, [
        el('div', {}, [
          el('h3', { class: 'tool-link__name', text: tool.name }),
          el('p', { class: 'tool-link__detail', style: 'margin-top:.35rem', text: `${tool.time}` })
        ]),
        el('div', {}, [
          el('p', { class: 'tool-link__claim', text: tool.claim }),
          node.dataset.brief === 'true' ? null : el('p', { class: 'tool-link__detail', text: tool.detail })
        ]),
        el('span', { class: 'tool-link__go', html: `Abrir${iconSvg('arrow', { size: 14 })}` })
      ])));
  }


  /* ──────────────  TARJETAS DE HERRAMIENTA CON MUESTRA  ──────────────── */
  /* Cada tarjeta enseña en miniatura lo que la herramienta devuelve.
     Es lo que convierte un enlace en algo que apetece pulsar. */

  const MUESTRAS = {
    diagnostico: `
      <div class="tprev__bar"><span style="--p:.62"></span></div>
      <p class="tprev__q">¿Dónde se rompe exactamente?</p>
      <div class="tprev__chips">
        <span>No entiende la explicación</span>
        <span data-on>Suspende aunque estudia</span>
        <span>No le da tiempo</span>
      </div>`,

    nota: `
      <p class="tprev__num">7,4</p>
      <p class="tprev__foot">es lo que necesitas en lo que queda</p>
      <div class="tprev__weights">
        <i style="--w:55" data-s="ok">6,2</i>
        <i style="--w:30" data-s="ok">8,0</i>
        <i style="--w:15" data-s="pend">?</i>
      </div>`,

    planner: `
      <div class="tprev__week">
        <div class="tprev__day"><b>L</b><i style="--h:60"></i><i style="--h:34" data-alt></i></div>
        <div class="tprev__day"><b>M</b><i style="--h:44"></i></div>
        <div class="tprev__day"><b>X</b><i style="--h:60" data-alt></i><i style="--h:44"></i></div>
        <div class="tprev__day"><b>J</b><i style="--h:34"></i></div>
      </div>
      <p class="tprev__foot">Bloques de 45 min, lo difícil primero</p>`,

    examen: `
      <div class="tprev__phases">
        <div><span>Días 1–4</span><b>Conceptos base</b></div>
        <div><span>Días 5–9</span><b>Problemas tipo</b></div>
        <div data-on><span>Día 10</span><b>Simulacro con reloj</b></div>
      </div>`,

    precio: `
      <p class="tprev__num">140–160<small> €/mes</small></p>
      <p class="tprev__foot">Grupo de 6 · 2 días · 90 min</p>`,

    modalidad: `
      <div class="tprev__chips tprev__chips--big">
        <span data-on>Grupo reducido</span>
        <span>Individual</span>
      </div>
      <p class="tprev__foot">Y dice el grupo si es lo que encaja</p>`,

    plazas: `
      <div class="tprev__slots">
        <div><b>Matemáticas · 3.º ESO</b><span class="tprev__dots"><i data-t></i><i data-t></i><i data-t></i><i data-t></i><i></i><i></i></span></div>
        <div><b>Química · 2.º Bach</b><span class="tprev__dots"><i data-t></i><i data-t></i><i data-t></i><i></i></span></div>
      </div>
      <p class="tprev__foot">2 plazas libres esta semana</p>`
  };

  function toolCards(node) {
    const limit = Number(node.dataset.limit) || 4;
    const items = ACADEMY.tools.slice(0, limit);

    node.replaceChildren(...items.map((tool, i) => el('a', {
      class: 'tcard',
      href: tool.href,
      'data-reveal': '',
      style: `--reveal-delay:${i * 70}ms`
    }, [
      el('div', { class: `tprev tprev--${tool.id}`, 'aria-hidden': 'true', html: MUESTRAS[tool.id] || '' }),
      el('div', { class: 'tcard__body' }, [
        el('h3', { class: 'tcard__name', text: tool.name }),
        el('p', { class: 'tcard__claim', text: tool.claim })
      ]),
      el('div', { class: 'tcard__foot' }, [
        el('span', { class: 'tcard__time', text: tool.time }),
        el('span', { class: 'tcard__go', html: `Abrir${iconSvg('arrow', { size: 14 })}` })
      ])
    ])));
  }


  /* ──────────────────────  TABLA DE PRECIOS  ─────────────────────────── */
  /* Se calcula con el mismo motor que la calculadora: si cambias una tarifa
     en content.js, la tabla y la herramienta no pueden contradecirse. */
  function priceTable(node) {
    if (typeof Pricing === 'undefined') return;

    const combinaciones = [
      { modalityId: 'grupo',      frequency: 2, duration: 90, etiqueta: '2 días · 90 min' },
      { modalityId: 'grupo',      frequency: 1, duration: 60, etiqueta: '1 día · 60 min' },
      { modalityId: 'individual', frequency: 1, duration: 60, etiqueta: '1 día · 60 min' },
      { modalityId: 'online',     frequency: 2, duration: 90, etiqueta: '2 días · 90 min' }
    ];

    const cabecera = el('tr', {}, [
      el('th', { scope: 'col', text: 'Curso' }),
      ...combinaciones.map((c) => el('th', { scope: 'col' }, [
        el('span', { style: 'display:block', text: NX.modalityName(c.modalityId) }),
        el('span', { style: 'display:block;font-weight:400;text-transform:none;letter-spacing:0;color:var(--tx-3)', text: c.etiqueta })
      ]))
    ]);

    const filas = ACADEMY.levels.map((level) => el('tr', {}, [
      el('th', { scope: 'row', style: 'text-transform:none;letter-spacing:0;font-size:var(--step--1);color:var(--tx);font-weight:500', text: level.name }),
      ...combinaciones.map((c) => el('td', {
        class: c.modalityId === 'grupo' && c.frequency === 2 ? 'is-strong' : '',
        text: Pricing.estimate({ ...c, levelId: level.id }).text.replace(' €/mes', ' €')
      }))
    ]));

    node.replaceChildren(
      el('thead', {}, [cabecera]),
      el('tbody', {}, filas)
    );
  }

  /* ─────────────────────  DESCUENTOS Y CONDICIONES  ──────────────────── */
  function priceTerms(node) {
    node.replaceChildren(...ACADEMY.pricing.discounts.map((d) => el('div', { class: 'meta-row' }, [
      el('dt', { text: d.label }),
      el('dd', { text: d.value })
    ])));
  }


  /* ─────────────────────────────  RECURSOS  ──────────────────────────── */
  /* base permite que estos bloques funcionen igual en la raíz y dentro de
     la carpeta /recursos, donde las rutas relativas cambian. */
  function articleCard(article, base, { grande = false, ansioso = false } = {}) {
    const autor = ACADEMY.teachers.find((t) => t.id === article.author);

    return el('a', {
      class: `acard${grande ? ' acard--lead' : ''}`,
      href: `${base}recursos/${article.slug}.html`
    }, [
      el('div', { class: 'shot' }, [
        el('img', {
          src: `${base}assets/images/${article.image}.webp`,
          srcset: `${base}assets/images/${article.image}-640.webp 640w, ${base}assets/images/${article.image}.webp 1200w`,
          sizes: grande ? '(min-width: 58rem) 38rem, 92vw' : '(min-width: 58rem) 22rem, 92vw',
          width: 1200, height: 675,
          alt: article.imageAlt,
          loading: ansioso ? 'eager' : 'lazy',
          decoding: 'async'
        })
      ]),
      el('div', { class: 'acard__body' }, [
        el('p', { class: 'acard__meta' }, [
          el('span', { class: 'tag', text: article.tag }),
          el('span', { text: `${article.minutes} min de lectura` })
        ]),
        el('h3', { class: 'acard__title', text: article.title }),
        el('p', { class: 'acard__excerpt', text: article.excerpt }),
        autor ? el('p', { class: 'acard__author', text: `${autor.name} · ${article.dateText}` }) : null
      ])
    ]);
  }

  function articleList(node) {
    const base = node.dataset.base || '';
    const limite = Number(node.dataset.limit) || ACADEMY.articles.length;
    const excluir = node.dataset.exclude || '';
    const destacar = node.dataset.lead === 'true';

    const items = ACADEMY.articles
      .filter((a) => a.slug !== excluir)
      .slice(0, limite);

    node.replaceChildren(...items.map((a, i) =>
      articleCard(a, base, { grande: destacar && i === 0, ansioso: i === 0 })));
  }

  /* ────────────────────────────  ARRANQUE  ─────────────────────────── */
  const RENDERERS = {
    symptoms, method, programs, teachers, testimonials, faqs,
    'program-cards': programCards,
    'tool-cards': toolCards,
    'article-list': articleList,
    'price-table': priceTable,
    'price-terms': priceTerms,
    'tool-index': toolIndex
  };

  function init(root = document) {
    bindings(root);
    $$('[data-render]', root).forEach((node) => {
      const fn = RENDERERS[node.dataset.render];
      if (fn) fn(node);
    });
  }

  return { init, bindings, portrait };
})();
