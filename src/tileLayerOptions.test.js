import { describe, expect, it } from 'vitest'
import { tileLayerOptions } from './tileLayerOptions.js'

describe('tileLayerOptions', () => {
  it('uses the public OpenStreetMap tiles with the required attribution', () => {
    expect(tileLayerOptions).toMatchObject({
      attribution: '&copy; OpenStreetMap contributors',
      detectRetina: true
    })
    expect(tileLayerOptions.urlTemplate).toBe('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
  })
})
