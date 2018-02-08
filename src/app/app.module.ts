import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'
import { HttpClientModule } from '@angular/common/http';
import { HueLightInfoComponent } from './Components/HueLightInfo/HueLightInfo.component';
import { HueLightsPage } from './Pages/Lights/Lights.page';
import { HomePage } from './Pages/Home/Home.page';
import { NavComponent } from './Components/Nav/Nav.component';
import { AppRouting } from './app.routing';
import { MainAppComponent } from './Components/Main/Main.component';
import { HueColorPickerComponent } from './Components/HueColorPicker/HueColorPicker.component';
import { BridgeLoginPage } from './Pages/Login/Login.page';
import { BridgeGuard } from './Services/BridgeGuard.service';
import { SessionService } from './Services/Session.service';
import { HueAPI } from './Services/HueAPI.service';


@NgModule({
  declarations: [
    MainAppComponent,
    HomePage,
    HueLightsPage,
    HueLightInfoComponent,
    NavComponent,
    HueColorPickerComponent,
    BridgeLoginPage
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRouting
  ],
  providers: [
    HueAPI,
    BridgeGuard,
    { provide: SessionService, useFactory: SessionService.Singleton }
  ],
  bootstrap: [MainAppComponent]
})
export class AppModule { }
