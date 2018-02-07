
import { HttpClient } from '@angular/common/http';
import { HueLightsAPI, HueLightCollection, HueLightSetStateResponse, HueLightState } from './Types/Lights';
import { Observable } from 'rxjs/Observable';
//import { of as ObservableOf } from 'rxjs/observable/of';
import { Injectable } from '@angular/core';

@Injectable()
export class HueAPI implements HueLightsAPI {

  private BridgeAddress: string = null;

  private HttpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.HttpClient = httpClient;
  }

  public SetBridgeAddress(addr: string, apikey: string) {
    if (addr == null || apikey == null) {
      return;
    }
    this.BridgeAddress = 'http://' + addr + '/api/' + apikey + '/'
  }

  public GetAllLights(): Observable<HueLightCollection> {
    this.BridgeCheck();

    return this.HttpClient.get<HueLightCollection>(this.BridgeAddress + 'lights');
  }

  public SetLightState(lightID: number, state: HueLightState): Observable<Array<HueLightSetStateResponse>> {
    this.BridgeCheck();

    return this.HttpClient.put<Array<HueLightSetStateResponse>>(this.BridgeAddress + 'lights/' + String(lightID) + '/state', state);
  }

  private BridgeCheck(): void {
    if (this.BridgeAddress == null) {
      throw new Error("Bridge Address Or API Key Has Not Been Set. Please call SetBridgeAddress first");
    }
  }


}