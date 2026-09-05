# Unit 2 – Device Geolocation and Interactive Map Integration

Mobile applications can become significantly more context-aware by integrating native device hardware capabilities with web-based mapping interfaces. Geolocation is one of the most widely used device capabilities, allowing an application to obtain a device's precise geographic coordinates—such as latitude and longitude—to power location-based features [114].

This guide details how to build a location-aware mobile application by pairing the **official Capacitor Geolocation plugin** (which accesses native device GPS hardware) with **Leaflet**, an open-source JavaScript library used for rendering interactive, mobile-friendly maps [114].

---

## 🎯 Learning Objectives
By the end of this module, you should be able to:
1. Explain the architectural roles of **Capacitor Geolocation**, **Leaflet**, and **map tile layers** in location-aware applications [116].
2. Install and configure geolocation and mapping dependencies inside an Ionic Angular standalone project [116].
3. Initialize an interactive Leaflet map featuring custom tile layers, map center, zoom levels, markers, and proper data attribution [116].
4. Retrieve and parse coordinate data using the Capacitor Geolocation API [116].
5. Configure coarse and fine location permissions for supported mobile platforms [117].
6. Programmatically integrate geolocation coordinates with Leaflet to center and update map views [117].
7. Track live movement dynamically using `watchPosition()` and release hardware resources with `clearWatch()` [117].
8. Safely handle various edge-case states, such as denied user permissions, disabled GPS services, or delayed telemetry data [117].

---

## 🏛️ Architectural Overview

Creating a map-based application requires a clear division of responsibilities between hardware coordinate retrieval, map orchestration, and spatial imagery rendering [118, 119]:

```
+---------------------------+     +--------------------------+     +---------------------------+
|   Capacitor Geolocation   |     |      Leaflet Library     |     |   OpenStreetMap (OSM)     |
|       (Plugin API)        |     |       (Map Engine)       |     |      (Tile Provider)      |
+-------------+-------------+     +------------+-------------+     +-------------+-------------+
              |                                |                                 |
              | 1. Requests GPS coords         |                                 |
              v                                |                                 |
      [Device Hardware]                        |                                 |
              |                                |                                 |
              | 2. Returns Lat/Long            |                                 |
              +------------------------------->|                                 |
                                               | 3. Initializes Map container    |
                                               |    at coords [Lat, Long]        |
                                               |                                 |
                                               | 4. Requests map images          |
                                               +-------------------------------->|
                                               |                                 |
                                               | 5. Returns raster tile images   |
                                               |<--------------------------------+
                                               |
                                               v
                                    Renders Interactive Map
                                    (Layers, Markers, Popups)
```

1. **Capacitor Geolocation (The Hardware Bridge)**: Connects to the underlying native operating system (Android/iOS) to communicate with device sensors (GPS, Wi-Fi, Cell tower triangulation). It exposes simple TypeScript APIs to return latitude, longitude, and coordinate accuracy [118].
2. **Leaflet (The Map Controller)**: An open-source mapping client. Leaflet is responsible for creating the interactive coordinate system canvas on the screen, managing custom overlays, place markers, polylines, popups, and translating user touch gestures (dragging, pinching to zoom) [119].
3. **Tile Provider / Basemap (The Spatial Imagery)**: Leaflet itself does not contain map graphics or street data [119]. It requests small, contiguous grid images called raster map tiles from an external tile server (e.g., **OpenStreetMap**) [119, 120]. These tile layers are dynamically stacked on Leaflet's canvas based on the current center coordinates and zoom level.

---

## 📦 Installation and Dependency Configuration

To implement mapping and hardware geolocation, you must install the Capacitor plugin, Leaflet, and the corresponding TypeScript definitions for developer autocomplete support [120]:

### Step 1: Install Capacitor Geolocation
Execute the following commands in your project terminal to install the plugin and synchronize your native mobile platforms:
```bash
npm install @capacitor/geolocation
npx cap sync
```

### Step 2: Install Leaflet & Type Definitions
Install the core Leaflet library along with its developer types as a development dependency:
```bash
npm install leaflet
npm install --save-dev @types/leaflet
```

### Step 3: Configure Leaflet Styles globally
Leaflet requires global CSS sheets to render tile grids, zoom controllers, and marker graphics correctly [120]. Import Leaflet's stylesheet at the top of your global style file [120]:

**`src/global.scss`**
```scss
@import 'leaflet/dist/leaflet.css';
```
> ⚠️ **Important**: Failing to import the Leaflet CSS will cause your map tiles to load as a scattered, disordered list of broken images rather than a cohesive map grid.

---

## 🗺️ Phase 1: Building a Static Map Preview

