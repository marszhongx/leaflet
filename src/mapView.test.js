import { describe, expect, it } from 'vitest'
import { getInitialMapView } from './mapView.js'

describe('getInitialMapView', () => {
  it('returns fitBounds mode with tighter padding for multiple places', () => {
    const result = getInitialMapView([
      { name: '北京', lat: 39.9042, lng: 116.4074 },
      { name: '上海', lat: 31.2304, lng: 121.4737 }
    ])

    expect(result).toEqual({
      mode: 'fitBounds',
      latLngs: [
        [39.9042, 116.4074],
        [31.2304, 121.4737]
      ],
      options: {
        padding: [16, 16]
      }
    })
  })

  it('returns setView mode for a single place', () => {
    const result = getInitialMapView([
      { name: '北京', lat: 39.9042, lng: 116.4074 }
    ])

    expect(result).toEqual({
      mode: 'setView',
      center: [39.9042, 116.4074],
      zoom: 10
    })
  })

  it('returns default view for empty places', () => {
    const result = getInitialMapView([])

    expect(result).toEqual({
      mode: 'setView',
      center: [35.8617, 104.1954],
      zoom: 4
    })
  })
})
