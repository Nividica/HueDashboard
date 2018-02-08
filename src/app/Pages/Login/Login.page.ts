/**
 * Establishes a bridge link with a set of credentials.
 * Author: Chris McGhee, Nividica@gmail.com
 */

import { Component, OnInit } from "@angular/core";
import { SessionService } from "../../Services/Session.service";
import { HueAPI } from "../../Services/HueAPI.service";
import { HttpErrorResponse } from "@angular/common/http";
import { timeout as ObservableTimeout } from 'rxjs/operators';
import { tap as ObservableTap } from 'rxjs/operators';
import { TimeoutError } from 'rxjs/util/TimeoutError';
import { HueCapabilities } from "../../HueAPI/Types/Capabilities";
import { HueHelper } from "../../HueAPI/HueHelper";
import { Router } from "@angular/router";



@Component({
  selector: 'hue-bridge-login',
  templateUrl: './Login.template.html',
  styleUrls: ['./Login.style.css']
})
export class BridgeLoginPage implements OnInit {

  /**
   * Address of the bridge
   */
  public BridgeIP: string;

  /**
   * Username / API Key
   */
  public BridgeUser: string;

  /**
   * Error message
   */
  public HttpError: string = null;

  /**
   * True when waiting on the bridge.
   */
  public IsWaiting: boolean = false;

  public constructor(private Session: SessionService,
    private HueService: HueAPI,
    private RouterService: Router) {
  }

  public ngOnInit() {
    this.BridgeIP = this.Session.HueBridge.IP.Get();
    this.BridgeUser = this.Session.HueBridge.Username.Get();
  }

  public AttemptLogin() {
    if (this.IsWaiting) { return; }

    // Set the credentials
    this.Session.HueBridge.IP.Set(this.BridgeIP);
    this.Session.HueBridge.Username.Set(this.BridgeUser);

    // Is the service happy with the creds?
    if (!this.HueService.HasBridgeCredentials()) {
      this.HttpError = ('Unspecified Address or Username');
      return;
    }

    this.IsWaiting = true;
    this.HttpError = null;

    // Attempt a connection, 5 second timeout
    let doneWaiting = () => { this.IsWaiting = false; };
    ObservableTap(doneWaiting, doneWaiting)(
      ObservableTimeout(5000)(
        this.HueService.GetCapabilities()
      )
    ).subscribe(
      (response: HueCapabilities) => {
        // Error message from bridge?
        let bridgeErr: string = HueHelper.IsHttpResponseBridgeError(response);
        if (bridgeErr) {
          this.HttpError = bridgeErr;
        } else if (response.lights != null) {
          // Yay! Logged in!
          this.RouterService.navigate(['/']);
        } else {
          // Unknown error
          this.HttpError = ('Invalid bridge response.');
          console.debug(response);
        }
      },
      (err) => {
        if (err instanceof HttpErrorResponse) {
          this.HttpError = (err.message);
          return;

        } else if (err instanceof TimeoutError) {
          this.HttpError = ('Timeout: Bridge did not respond.');
          return;

        }

        this.HttpError = ('Could not communicate with bridge.');
        console.error(err);
      }
      );

  }
}
