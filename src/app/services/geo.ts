import { Service, signal } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

@Service()
export class Geo {
  liveCoords = signal<any>(null);
  simulationMode = signal<boolean>(false);
  private watchId: string | undefined;
  private mockInterval: any;

  async getLatLng() {
    if (this.simulationMode()) {
      return {
        latitude: 15.4864,
        longitude: 120.9734
      };
    }

    try {
      const position = await Geolocation.getCurrentPosition();
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async startWatching() {
    if (this.simulationMode()) {
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
      return;
    }

    this.watchId = await Geolocation.watchPosition(
      { enableHighAccuracy: true },
      (position, err) => {
        if (position) {
          this.liveCoords.set({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        }
      }
    );
  }

  async stopWatching() {
    if (this.mockInterval) {
      clearInterval(this.mockInterval);
      this.mockInterval = undefined;
    }

    try {
      if (this.watchId && this.watchId !== 'mock-watch') {
        await Geolocation.clearWatch({ id: this.watchId });
      }
    } catch (err) {
      console.error(err);
    }

    this.watchId = undefined;
  }

  toggleSimulation() {
    this.simulationMode.set(!this.simulationMode());
  }
}
