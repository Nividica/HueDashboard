import { HueLight } from "./Types/Lights";


export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface CIE1931_XYColor {
  x: number;
  y: number;
}

export abstract class HueHelper {

  public static MinBrightness: number = 1;
  public static MaxBrightness: number = 254;

  public static MinSaturation: number = 0;
  public static MaxSaturation: number = 254;


  /**
   * Convert the given hue value to RGB(0.0-1.0)
   * @param hue 
   */
  public static HueToRGBPercent(hue: number): RGBColor {
    const LowerPeakRed: number = 0;
    const PeakGreen: number = 25500;
    const PeakBlue: number = 46920;
    const UpperPeakRed: number = 65535;

    // Calculate midpoints
    const MidpointYellow: number = (LowerPeakRed + PeakGreen) / 2.0;
    const MidpointCyan: number = (PeakGreen + PeakBlue) / 2.0;
    const MidpointMagenta: number = (PeakBlue + UpperPeakRed) / 2.0;

    let r: number = 0, g: number = 0, b: number = 0;

    if (hue <= MidpointYellow) {
      // Red to Yellow
      // Full Red
      // Green Grows
      r = 1.0;
      g = hue / MidpointYellow;
    } else if (hue <= PeakGreen) {
      // Yellow to Green
      // Full Green
      // Red Falls
      g = 1.0;
      r = 1.0 - ((hue - MidpointYellow) / (PeakGreen - MidpointYellow));
    } else if (hue <= MidpointCyan) {
      // Green to Cyan
      // Full Green
      // Blue Grows
      g = 1.0;
      b = (hue - PeakGreen) / (MidpointCyan - PeakGreen);
    } else if (hue <= PeakBlue) {
      // Cyan to Blue
      // Full Blue
      // Green Falls
      b = 1.0;
      g = 1.0 - ((hue - MidpointCyan) / (PeakBlue - MidpointCyan));
    } else if (hue <= MidpointMagenta) {
      // Blue to Magenta
      // Full Blue
      // Red Grows
      b = 1.0;
      r = (hue - PeakBlue) / (MidpointMagenta - PeakBlue);
    } else {
      // Magenta to Red
      // Full Red
      // Blue Falls
      r = 1.0;
      b = 1.0 - ((hue - MidpointMagenta) / (UpperPeakRed - MidpointMagenta));
    }

    return {
      r: Math.min(Math.max(r, 0), 1),
      g: Math.min(Math.max(g, 0), 1),
      b: Math.min(Math.max(b, 0), 1)
    };
  }

  /**
   * Convert the given hue value to RGB(0-255)
   * @param hue 
   */
  public static HueToRGB255(hue: number): RGBColor {
    let color = HueHelper.HueToRGBPercent(hue);
    return {
      r: Math.floor(color.r * 255),
      g: Math.floor(color.g * 255),
      b: Math.floor(color.b * 255)
    };
  }

  /**
   * Convert the given hue value to HTML Hex color code.
   * @param hue 
   */
  public static HueToHex(hue: number): string {
    return HueHelper.RGB255toHex(HueHelper.HueToRGB255(hue));
  }

  /**
   * Convert the given hue, saturation, and brightness to RGB(0.0-1.0)
   * @param hue 
   * @param saturation 
   * @param brightness 
   */
  public static HSBToRGBPercent(hue: number, saturation: number, brightness: number): RGBColor {
    // Get Hue RGB%
    let color: RGBColor = HueHelper.HueToRGBPercent(hue);

    // Calculate saturation percent
    let satPercent = Math.max(Math.min(saturation, 254), 0) / 254;

    // Blend the color with white based on the percent
    let whiteBlend = (1.0 - satPercent);
    color.r = (color.r * satPercent) + whiteBlend;
    color.g = (color.g * satPercent) + whiteBlend;
    color.b = (color.b * satPercent) + whiteBlend;

    // Calculate brightness percent
    let briPercent = brightness / 254;

    // Apply brightness and Lame gamma correction
    color.r = color.r * HueHelper.Rescale(briPercent, 0.0, 1.0, 0.41, 1.0);
    color.g = color.g * HueHelper.Rescale(briPercent, 0.0, 1.0, 0.41, 1.0);
    color.b = color.b * HueHelper.Rescale(briPercent, 0.0, 1.0, 0.4, 1.0);

    return color;
  }

