// Sorteio e verificação do amigo secreto. Sem dependências, roda no navegador e no Node.

/** Mapa { quem dá: quem recebe }. */
export type Pairs = Record<string, string>

/** Inteiro aleatório uniforme em [0, max). */
export type RandomInt = (max: number) => number

/**
 * Embaralha com Fisher–Yates até obter um desarranjo (ninguém tira a si mesmo).
 * A rejeição mantém a distribuição uniforme entre todos os desarranjos possíveis.
 */
export function drawPairs(people: readonly string[], randomInt: RandomInt): Pairs {
  if (people.length < 2) throw new Error('São necessárias pelo menos 2 pessoas.')
  if (new Set(people).size !== people.length) throw new Error('Há nomes repetidos na lista.')

  for (;;) {
    const receivers = [...people]
    for (let i = receivers.length - 1; i > 0; i--) {
      const j = randomInt(i + 1)
      ;[receivers[i], receivers[j]] = [receivers[j], receivers[i]]
    }
    if (receivers.every((receiver, i) => receiver !== people[i])) {
      return Object.fromEntries(people.map((giver, i) => [giver, receivers[i]]))
    }
  }
}

/** Retorna a lista de problemas encontrados; vazia quando o sorteio é válido. */
export function validatePairs(people: readonly string[], pairs: Pairs): string[] {
  const problems: string[] = []
  const everyone = new Set(people)
  if (everyone.size !== people.length) problems.push('Há nomes repetidos na lista de participantes.')

  const givers = Object.keys(pairs)
  const receivers = Object.values(pairs)

  for (const giver of givers) {
    if (!everyone.has(giver)) problems.push(`"${giver}" tira alguém mas não está na lista.`)
    if (pairs[giver] === giver) problems.push(`"${giver}" tirou a si mesmo.`)
  }
  for (const person of people) {
    if (!(person in pairs)) problems.push(`"${person}" não tirou ninguém.`)
    const times = receivers.filter((receiver) => receiver === person).length
    if (times !== 1) problems.push(`"${person}" foi tirado ${times} vezes (deveria ser 1).`)
  }
  for (const receiver of new Set(receivers)) {
    if (!everyone.has(receiver)) problems.push(`"${receiver}" foi tirado mas não está na lista.`)
  }
  return problems
}

/** JSON → UTF-8 → base64 (só para não ficar legível no código-fonte). */
export function encodePairs(pairs: Pairs): string {
  const bytes = new TextEncoder().encode(JSON.stringify(pairs))
  return btoa(String.fromCharCode(...bytes))
}

export function decodePairs(encoded: string): Pairs {
  const bytes = Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0))
  return JSON.parse(new TextDecoder().decode(bytes)) as Pairs
}