When developing location-aware applications, **always initialize and preview your map container before adding GPS sensors, permissions, or Capacitor logic** [120]. This decoupled approach simplifies debugging by ensuring your map container, styling, and tile layers render flawlessly first [120].

### 1. HTML Map Container
Define a container element with a distinct ID within your main scrollable content area [121]. Standalone page components must declare their layout containers explicitly [121]:

**`home.page.html`**
```html
<ion-content class="ion-padding">
  <!-- Leaflet hooks into this div using its ID attribute -->
  <div id="map"></div>
</ion-content>
```

### 2. SCSS Map Dimensioning
Leaflet maps cannot compute their boundaries automatically on load. You must explicitly define both a **width** and a **non-zero height** in your page stylesheet to make the map visible [121]:

**`home.page.scss`**
```scss
#map {
  width: 100%;
  height: 400px; /* Non-zero height is mandatory */
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}
```

### 3. Basic Map Initialization
With the container defined and sized, import Leaflet into your page component and instantiate the map object using its core classes [121]:

```typescript
import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet'; // Import everything from Leaflet under the L alias [126]

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true
})
export class HomePage implements AfterViewInit {
  private map!: L.Map; // Reference to hold the Leaflet Map instance [126]

  // Execute initialization inside the hook that fires after the HTML view renders [126]
  ngAfterViewInit(): void {
    this.initMap();
  }

  initMap(): void {
    // 1. Create Leaflet Map and associate it with <div id="map"> [121, 126]
    // 2. Set starting coordinates [latitude, longitude] and zoom level (0: world view to 19: building level) [126, 140]
    this.map = L.map('map').setView([15.65588, 121.039818], 15);

    // 3. Add OpenStreetMap tile layers with mandatory attribution notice [119, 126]
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
  }
}
```

---

## 🔍 Understanding Geolocation Telemetry

When Capacitor Geolocation retrieves device coordinates, it returns a `Position` object containing a nested `coords` object [122]. These properties contain precise sensory data [121, 122]:

| Property Name | Data Type | Meaning / Unit [121, 122] |
| :--- | :--- | :--- |
| `latitude` | `number` | North–south geographical position (degrees ranging from -90 to +90) [121, 140] |
| `longitude` | `number` | East–west geographical position (degrees ranging from -180 to +180) [121, 140] |
| `accuracy` | `number` | Estimated horizontal accuracy radius of the coordinates (reported in meters) [122] |
| `altitude` | `number \| null` | Elevation relative to sea level (reported in meters; null if unsupported) [122] |
| `speed` | `number \| null` | Current velocity of the device (reported in meters per second; null if stationary) [122] |
| `heading` | `number \| null` | Direction of movement (reported in degrees clockwise relative to true North; null if stationary) [122] |

Access coordinate values in your TypeScript files using nesting conventions [122]:
```typescript
const lat = position.coords.latitude;
const lng = position.coords.longitude;
const acc = position.coords.accuracy;
```

---

## 🛡️ Platform Permission Configuration

Accessing a user's location is a highly sensitive privacy operation. You must declare hardware location permissions inside platform projects before deploying to physical devices.

### Android Permission Setup
Android requires Coarse (network-based) and Fine (precise GPS) permissions declared in the `AndroidManifest.xml` [122]. 

If your Android native wrapper is not yet initialized, run:
```bash
ionic cap add android
```

Next, open **`android/app/src/main/AndroidManifest.xml`** and paste the permission lines directly below the closing `</application>` tag [123]:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application ...>
        <!-- Application details -->
    </application>

    <!-- Capacitor Geolocation Permission Declarations -->
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
</manifest>
```

---

## 🛰️ Retrieving Current Device Location

To read a single snapshot of the device's location, import the Capacitor Geolocation plugin and invoke `getCurrentPosition()` using an asynchronous function [124].

```typescript
import { Component } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  standalone: true
})
export class HomePage {
  // Store values inside plain variables or modernize using Angular Signals [124, 125]
  latitude: number = 0;
  longitude: number = 0;

  async getCurrentLocation(): Promise<void> {
    try {
      // getCurrentPosition returns a Promise, naturally fitting async/await syntax [124]
      const position = await Geolocation.getCurrentPosition();
      this.latitude = position.coords.latitude;
      this.longitude = position.coords.longitude;
      
      console.log('Latitude:', this.latitude);
      console.log('Longitude:', this.longitude);
    } catch (error) {
      console.error('Error fetching location:', error);
    }
  }
}
```

To display these values on your interface, bind the component properties inside your template [124]:
```html
<ion-content class="ion-padding">
  <ion-button expand="block" (click)="getCurrentLocation()">Get Current Location</ion-button>
  <div class="coords-display">
    <p>Latitude: <strong>{{ latitude }}</strong></p>
    <p>Longitude: <strong>{{ longitude }}</strong></p>
  </div>