  /**
   * Convert the given hue, saturation, and brightness to RGB(0-255)
   * @param hue 
   * @param saturation 
   * @param brightness 
   */
  public static HSBToRGB255(hue: number, saturation: number, brightness: number): RGBColor {
    let color = HueHelper.HSBToRGBPercent(hue, saturation, brightness);
    return {
      r: Math.floor(color.r * 255),
      g: Math.floor(color.g * 255),
      b: Math.floor(color.b * 255)
    };
  }

  /**
   * Convert the given hue, saturation, and brightness to HTML Hex color code.
   * @param hue 
   * @param saturation 
   * @param brightness 
   */
  public static HSBToHex(hue: number, saturation: number, brightness: number): string {
    return HueHelper.RGB255toHex(HueHelper.HSBToRGB255(hue, saturation, brightness));
  }

  /**
   * Convert CIE 1931 XY to RGB255
   * Source: https://www.developers.meethue.com/documentation/color-conversions-rgb-xy
   */
  public static XYToRGB255(cieColor: CIE1931_XYColor | Array<number>, brightness: number): RGBColor {
    // Page step 3: Calculate XYZ values Convert using the following formulas
    // Get x and y
    const x: number = (cieColor instanceof Array) ? cieColor[0] : cieColor.x;
    const y: number = (cieColor instanceof Array) ? cieColor[1] : cieColor.y;

    // Calculate z
    const z: number = 1.0 - x - y;

    // Get Y
    const Y: number = brightness;

    // Calculate X and Z
    const X = (Y / y) * x;
    const Z = (Y / y) * z;

    // Page step 4: Convert to RGB using Wide RGB D65 conversion
    let r = X * 1.656492 - Y * 0.354851 - Z * 0.255038;
    let g = -X * 0.707196 + Y * 1.655397 + Z * 0.036152;
    let b = X * 0.051713 - Y * 0.121364 + Z * 1.011530;

    // Normalize
    let mag = Math.max(r, g, b);
    r = (r / mag);
    g = (g / mag);
    b = (b / mag);

    // Page step 5: Apply reverse gamma correction
    const magic1: number = 0.0031308;
    const magic2: number = 12.92;
    const magic3: number = 1.0 / 2.4;
    const magic4: number = 0.55;
    const magic5: number = 1.0 + magic4;
    r = (r <= magic1) ? (magic2 * r) : magic5 * Math.pow(r, magic3) - magic4;
    g = (g <= magic1) ? (magic2 * g) : magic5 * Math.pow(g, magic3) - magic4;
    b = (b <= magic1) ? (magic2 * b) : magic5 * Math.pow(b, magic3) - magic4;

    // Normalize and clamp to 0
    mag = Math.max(r, g, b);
    r = Math.max((r / mag), 0);
    g = Math.max((g / mag), 0);
    b = Math.max((b / mag), 0);


    return {
      r: Math.floor(r * 255),
      g: Math.floor(g * 255),
      b: Math.floor(b * 255)
    };
  }

  /**
   * Convert CIE 1931 XY to Hex
   * Author: Chris McGhee
   * @param cieColor 
   * @param brightness 
   */
  public static XYtoHex(cieColor: CIE1931_XYColor | Array<number>, brightness: number): string {
    return HueHelper.RGB255toHex(HueHelper.XYToRGB255(cieColor, brightness));
  }

  /**
   * Convert RGB255 to Hex code
   * Author: Chris McGhee
   * @param color 
   */
  public static RGB255toHex(color: RGBColor): string {
    // Convert to hex
    let rC = color.r.toString(16);
    let gC = color.g.toString(16);
    let bC = color.b.toString(16);

    // Padd
    if (rC.length < 2) { rC = '0' + rC; }
    if (gC.length < 2) { gC = '0' + gC; }
    if (bC.length < 2) { bC = '0' + bC; }
    return '#' + rC + gC + bC;
  }

  private static Rescale(InputValue: number, InputMin: number, InputMax: number, OutputMin: number, OutputMax: number) {
    let percent: number = (InputValue - InputMin) / (InputMax - InputMin);
    return OutputMin + (percent * (OutputMax - OutputMin));
  }

}