import { Service, signal } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

@Service()
export class Geo {
  liveCoords = signal<any>(null);
  private watchId: string | undefined;
  private mockInterval: any;

  async getLatLng() {
    return {
      latitude: 40.7128,
      longitude: -74.0060
    };
  }

  async startWatching() {
    let currentLat = 40.7128;
    let currentLng = -74.0060;

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
