import { Service, signal } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

@Service()
export class Geo {
  myLiveLotLong = signal<any>(null);
  private watchId: string | undefined;

  async getLatLng() {
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
    this.watchId = await Geolocation.watchPosition(
      { enableHighAccuracy: true },
      (position, err) => {
        if (position) {
          this.myLiveLotLong.set({
            lats: position.coords.latitude,
            lungs: position.coords.longitude
          });
        }
      }
    );
  }

  async stopWatching() {
    try {
      if (this.watchId) {
        await Geolocation.clearWatch({ id: this.watchId });
        this.watchId = undefined;
      }
    } catch (err) {
      console.error(err);
    }
  }
}
