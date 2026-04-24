import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const styleContent = readFileSync(path.join(process.cwd(), 'src/style.css'), 'utf8')

describe('style.css', () => {
  it('uses viewport height for the map container', () => {
    expect(styleContent).toContain('#map {')
    expect(styleContent).toContain('min-height: 100vh;')
  })
})
