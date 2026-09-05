import { Service, signal } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

@Service()
export class Geo {
  liveCoords = signal<any>(null);
  private watchId: string | undefined;
  private mockInterval: any;

  async getLatLng() {
    return {
      latitude: 15.4864,
      longitude: 120.9734
    };
  }

  async startWatching() {
    let currentLat = 15.4864;
    let currentLng = 120.9734;

    this.mockInterval = setInterval(() => {
      currentLat += 0.00015;
      currentLng += 0.00015;

      this.liveCoords.set({
        lat: currentLat,
        lng: currentLng
      });
    }, 1500);

    this.watchId = 'mock-watch';
  }

  async stopWatching() {
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
    }
    this.watchId = undefined;
  }
}
