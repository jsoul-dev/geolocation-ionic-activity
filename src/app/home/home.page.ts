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
  myLivePosition: any = null;
  isWatching: boolean = false;

  isMyAlertOpen: boolean = false;
  myHeader: string = '';
  myMessage: string = '';
  alertButtons = ['OK'];

  constructor() {
    effect(() => {
      const liveCoordinates = this.geoService.myLiveLotLong();
      if (liveCoordinates) {
        this.myLivePosition = liveCoordinates;
        this.latitude = liveCoordinates.lats;
        this.longitude = liveCoordinates.lungs;
      }
    });
  }

  async ngAfterViewInit(): Promise<void> {
    const start = await this.geoService.getLatLng();
    if (start) {
      this.latitude = start.latitude;
      this.longitude = start.longitude;
      this.initMap();
    } else {
      this.myHeader = 'Geolocation API Error';
      this.myMessage = 'Unable to get your current location. Please check your GPS and permissions.';
      this.isMyAlertOpen = true;
    }
  }

  initMap(): void {
    this.map = L.map('mapa').setView([this.latitude, this.longitude], 19);

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
