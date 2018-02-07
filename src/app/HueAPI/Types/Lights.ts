import { Observable } from "rxjs/Observable";


export interface HueLightState {
  on?: boolean;
  bri?: number;
  hue?: number;
  sat?: number;
  xy?: Array<number>;
  ct?: number;
  alert?: string;
  effect?: string;
  colormode?: string;
  reachable?: boolean;
  transitiontime?: number;
}

export interface HueLightSoftwareUpdate {
  lastinstall: Date;
  state: string;
}

export interface HueLight {
  capabilities?: any;
  manufacturername?: string;
  modelid: string;
  name: string;
  state: HueLightState;
  swconfigid?: string;
  swupdate?: HueLightSoftwareUpdate;
  swversion: string;
  type: string;
  uniqueid: string;
}

export interface HueLightCollection {
  [key: string]: HueLight;
}

export interface HueLightSetStateResponse {
  success?: {
    [address: string]: string | number
  };
  error?: {
    type: number,
    address: string,
    description: string
  };
}

export interface HueLightsAPI {
  GetAllLights(): Observable<HueLightCollection>;
  SetLightState(lightID: number, state: HueLightState): Observable<Array<HueLightSetStateResponse>>;
}
