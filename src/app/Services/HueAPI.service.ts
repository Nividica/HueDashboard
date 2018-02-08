

import { HttpClient } from '@angular/common/http';
import { HueLightsAPI, HueLightCollection, HueLightSetStateResponse, HueLightState } from '../HueAPI/Types/Lights';
import { Observable } from 'rxjs/Observable';
import { skip as ObservableSkip } from 'rxjs/operators'
import { Injectable } from '@angular/core';
import { SessionService } from './Session.service';
import { HueCapabilitiesAPI, HueCapabilities } from '../HueAPI/Types/Capabilities';
import { HueConfigAPI, HueConfig } from '../HueAPI/Types/Config';

@Injectable()
export class HueAPI implements HueLightsAPI, HueCapabilitiesAPI, HueConfigAPI {


  private BridgeAddress: string = null;

  private HttpClient: HttpClient;

  private Session: SessionService;

  constructor(httpClient: HttpClient, session: SessionService) {
    this.HttpClient = httpClient;
    this.Session = session;

    // Subscribe to the IP and Username, skipping the inital load
    ObservableSkip(1)(this.Session.HueBridge.IP.AsObservable()).subscribe(() => { this.UpdateBridgeAddress() })
    ObservableSkip(1)(this.Session.HueBridge.Username.AsObservable()).subscribe(() => { this.UpdateBridgeAddress() })

    // Attempt update the bridge address
    this.UpdateBridgeAddress();
  }

  public GetAllLights(): Observable<HueLightCollection> {
    return this.HttpClient.get<HueLightCollection>(this.BridgeAddress + 'lights');
  }

  public SetLightState(lightID: number, state: HueLightState): Observable<Array<HueLightSetStateResponse>> {
    return this.HttpClient.put<Array<HueLightSetStateResponse>>(this.BridgeAddress + 'lights/' + String(lightID) + '/state', state);
  }

  public GetCapabilities(): Observable<HueCapabilities> {
    return this.HttpClient.get<HueCapabilities>(this.BridgeAddress + 'capabilities');
  }

  public GetConfig(): Observable<HueConfig> {
    return this.HttpClient.get<HueConfig>(this.BridgeAddress + 'config');
  }

  /**
   * Returns true if the bridge URL has been set
   */
  public HasBridgeCredentials(): boolean {
    return (this.BridgeAddress != null);
  }

  /**
   * Called when the IP or username changes
   */
  private UpdateBridgeAddress() {
    this.BridgeAddress = null;

    let ip: string = this.Session.HueBridge.IP.Get();
    let user: string = this.Session.HueBridge.Username.Get();
    if (!ip || !user) {
      return;
    }

    this.BridgeAddress = 'http://' + ip + '/api/' + user + '/';
  }


}