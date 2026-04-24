import { describe, expect, it } from 'vitest'
import { markerIconOptions } from './markerIconOptions.js'

describe('markerIconOptions', () => {
  it('uses Leaflet image assets resolved by Vite', () => {
    expect(markerIconOptions.iconUrl).toContain('marker-icon.png')
    expect(markerIconOptions.iconRetinaUrl).toContain('marker-icon-2x.png')
    expect(markerIconOptions.shadowUrl).toContain('marker-shadow.png')
    expect(markerIconOptions).toMatchObject({
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    })
  })
})
