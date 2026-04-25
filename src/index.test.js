import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8')

describe('index.html', () => {
  it('keeps the map mount empty before JavaScript loads', () => {
    expect(html).toContain('<div id="map"></div>')
    expect(html).not.toContain('class="map-skeleton"')
    expect(html).not.toContain('aria-label="地图骨架屏"')
    expect(html).not.toContain('id="skeletonTileGrid"')
    expect(html).not.toContain('fill="#2a81cb"')
  })
})
