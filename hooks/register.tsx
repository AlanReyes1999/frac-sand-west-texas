import { atom, read, update } from 'claude-code'
import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'

// Atardecer del oeste de Texas: tierra oscura, texto color arena, acento naranja de ocaso.
const { theme, problems } = makeColors({
  label: 'Frac sand, West Texas',
  only: 'dark',
  roles: { accent: '#e08a3c', danger: '#d9534a', success: '#7fae5a', warning: '#e3b23c', pro: '#b48ad0' },
  dark: {
    gray: {
      anchors: {
        'surface-0': '#1b1512',
        'surface-1': '#221a16',
        'surface-2': '#281f1a',
        'surface-3': '#2c221d',
        'text-primary': '#f3e7d3',
        'text-secondary': '#d3c5ae',
        'text-muted': '#ad9f89',
      },
    },
  },
})

const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: 'permian', glass: { blur: 6, tint: '#1b1512', opacity: 0.45 } },
}

// Nivel 0 a 20: un paso por cada 5 % de la ventana de contexto.
const STEPS = 20
const MIN_TRUCKS = 2
const level = atom({ plugin: 'frac-sand-west-texas', key: 'level' } as const, 0)

const toLevel = (percent: number | undefined): number =>
  Math.max(0, Math.min(STEPS, Math.round(((percent ?? 0) / 100) * STEPS)))

// Azar estable por indice: cada camion conserva su sitio entre redibujos.
const rand = (index: number, salt: number): number => {
  const x = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453

  return x - Math.floor(x)
}

const HORIZON = 680

const pumpjack = (x: number, scale: number, index: number): string =>
  `<g transform="translate(${x} ${HORIZON + 6}) scale(${scale})" stroke="#150e0d" fill="#150e0d" stroke-linecap="round">
<path d="M-14 0 L0 -44 L14 0" fill="none" stroke-width="4"/>
<path d="M-46 0 L30 0" stroke-width="4"/>
<circle cx="-30" cy="-12" r="10" stroke="none"/>
<path d="M-34 -42 L-30 -12" stroke-width="3"/>
<path d="M36 -30 L36 0" stroke-width="2"/>
<g transform="translate(0 -44)"><g class="rock rock${index}">
<path d="M-38 0 L32 0" stroke-width="5"/>
<path d="M30 -8 L40 -6 L42 14 L30 14 Z" stroke="none"/>
</g></g>
</g>`

const SKY = `
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#17152c"/>
<stop offset="0.3" stop-color="#3a2548"/>
<stop offset="0.48" stop-color="#8a3f4a"/>
<stop offset="0.6" stop-color="#d4673a"/>
<stop offset="0.68" stop-color="#f2a654"/>
</linearGradient>
<linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#3a2820"/>
<stop offset="1" stop-color="#150e0b"/>
</linearGradient>
<radialGradient id="sun">
<stop offset="0" stop-color="#ffe2a8" stop-opacity="0.9"/>
<stop offset="0.3" stop-color="#ffb866" stop-opacity="0.45"/>
<stop offset="1" stop-color="#f2a654" stop-opacity="0"/>
</radialGradient>
<linearGradient id="beam" x1="0" y1="0" x2="1" y2="0">
<stop offset="0" stop-color="#ffe9b0" stop-opacity="0.55"/>
<stop offset="1" stop-color="#ffe9b0" stop-opacity="0"/>
</linearGradient>
<linearGradient id="sand" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#ecc27a"/>
<stop offset="1" stop-color="#b9853f"/>
</linearGradient>
<radialGradient id="lamp">
<stop offset="0" stop-color="#fff3cf"/>
<stop offset="0.3" stop-color="#ffd27a" stop-opacity="0.6"/>
<stop offset="1" stop-color="#ffd27a" stop-opacity="0"/>
</radialGradient>
</defs>
<rect width="1600" height="1000" fill="url(#sky)"/>
<g fill="#f6ead2">
<circle cx="120" cy="80" r="1.5" opacity="0.7"/><circle cx="350" cy="170" r="1.1" opacity="0.5"/>
<circle cx="610" cy="60" r="1.6" opacity="0.7"/><circle cx="860" cy="140" r="1.1" opacity="0.45"/>
<circle cx="1090" cy="70" r="1.5" opacity="0.7"/><circle cx="1300" cy="180" r="1.2" opacity="0.5"/>
<circle cx="1490" cy="90" r="1.6" opacity="0.7"/><circle cx="1560" cy="240" r="1" opacity="0.4"/>
</g>
<circle cx="470" cy="${HORIZON}" r="300" fill="url(#sun)"/>
<circle cx="470" cy="${HORIZON + 4}" r="58" fill="#ffd89a"/>
<path d="M0 ${HORIZON} L0 640 L90 640 L110 622 L260 622 L285 648 L420 ${HORIZON} Z" fill="#3b2233"/>
<path d="M620 ${HORIZON} L680 652 L700 634 L860 634 L880 656 L960 ${HORIZON} Z" fill="#3b2233"/>
<path d="M1420 ${HORIZON} L1470 646 L1600 646 L1600 ${HORIZON} Z" fill="#3b2233"/>
<rect y="${HORIZON}" width="1600" height="${1000 - HORIZON}" fill="url(#ground)"/>
<g stroke="#150e0d" stroke-width="2" fill="none" opacity="0.8">
<path d="M0 ${HORIZON - 34} L1010 ${HORIZON - 34}"/>
<path d="M60 ${HORIZON} L60 ${HORIZON - 40} M300 ${HORIZON} L300 ${HORIZON - 40} M540 ${HORIZON} L540 ${HORIZON - 40} M780 ${HORIZON} L780 ${HORIZON - 40} M1010 ${HORIZON} L1010 ${HORIZON - 40}"/>
</g>
${pumpjack(170, 1.5, 0)}${pumpjack(760, 1.1, 1)}${pumpjack(980, 0.8, 2)}
<path d="M0 806 L1600 806 L1600 890 L0 890 Z" fill="#1d1513"/>
<path d="M0 848 L1600 848" stroke="#c9a15a" stroke-width="2.5" stroke-dasharray="46 40" opacity="0.55"/>
<path d="M0 808 L1600 808 M0 888 L1600 888" stroke="#6b5440" stroke-width="1.5" opacity="0.5"/>
<g fill="#150e0b">
<path d="M90 1000 Q96 960 80 930 Q104 956 106 1000 Z"/><path d="M96 1000 Q112 962 130 944 Q120 972 116 1000 Z"/>
<path d="M610 1000 Q616 966 602 942 Q624 962 626 1000 Z"/><path d="M618 1000 Q632 968 648 954 Q640 978 636 1000 Z"/>
<path d="M1380 1000 Q1386 962 1370 934 Q1394 958 1396 1000 Z"/><path d="M1388 1000 Q1402 966 1420 950 Q1410 976 1406 1000 Z"/>
</g>`

