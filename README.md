# Geolocation Ionic Activity

This project demonstrates real-time device geolocation tracking integrated with an interactive map. It is built using the Ionic Framework, Angular (Standalone architecture), and Capacitor.

## Features

* **Real-time GPS Tracking:** Utilizes the Capacitor Geolocation plugin to continuously track and stream device movement via the `watchPosition` API.
* **Interactive Mapping:** Integrates Leaflet and OpenStreetMap to visually render the user's initial location upon loading.
* **Reactive State Management:** Employs Angular Signals and Effects to efficiently update the user interface as new coordinates are received from the hardware.
* **Hardware Lifecycle Management:** Implements start and stop controls to properly register and release the native GPS listener via `clearWatch`.
* **Native Android Support:** Pre-configured with the required coarse and fine location permissions in the Android Manifest.

## Technology Stack

* **Framework:** Ionic / Angular (Standalone Components)
* **Native Runtime:** Capacitor
* **Mapping Library:** Leaflet
* **Language:** TypeScript

## Installation and Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/jsoul-dev/geolocation-ionic-activity.git
   cd geolocation-ionic-activity
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
   *(Note: Running this command automatically reads the `package.json` file and installs the required core packages for this activity, specifically: `@capacitor/geolocation`, `leaflet`, and `@types/leaflet`).*

3. Run the development server in your browser:
   ```bash
   ionic serve
   ```

## Android Deployment

This project includes the `android` platform and is configured with the necessary GPS permissions. 

To build an APK:
1. Compile the web assets:
   ```bash
   ionic build
   ```
2. Sync the assets to the native project:
   ```bash
   npx cap sync
   ```
3. Open the project in Android Studio:
   ```bash
   npx cap open android
   ```
4. In Android Studio, navigate to **Build > Generate Signed Bundle / APK...** to generate a release build.

## Documentation

The `.docs` directory contains reference materials, project constraints, and submission artifacts (such as the live-checking cheat sheet and the presentation video script).
