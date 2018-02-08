import { Component } from "@angular/core";
import { HueHelper } from "../../HueAPI/HueHelper";
import { HueLightState } from "../../HueAPI/Types/Lights";
import { HueAPI } from "../../Services/HueAPI.service";



@Component({
  selector: 'hue-color-picker',
  templateUrl: './HueColorPicker.template.html',
  styleUrls: ['./HueColorPicker.style.css']
})
export class HueColorPickerComponent {

  // Ranges and values 
  public Sliders = {
    Hue: {
      Min: 0,
      Max: 65535,
      Value: 0
    },
    Saturation: {
      Min: 0,
      Max: 254,
      Value: 25
    },
    Brightness: {
      Min: 1,
      Max: 254,
      Value: 254
    },
    // How long the light will fade betwene the current state and the new state.
    // This is given as a multiple of 100ms and defaults to 4 (400ms)
    TransitionTime: {
      Min: 0,
      Max: 3000,
      Value: 4
    }
  };

  // Friendly transition time
  public DelayString: string = null;

  // Currently selected HSB as a hex code
  public HSBAsHex: string = null;

  private HueService: HueAPI;

  constructor(hueAPI: HueAPI) {
    this.HueService = hueAPI;

    this.UpdateDelayString();
    this.UpdateHSB();
  }

  public UpdateHSB() {
    this.HSBAsHex = HueHelper.HSBToHex(this.Sliders.Hue.Value, this.Sliders.Saturation.Value, this.Sliders.Brightness.Value);
  }

  public UpdateDelayString() {
    let milliseconds: number = 100 * this.Sliders.TransitionTime.Value;

    if (milliseconds >= 60000) {
      // Minutes
      this.DelayString = String(Math.floor(milliseconds / 6000) / 10) + ' Minutes';
    }
    else if (milliseconds >= 1000) {
      // Seconds
      this.DelayString = String(Math.floor(milliseconds / 100) / 10) + ' Seconds';
    }
    else if (milliseconds > 0) {
      // Milliseconds
      this.DelayString = String(milliseconds) + ' Milliseconds'
    }
    else {
      this.DelayString = 'Immediate';
    }
  }

  public ApplyColor() {
    let state: HueLightState = {
      hue: this.Sliders.Hue.Value,
      sat: this.Sliders.Saturation.Value,
      bri: this.Sliders.Brightness.Value,
      transitiontime: this.Sliders.TransitionTime.Value,
      on: true
    };
    this.HueService.SetLightState(2, state).subscribe();
    this.HueService.SetLightState(4, state).subscribe();
  }
}