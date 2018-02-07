import { Component, OnInit } from '@angular/core';
import { HueAPI } from '../../HueAPI/HueAPI';
import { HueLight, HueLightCollection } from '../../HueAPI/Types/Lights';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';

@Component({
  selector: 'hue-lights-page',
  templateUrl: './Lights.template.html'
})
export class HueLightsPage implements OnInit, OnDestroy {
  /**
   * API
   */
  private HueAPI: HueAPI;

  /**
   * Lights from the bridge
   */
  public Lights: HueLightCollection = null;

  /**
   * IDs of the lights from the bridge
   */
  public LightBridgeIDs: Array<string> = [];

  public AutoRefresh: boolean = false;

  private IntervalHandle: any = null;

  constructor(hueAPI: HueAPI) {
    this.HueAPI = hueAPI;
  }

  public ngOnInit() {
    this.UpdateLights();
    this.IntervalHandle = setInterval(() => {
      if (this.AutoRefresh === true) {
        this.UpdateLights()
      }
    }, 1000);
  }

  public ngOnDestroy() {
    clearInterval(this.IntervalHandle);
  }

  private UpdateObject(source: object, dest: object) {
    let sourceKeys = Object.keys(source);
    let destKeys = Object.keys(dest);

    // Prune
    for (let dKey of destKeys) {
      if (!sourceKeys.includes(dKey)) {
        delete dest[dKey];
      }
    }

    // Update
    for (let sKey of sourceKeys) {
      // Get source property
      let sProp: any = source[sKey];
      // Property is object?
      if (typeof (sProp) === 'object') {
        // Ensure dest property is object
        let dProp: any = dest[sKey];
        if (typeof (dProp) !== 'object') {
          dest[sKey] = dProp = {};
        }
        this.UpdateObject(sProp, dProp);
      } else {
        // Update non-object
        dest[sKey] = sProp;
      }
    }
  }

  private UpdateLights() {
    this.HueAPI.GetAllLights().subscribe(
      (response) => {
        if (this.Lights == null) {
          this.Lights = response;
          this.LightBridgeIDs = Object.keys(response);
        } else {
          this.LightBridgeIDs.length = 0;
          for (let key of Object.keys(response)) {
            this.LightBridgeIDs.push(key);
          }
          this.UpdateObject(response, this.Lights);
        }
      }
    );
  }
}
