import { describe, it, expect } from 'vitest'
import { identifyChord } from '../../src/chord/identify'
describe('identifyChord', () => {
  it('identifies C major chord', () => {
    const result = identifyChord(['C', 'E', 'G'])
    expect(result.root).toBe('C')
    expect(result.quality).toBe('major')
  })
})
