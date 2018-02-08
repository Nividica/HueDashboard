/**
 * Defines the structure of the data used by the Config API.
 * Author: Chris McGhee, Nividica@gmail.com
 * Thanks to: http://json2ts.com/
 */

import { Observable } from "rxjs/Observable";

export interface HueConfig_Devicetypes {
  bridge: boolean;
  lights: Array<any>;
  sensors: Array<any>;
}

export interface HueConfig_Swupdate {
  updatestate: number;
  checkforupdate: boolean;
  devicetypes: HueConfig_Devicetypes;
  url: string;
  text: string;
  notify: boolean;
}

export interface HueConfig_Bridge {
  state: string;
  lastinstall: Date;
}

export interface HueConfig_Autoinstall {
  updatetime: string;
  on: boolean;
}

export interface HueConfig_Swupdate2 {
  checkforupdate: boolean;
  lastchange: Date;
  bridge: HueConfig_Bridge;
  state: string;
  autoinstall: HueConfig_Autoinstall;
}

export interface HueConfig_Portalstate {
  signedon: boolean;
  incoming: boolean;
  outgoing: boolean;
  communication: string;
}

export interface HueConfig_Internetservices {
  internet: string;
  remoteaccess: string;
  time: string;
  swupdate: string;
}

export interface HueConfig_Backup {
  status: string;
  errorcode: number;
}

export interface HueConfig_Whitelist_Entry {
  'last use date': Date;
  'create date': Date;
  name: string;
}

export interface HueConfig_Whitelist {
  [Username: string]: HueConfig_Whitelist_Entry
}

export interface HueConfig {
  name: string;
  zigbeechannel: number;
  bridgeid: string;
  mac: string;
  dhcp: boolean;
  ipaddress: string;
  netmask: string;
  gateway: string;
  proxyaddress: string;
  proxyport: number;
  UTC: Date;
  localtime: Date;
  timezone: string;
  modelid: string;
  datastoreversion: string;
  swversion: string;
  apiversion: string;
  swupdate: HueConfig_Swupdate;
  swupdate2: HueConfig_Swupdate2;
  linkbutton: boolean;
  portalservices: boolean;
  portalconnection: string;
  portalstate: HueConfig_Portalstate;
  internetservices: HueConfig_Internetservices;
  factorynew: boolean;
  replacesbridgeid?: any;
  backup: HueConfig_Backup;
  starterkitid: string;
  whitelist: HueConfig_Whitelist;
}


export interface HueConfigAPI {
  GetConfig(): Observable<HueConfig>;
}
