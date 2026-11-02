import { describe, expect, it } from 'vitest'
import { PAIRS_B64 } from '../pairs.generated.ts'
import { PARTICIPANTS } from '../participants.ts'
import { decodePairs, drawPairs, encodePairs, validatePairs } from './draw.ts'

const randomInt = (max: number) => Math.floor(Math.random() * max)

describe('drawPairs', () => {
  it('always produces a valid derangement', () => {
    for (let run = 0; run < 500; run++) {
      expect(validatePairs(PARTICIPANTS, drawPairs(PARTICIPANTS, randomInt))).toEqual([])
    }
  })

  it('rejects duplicate names', () => {
    expect(() => drawPairs(['Ana', 'Ana'], randomInt)).toThrow()
  })
})

describe('validatePairs', () => {
  const people = ['Ana', 'Bia', 'Caio']

  it('accepts a derangement', () => {
    expect(validatePairs(people, { Ana: 'Bia', Bia: 'Caio', Caio: 'Ana' })).toEqual([])
  })

  it('rejects self-pairs', () => {
    expect(validatePairs(people, { Ana: 'Ana', Bia: 'Caio', Caio: 'Bia' })).not.toEqual([])
  })

  it('rejects someone receiving twice or not at all', () => {
    expect(validatePairs(people, { Ana: 'Bia', Bia: 'Ana', Caio: 'Ana' })).not.toEqual([])
  })

  it('rejects missing givers and unknown names', () => {
    expect(validatePairs(people, { Ana: 'Bia', Bia: 'Ana' })).not.toEqual([])
    expect(validatePairs(people, { Ana: 'Bia', Bia: 'Zé', Caio: 'Ana' })).not.toEqual([])
  })
})

describe('encoding', () => {
  it('round-trips accented names', () => {
    const pairs = { 'Vó Rita': 'João Paulo Ortigão', 'João Paulo Ortigão': 'Vó Rita' }
    expect(decodePairs(encodePairs(pairs))).toEqual(pairs)
  })

  it('committed draw is valid', () => {
    expect(validatePairs(PARTICIPANTS, decodePairs(PAIRS_B64))).toEqual([])
  })
})
