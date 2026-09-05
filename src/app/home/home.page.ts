import { AfterViewInit, Component, effect, inject } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonFooter,
  IonAlert
} from '@ionic/angular';
import * as L from 'leaflet';
import { Geo } from '../services/geo';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonFooter, IonAlert],
})
export class HomePage implements AfterViewInit {
  private geoService = inject(Geo);
  private map!: L.Map;
  private liveMarker?: L.CircleMarker;
  private startMarker?: L.CircleMarker;
  private liveLine?: L.Polyline;

  latitude: number = 0;
  longitude: number = 0;
  startLatitude: number = 0;
  startLongitude: number = 0;
  livePosition: any = null;
  isWatching: boolean = false;

  showAlert: boolean = false;
  alertHeader: string = '';
  alertMessage: string = '';
  alertButtons = ['OK'];

  constructor() {
    effect(() => {
      const coords = this.geoService.liveCoords();
      if (coords) {
        this.livePosition = coords;
        this.latitude = coords.lat;
        this.longitude = coords.lng;
        
        if (this.map) {
          this.updateLiveMarker(coords.lat, coords.lng);
          this.updateTrackingPath(coords.lat, coords.lng);
        }
      }
    });
  }

  async ngAfterViewInit(): Promise<void> {
    const start = await this.geoService.getLatLng();
    if (start) {
      this.latitude = start.latitude;
      this.longitude = start.longitude;
      this.startLatitude = start.latitude;
      this.startLongitude = start.longitude;
      this.initMap();
    } else {
      this.alertHeader = 'Geolocation API Error';
      this.alertMessage = 'Unable to get your current location. Please check your GPS and permissions.';
      this.showAlert = true;
    }
  }

  initMap(): void {
    this.map = L.map('map').setView([this.latitude, this.longitude], 19);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    setInterval(() => {
      this.map.invalidateSize();
    }, 200);

    this.startMarker = L.circleMarker([this.startLatitude, this.startLongitude], {
      radius: 6,
      color: 'black',
      fillColor: 'transparent',
      weight: 3
    }).addTo(this.map);
  }

  updateLiveMarker(lat: number, lng: number): void {
    if (!this.liveMarker) {
      this.liveMarker = L.circleMarker([lat, lng], {
        radius: 8,
        color: '#e91e63',
        fillColor: '#e91e63',
        fillOpacity: 0.3,
        weight: 3
      }).addTo(this.map);
    } else {
      this.liveMarker.setLatLng([lat, lng]);
    }
  }

  updateTrackingPath(lat: number, lng: number): void {
    const startLatLng = L.latLng(this.startLatitude, this.startLongitude);
    const liveLatLng = L.latLng(lat, lng);
    const distanceInMeters = startLatLng.distanceTo(liveLatLng);

    if (!this.liveLine) {
      this.liveLine = L.polyline([startLatLng, liveLatLng], {
        color: 'blue',
        weight: 2
      })
      .addTo(this.map)
      .bindTooltip(`${distanceInMeters.toFixed(2)} meters`, {
        permanent: true,
        direction: 'top'
      });
    } else {
      this.liveLine.setLatLngs([startLatLng, liveLatLng]);
      this.liveLine.setTooltipContent(`${distanceInMeters.toFixed(2)} meters`);
    }
  }

  async onStartWatching(): Promise<void> {
    await this.geoService.startWatching();
    this.isWatching = true;
  }

  async onStopWatching(): Promise<void> {
    await this.geoService.stopWatching();
    this.isWatching = false;
  }
}
