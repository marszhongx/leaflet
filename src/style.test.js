import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const styleContent = readFileSync(path.join(process.cwd(), 'src/style.css'), 'utf8')

describe('style.css', () => {
  it('uses viewport height for the map container', () => {
    expect(styleContent).toContain('#map {')
    expect(styleContent).toContain('min-height: 100vh;')
  })

  it('positions the skeleton over the map until Leaflet is ready', () => {
    expect(styleContent).toContain('.map-skeleton {')
    expect(styleContent).toContain('position: absolute;')
    expect(styleContent).toContain('inset: 0;')
    expect(styleContent).toContain('pointer-events: none;')
  })

  it('fades the skeleton when the map is ready', () => {
    expect(styleContent).toContain('body.map-ready .map-skeleton {')
    expect(styleContent).toContain('opacity: 0;')
    expect(styleContent).toContain('visibility: hidden;')
  })
})