// Camion de arena visto de lado, mirando a la derecha, origen en el suelo.
const TRUCK = `
<path d="M74 -16 L170 -30 L170 0 L74 -8 Z" fill="url(#beam)"/>
<g fill="#110b0a">
<rect x="-84" y="-38" width="104" height="22" rx="10"/>
<path d="M-70 -18 L-56 -4 L-42 -18 Z M-30 -18 L-16 -4 L-2 -18 Z"/>
<rect x="-88" y="-14" width="112" height="4"/>
<rect x="26" y="-42" width="30" height="32" rx="3"/>
<rect x="54" y="-26" width="20" height="16" rx="2"/>
<rect x="22" y="-52" width="3" height="26"/>
<circle cx="-70" cy="-6" r="7"/><circle cx="-54" cy="-6" r="7"/><circle cx="32" cy="-6" r="7"/><circle cx="64" cy="-6" r="7"/>
</g>
<rect x="34" y="-38" width="16" height="10" rx="2" fill="#f2c27a" opacity="0.35"/>
<circle cx="74" cy="-14" r="9" fill="url(#lamp)"/>
<circle cx="-85" cy="-24" r="2.2" fill="#e5483f"/>
<g fill="#f2a23a"><circle cx="-60" cy="-39" r="1.4"/><circle cx="-32" cy="-39" r="1.4"/><circle cx="-4" cy="-39" r="1.4"/></g>`

const CSS = `
@keyframes rock { from { transform: rotate(-7deg); } to { transform: rotate(7deg); } }
@keyframes glow { 0%, 100% { opacity: 0.55; } 50% { opacity: 0.95; } }
.rock { animation: rock 7s ease-in-out infinite alternate; }
.rock1 { animation-duration: 9s; animation-delay: -3s; }
.rock2 { animation-duration: 8s; animation-delay: -5s; }
.site { animation: glow 9s ease-in-out infinite; }
.run { animation-timing-function: linear; animation-iteration-count: infinite; }
.sand { animation: rise 4s ease-out 1 backwards; }`

