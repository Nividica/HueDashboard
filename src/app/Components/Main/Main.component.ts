import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { ActivatedRouteSnapshot } from "@angular/router/src/router_state";

@Component({
  selector: 'app-hue',
  templateUrl: './Main.template.html',
  styleUrls: ['./Main.style.css']
})
export class MainAppComponent implements OnInit {

  public constructor(private Router: Router,
    private ActivatedRoute: ActivatedRoute,
    private TitleService: Title) {
  }

  public ngOnInit(): void {
    // Watch navigation events for title changes
    this.Router.events.subscribe((event) => {
      // Navigation is ending?
      // Primary outlet?
      if ((event instanceof NavigationEnd) && (this.ActivatedRoute.outlet === 'primary')) {
        // Get the routes in reverse order (last child first)
        const routes: Array<ActivatedRouteSnapshot> = this.ActivatedRoute.snapshot.children.reverse();
        for (const child of routes) {
          // Does this child have a title?
          if (child.data && child.data['Title']) {
            // Set the title
            this.TitleService.setTitle('Hue | ' + String(child.data['Title']));
            // Done (break if need to do more outside the loop, return if all done)
            return;
          }
        }
      }
    });
  }

}