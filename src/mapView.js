export const defaultCenter = [35.8617, 104.1954]
export const defaultZoom = 4
export const singlePlaceZoom = 10
export const multiPlacePadding = [16, 16]

export function getInitialMapView(places) {
  const latLngs = places.map((place) => [place.lat, place.lng])

  if (latLngs.length > 1) {
    return {
      mode: 'fitBounds',
      latLngs,
      options: {
        padding: multiPlacePadding
      }
    }
  }

  if (latLngs.length === 1) {
    return {
      mode: 'setView',
      center: latLngs[0],
      zoom: singlePlaceZoom
    }
  }

  return {
    mode: 'setView',
    center: defaultCenter,
    zoom: defaultZoom
  }
}