// Wellsite: cuatro silos de arena que se llenan con la ventana de contexto.
const silos = (now: number): string => {
  const width = 84
  const height = 320
  const base = HORIZON + 30
  const top = base - height
  const inner = height - 12
  const sand = Math.round(inner * Math.max(0.03, now / STEPS))
  const first = 1040
  const gap = 100
  const last = first + 3 * gap + width
  let out = ''

  for (let i = 0; i < 4; i++) {
    const x = first + i * gap
    out += `<path d="M${x + 8} ${base} L${x + 8} ${base + 62} M${x + width - 8} ${base} L${x + width - 8} ${base + 62}" stroke="#120c0b" stroke-width="5"/>`
    out += `<path d="M${x} ${base} L${x + width / 2} ${base + 44} L${x + width} ${base} Z" fill="#120c0b"/>`
    out += `<path d="M${x} ${top} Q${x + width / 2} ${top - 34} ${x + width} ${top} Z" fill="#120c0b"/>`
    out += `<rect x="${x}" y="${top}" width="${width}" height="${height}" rx="8" fill="#2a1d1a" stroke="#120c0b" stroke-width="4"/>`
    // La arena crece desde el fondo: el origen del grupo es la base del silo.
    out += `<g transform="translate(${x + 6} ${base - 6})"><g class="sand"><rect y="${-sand}" width="${width - 12}" height="${sand}" rx="4" fill="url(#sand)"/><rect y="${-sand}" width="${width - 12}" height="5" rx="2" fill="#f6d596"/></g></g>`

    for (let mark = 1; mark < 4; mark++) {
      const y = base - 6 - Math.round((inner * mark) / 4)
      out += `<path d="M${x + width - 22} ${y} L${x + width - 6} ${y}" stroke="#f3e7d3" stroke-width="2" opacity="0.45"/>`
    }
  }

  return `<path d="M${first - 90} ${base + 62} L${first + 10} ${top - 26}" stroke="#120c0b" stroke-width="7"/>
<path d="M${first} ${top - 28} L${last} ${top - 28}" stroke="#120c0b" stroke-width="6"/>
${out}
<path d="M${last + 60} ${base + 62} L${last + 60} ${top - 110} M${last + 44} ${base + 62} L${last + 60} ${top + 60} L${last + 76} ${base + 62}" stroke="#120c0b" stroke-width="5" fill="none"/>
<g class="site">
<circle cx="${last + 60}" cy="${top - 112}" r="20" fill="url(#lamp)"/>
<circle cx="${first}" cy="${top - 34}" r="14" fill="url(#lamp)"/>
<circle cx="${last}" cy="${top - 34}" r="14" fill="url(#lamp)"/>
</g>`
}

const trucks = (count: number): { rules: string; marks: string } => {
  let rules = ''
  let marks = ''

  for (let i = 0; i < count; i++) {
    // Pares: cargados hacia el wellsite, carril cercano. Impares: vacios de regreso.
    const isLoaded = i % 2 === 0
    const x = Math.round(80 + rand(i, 1) * 1440)
    const y = isLoaded ? 882 : 842
    const size = isLoaded ? 1 : 0.82
    const seconds = (55 + rand(i, 2) * 30).toFixed(1)
    const delay = (rand(i, 3) * 80).toFixed(1)
    const from = isLoaded ? -(x + 260) : -(1860 - x)
    const to = isLoaded ? 1860 - x : x + 260
    rules += `@keyframes t${i}{from{transform:translateX(${from}px)}to{transform:translateX(${to}px)}}`
    rules += `.t${i}{animation-name:t${i};animation-duration:${seconds}s;animation-delay:-${delay}s}`
    marks += `<g transform="translate(${x} ${y}) scale(${isLoaded ? size : -size} ${size})"><g class="run t${i}">${TRUCK}</g></g>`
  }

  return { rules, marks }
}

const scene = (now: number): string => {
  const { rules, marks } = trucks(MIN_TRUCKS + Math.round(now / 2))

  // Al redibujar, la arena sube desde el paso anterior hasta el nivel actual.
  const from = now > 0 ? ((now - 1) / now).toFixed(3) : '1'
  const rise = `@keyframes rise{from{transform:scaleY(${from})}to{transform:scaleY(1)}}`

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice"><style>${CSS}${rise}${rules}</style>${SKY}${silos(now)}${marks}</svg>`
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    const usage = await $.session.usage()
    await update($, level, () => toLevel(usage.context.percent))
    const set = await $.theme.set(LOOK)

    if (!set.isDrawn) {
      $.ui.status(set.reason)
    }

    return next(e)
  })

  // Solo redibuja cuando el contexto cruza un paso del 5 %.
  on('session.measure', async ($, e, next) => {
    const now = toLevel(e.context.percent)

    if (now !== (await read($, level))) {
      await update($, level, () => now)
    }

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, async ($, e, next) => {
    const isDrawn = e.surface === 'desktop' || e.surface === 'mobile'

    if (!isDrawn) {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)
    const now = await read($, level)

    return (
      <Svg
        source={scene(now)}
        alt={`Atardecer en el oeste de Texas: camiones de arena, pumpjacks y silos al ${now * 5} %`}
      />
    )
  })
}