</ion-content>
```

---

## 🔄 Phase 2: Integrating Geolocation with Leaflet

By combining coordinate fetching with Leaflet's API, you can programmatically pan the map view to the user's current GPS position and display a location marker [125].

### The Leaflet Rendering Fix
In hybrid mobile frameworks, maps often render as partially loaded grey boxes because Leaflet cannot instantly calculate the container size of newly instantiated views. Fix this rendering issue by adding a regular size invalidation cycle in your map setup [126]:
```typescript
setInterval(() => {
  this.map.invalidateSize();
}, 200);
```

### Complete Page Implementation (Single Marker State)
To prevent duplicate markers from cluttering the map every time a user requests a location update, declare a private class property to keep track of a single marker reference [127]. If the marker reference exists, update its position with `setLatLng()`; otherwise, instantiate it on the map for the first time [127].

#### **`home.page.html`**
```html
<ion-header>
  <ion-toolbar color="primary">
    <ion-title>Live Map Integration</ion-title>
    <ion-buttons slot="end">
      <ion-button (click)="locateMe()">
        <ion-icon name="locate" slot="start"></ion-icon>
        Locate Me
      </ion-button>
    </ion-buttons>
  </ion-toolbar>
</ion-header>

<ion-content>
  <!-- Interactive Map Canvas -->
  <div id="map"></div>
</ion-content>
```

#### **`home.page.ts`**
```typescript
import { Component, AfterViewInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent } from '@ionic/angular/standalone';
import { Geolocation } from '@capacitor/geolocation';
import * as L from 'leaflet';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent]
})
export class HomePage implements AfterViewInit {
  private map!: L.Map;
  private locationMarker?: L.CircleMarker; // Track the single active marker reference [127]

  ngAfterViewInit(): void {
    this.initMap();
  }

  // Set up the default map view
  initMap(): void {
    this.map = L.map('map').setView([0, 0], 2); // Default centered on world view

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    // Continuous map container size recalculation to prevent partial rendering bugs [126]
    setInterval(() => {
      this.map.invalidateSize();
    }, 200);
  }

  // Fetch coordinates, update map center, and draw/update location pin [127]
  async locateMe(): Promise<void> {
    try {
      const position = await Geolocation.getCurrentPosition();
      const lat = position.coords.latitude;
      const long = position.coords.longitude;

      console.log(`Fetched GPS coordinates: Lat ${lat}, Long ${long}`);

      // 1. Pan map center to coordinates and set precise zoom level (19: detailed building view) [126, 127]
      this.map.setView([lat, long], 19);

      // 2. Perform Single Marker State Management [127]
      if (this.locationMarker) {
        // If marker is already on the map, update its location instead of drawing a duplicate [127]
        this.locationMarker.setLatLng([lat, long]);
      } else {
        // Instantiate marker on map, configure popup, and open it [127]
        this.locationMarker = L.circleMarker([lat, long], {
          radius: 10,
          color: '#3880ff',
          fillColor: '#3880ff',
          fillOpacity: 0.8
        })
        .addTo(this.map)
        .bindPopup('I am here')
        .openPopup();
      }
    } catch (error) {
      console.error('Permission denied or GPS services unavailable:', error);
    }
  }
}
```

---

## 🚦 Error Handling and Edge Case Guidelines

Robust location services must gracefully handle system exceptions [117]:

### Common Location API Exceptions
Your geolocation services must catch and evaluate errors cleanly:
```typescript
async locateMe() {
  try {
    const position = await Geolocation.getCurrentPosition();
    // Process coordinates
  } catch (error: any) {
    this.handleLocationError(error);
  }
}

handleLocationError(error: any) {
  // Capacitor reports descriptive error codes
  if (error.code === 1 || error.message.includes('permission')) {
    console.warn('The user denied the application permission to access device location.');
    // Trigger modal alerting user to enable location permissions manually in System Settings
  } else if (error.code === 2 || error.message.includes('disabled')) {
    console.warn('Device location services are currently disabled.');
    // Alert user that GPS hardware is turned off
  } else {
    console.warn('Location retrieval timed out or GPS telemetry is unavailable.');
  }
}
```

### UX Design Strategies
1. **Initial Fallbacks**: If location coordinates are slow to resolve, center your default Leaflet view on a generic country/city coordinate instead of failing silently on screen load [126].
2. **Loading States**: Display an active loader overlay on the UI while waiting for the GPS sensor promise to resolve, as GPS cold-starts can take several seconds to lock coordinates.
3. **Accuracy Indicators**: Leverage `position.coords.accuracy` to draw a Leaflet circle overlay representing coordinate error boundaries, indicating spatial precision directly on the map.
