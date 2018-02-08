import { Injectable } from "@angular/core";
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { Observable } from "rxjs/Observable";
import { HueAPI } from "./HueAPI.service";



@Injectable()
export class BridgeGuard implements CanActivate {

  private HueService: HueAPI;

  private RouterService: Router;

  public constructor(hueAPI: HueAPI, router: Router) {
    this.HueService = hueAPI;
    this.RouterService = router;
  }

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
    if (this.HueService.HasBridgeCredentials()) {
      return true;
    }

    // Redirect shortly
    setTimeout(() => {
      this.RouterService.navigate(['login'], { relativeTo: null });
    }, 100);

    return false;
  }
}