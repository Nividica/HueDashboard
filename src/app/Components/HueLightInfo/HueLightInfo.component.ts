import { Component, Input, OnInit, SimpleChange, DoCheck } from "@angular/core";
import { HueLight } from "../../HueAPI/Types/Lights";
import { HueHelper } from "../../HueAPI/HueHelper";
import { OnChanges } from "@angular/core/src/metadata/lifecycle_hooks";



@Component({
  selector: 'hue-light-component',
  templateUrl: './HueLightInfo.template.html'
})
export class HueLightInfoComponent implements OnInit, DoCheck {

  @Input()
  public BridgeID: string;

  @Input()
  public Light: HueLight;

  public IsCollapsed: boolean = true;

  public HueAsHex: string = "#000000";

  public XYAsHex: string = '#000000';

  private LastHue: number = 0;

  private LastXY: Array<Number> = [0, 0];

  public ngOnInit() {
    this.RecalcColor();
  }

  public ngDoCheck() {
    if (this.Light && this.Light.state) {
      const recalc: boolean =
        (this.Light.state.hue !== this.LastHue)
        || (this.LastXY[0] !== this.Light.state.xy[0])
        || (this.LastXY[1] !== this.Light.state.xy[1]);
      if (recalc) {
        this.RecalcColor();
      }
    }
  }

  private RecalcColor() {
    this.LastXY[0] = this.Light.state.xy[0];
    this.LastXY[1] = this.Light.state.xy[1];
    this.LastHue = this.Light.state.hue

    this.HueAsHex = HueHelper.HueToHex(this.Light.state.hue);
    this.XYAsHex = HueHelper.XYtoHex(this.Light.state.xy, 1.0);
  }

}