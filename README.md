# Llegim! 📖

PWA de lectura para primaria (7-10 años) en castellano y catalán, hecha con Next.js (export estático) y que funciona offline.

## Modos
- **Comprensión**: lees un texto y respondes 5 preguntas (test o verdadero/falso). Cada partida usa un relato nuevo; en «Mis lecturas» puedes repetirlos y ver tu mejor nota.
- **Velocidad**: cronometra la lectura, calcula las palabras por minuto y hace 2 preguntas de control. El intento solo cuenta si las aciertas y la velocidad es realista (≤ 350 pal/min). Incluye un panel con la gráfica de evolución.
- **Ortografía**: rondas de 10 ejercicios que mezclan «elige la buena», «completa la letra» y «caza el error», con prioridad para las categorías en las que fallas más.

El progreso se guarda en el dispositivo (localStorage), con perfiles para varios niños.

## Comandos
```bash
pnpm dev               # desarrollo (valida y empaqueta el contenido antes de arrancar)
pnpm build             # export estático a out/ + service worker offline (out/sw.js)
pnpm start             # sirve out/
pnpm validate:content  # valida relatos y ejercicios sin escribir nada
pnpm test              # tests de la lógica (vitest)
```

## Contenido
- `content/stories/{es,ca}/*.json`: un relato por archivo (50 por idioma). El esquema está en `lib/schema.ts`.
- `content/spelling/{es,ca}.json`: ejercicios de ortografía.
- `scripts/content.ts` valida el contenido y genera `lib/generated/*.json` (ignorado en git).

Para añadir un relato, crea `content/stories/es/es-051.json` siguiendo el esquema y ejecuta `pnpm validate:content`.
