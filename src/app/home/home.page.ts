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
