import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './style.css'
import { createLightbox } from './lightbox.js'
import { getInitialMapView } from './mapView.js'
import { renderPopupContent } from './popupContent.js'
import { places } from './places.js'

const map = L.map('map')
const lightbox = createLightbox()

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map)

places.forEach((place) => {
  const latLng = [place.lat, place.lng]
  const marker = L.marker(latLng).addTo(map).bindPopup(renderPopupContent(place))

  marker.on('popupopen', (event) => {
    const popupElement = event.popup.getElement()

    if (!popupElement) {
      return
    }

    popupElement.addEventListener('click', (clickEvent) => {
      const target = clickEvent.target

      if (!(target instanceof HTMLElement)) {
        return
      }

      const trigger = target.closest('[data-image-index]')

      if (!(trigger instanceof HTMLElement)) {
        return
      }

      const imageIndex = Number.parseInt(trigger.dataset.imageIndex ?? '', 10)

      if (Number.isNaN(imageIndex)) {
        return
      }

      lightbox.open({
        images: place.images ?? [],
        startIndex: imageIndex,
        title: place.name
      })
    })
  })
})

const initialView = getInitialMapView(places)

if (initialView.mode === 'fitBounds') {
  map.fitBounds(initialView.latLngs, { padding: [40, 40] })
} else {
  map.setView(initialView.center, initialView.zoom)
}
