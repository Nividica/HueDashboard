/**
 * Defines the structure of the data used by the Capabilities API.
 * Author: Chris McGhee, Nividica@gmail.com
 */

import { Observable } from "rxjs/Observable";

/**
 * Number of these available.
 */
interface CapAvailable {
  available: number
}

export interface HueCapabilities_Rules extends CapAvailable {
  actions: CapAvailable;
  conditions: CapAvailable;
}

export interface HueCapabilities_Scenes extends CapAvailable {
  lightstates: CapAvailable;
}

export interface HueCapabilities_Streaming extends CapAvailable {
  channels: number,
  total: number
}

export interface HueCapabilities_Timezones {
  values: Array<string>
}

export interface HueCapabilities {
  groups: CapAvailable;
  lights: CapAvailable;
  resourcelinks: CapAvailable;
  rules: HueCapabilities_Rules;
  scenes: HueCapabilities_Scenes;
  schedules: CapAvailable;
  sensors: CapAvailable;
  streaming: HueCapabilities_Streaming;
  timezones: HueCapabilities_Timezones;
}

export interface HueCapabilitiesAPI {
  GetCapabilities(): Observable<HueCapabilities>;
}