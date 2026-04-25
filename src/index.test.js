import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8')
const mapMarkup = html.match(/<div id="map">[\s\S]*?<\/div>\s*<script/)?.[0] ?? ''

describe('index.html', () => {
  it('renders a Leaflet-style map skeleton before JavaScript loads', () => {
    expect(html).toContain('<div id="map">')
    expect(html).toContain('class="map-skeleton"')
    expect(html).toContain('aria-label="地图骨架屏"')
    expect(html).toContain('id="skeletonTileGrid"')
    expect(html).toContain('fill="#2a81cb"')
  })

  it('keeps the skeleton visual-only without loading text', () => {
    expect(mapMarkup).not.toContain('地图加载中')
    expect(mapMarkup).not.toContain('旅游足迹')
  })
})
