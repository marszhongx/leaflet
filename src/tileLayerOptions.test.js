import { describe, expect, it } from 'vitest'
import { tileLayerOptions } from './tileLayerOptions.js'

describe('tileLayerOptions', () => {
  it('uses the bright Stadia Maps tiles with the required attribution', () => {
    expect(tileLayerOptions).toMatchObject({
      attribution:
        '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      detectRetina: true
    })
    expect(tileLayerOptions.urlTemplate).toBe('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png')
  })
})
