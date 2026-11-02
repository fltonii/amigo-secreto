// Faz o sorteio e grava src/pairs.generated.ts. Rode com `pnpm sortear`.
// ATENÇÃO: refazer o sorteio muda o resultado de todo mundo.
import { randomInt } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import { drawPairs, encodePairs, validatePairs } from '../src/lib/draw.ts'
import { PARTICIPANTS } from '../src/participants.ts'

const pairs = drawPairs(PARTICIPANTS, (max) => randomInt(max))

const problems = validatePairs(PARTICIPANTS, pairs)
if (problems.length > 0) {
  console.error('Sorteio inválido (não foi salvo):\n- ' + problems.join('\n- '))
  process.exit(1)
}

const output = new URL('../src/pairs.generated.ts', import.meta.url)
writeFileSync(
  output,
  `// Gerado por \`pnpm sortear\`. Não edite à mão.\n` +
    `// Contém o sorteio em base64 (JSON { quem dá: quem recebe }).\n` +
    `export const PAIRS_B64 =\n  '${encodePairs(pairs)}'\n`,
)

console.log(`Sorteio feito para ${PARTICIPANTS.length} pessoas e salvo em src/pairs.generated.ts.`)
console.log('Faça commit e push para publicar. (Para desfazer antes do commit: git checkout src/pairs.generated.ts)')
