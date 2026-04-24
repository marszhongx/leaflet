import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './style.css'
import { getInitialMapView } from './mapView.js'
import { places } from './places.js'

const map = L.map('map')

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map)

const latLngs = places.map((place) => {
  const latLng = [place.lat, place.lng]
  L.marker(latLng).addTo(map).bindPopup(place.name)
  return latLng
})

const initialView = getInitialMapView(places)

if (initialView.mode === 'fitBounds') {
  map.fitBounds(initialView.latLngs, { padding: [40, 40] })
} else {
  map.setView(initialView.center, initialView.zoom)
}
