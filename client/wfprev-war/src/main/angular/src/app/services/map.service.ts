import { Injectable } from '@angular/core';
import * as L from 'leaflet';

@Injectable({ providedIn: 'root' })
export class MapService {
  private map!: L.Map;

  setMap(map: L.Map) {
    this.map = map;
  }

  getMap() {
    return this.map;
  }
}