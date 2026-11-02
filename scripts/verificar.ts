// Decodifica o sorteio salvo e confere se é válido. Não mostra os pares.
import { decodePairs, validatePairs } from '../src/lib/draw.ts'
import { PAIRS_B64 } from '../src/pairs.generated.ts'
import { PARTICIPANTS } from '../src/participants.ts'

const problems = validatePairs(PARTICIPANTS, decodePairs(PAIRS_B64))
if (problems.length > 0) {
  console.error('Sorteio inválido:\n- ' + problems.join('\n- '))
  console.error('Rode `pnpm sortear` para refazer (isso muda o resultado de todo mundo).')
  process.exit(1)
}
console.log(`Sorteio válido: ${PARTICIPANTS.length} pessoas, cada uma dá e recebe exatamente um presente, ninguém tirou a si mesmo.`)
