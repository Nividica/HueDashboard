/**
 * Session Service
 * Management of application specific storage variables, wrapped into an Angular service.
 * Author: Chris McGhee, Nividica@gmail.com
 */

import { Injectable } from '@angular/core';
import { IStoreVariable, StoreTypes, StoreFactory } from '../Library/WebStorage';

enum StoreTestStatus {
  Passed = 0,
  Session_Failure = 1,
  Local_Failure = 2,
  Security_Failure = 4
}

export interface SessionStorageGroup {
  /**
   * Called to setup all internal values.
   * Do not attempt to declare values before this is called.
   */
  Init(storage: StoreTypes): SessionStorageGroup;

  /**
   * Reset all internal values back to defaults.
   */
  ResetAll(): void;

  /**
   * Remove all internal values from store.
   */
  RemoveAll(): void;
}

/**
 * Stores items related to the users session.
 */
@Injectable()
export class SessionService {
  private static _instance: SessionService;
  public static Singleton() {
    return (SessionService._instance ? SessionService._instance : SessionService._instance = new SessionService());
  }

  /**
   * Bridge settings
   */
  public HueBridge: HueBridgeSession = new HueBridgeSession();

  /**
   * If true data will be wrote to local/session storage.
   * False if the browser does not allow stores (Eg In Firefox if cookies are blocked.),
   * or the clients app does not support stores.
   */
  public SupportsStorage: boolean;

  /**
   * Provides a dictionary for storing objects in memory with a lifecycle
   * that is independant of any single component.
   * Do keep in-mind that these values only live for as long as the application does.
   * And that these values are not shared between tabs.
   */
  public MemoryStore = new Map<string, any>();

  /**
   * Memory/Save version.
   */
  private SessionVersion: IStoreVariable<number>;

  private constructor() {
    const Version = 1.0; // Updating this will invalidate all sessions for all users when the app is loaded.

    // Local and Session storage types
    let localStoreType = StoreTypes.Local;
    let sessionStoreType = StoreTypes.Session;

    // Are the stores available?
    const status = this.TestStorage();
    this.SupportsStorage = (status === StoreTestStatus.Passed);

    let needsReset: boolean = false;
    if (this.SupportsStorage) {
      needsReset = this.VersionCheck(Version);
    } else {
      let warning = 'Session data can not be saved due to:';
      if ((status & StoreTestStatus.Local_Failure) === StoreTestStatus.Local_Failure) {
        warning += '[Local Storage Unavailable]';
      }
      if ((status & StoreTestStatus.Session_Failure) === StoreTestStatus.Session_Failure) {
        warning += '[Session Storage Unavailable]';
      }
      if ((status & StoreTestStatus.Security_Failure) === StoreTestStatus.Security_Failure) {
        warning += '[Security/Cookie Settings]';
      }
      console.warn(warning + '. Data can not be saved between app sessions.');

      // Use in-memory instead of local and session
      localStoreType = StoreTypes.InMemory;
      sessionStoreType = StoreTypes.InMemory;
    }

    // Create the vars
    this.HueBridge.Init(sessionStoreType);


    // Need a reset?
    if (needsReset) {
      this.HueBridge.ResetAll();
    }
  }

  /**
   * Attempts to read and write to local and session storage.
   * If both are available, returns true.
   * If either are not available, returns false.
   * Only security exceptions are caught.
   */
  private TestStorage(): StoreTestStatus {
    const tKey: string = 'accessTest';
    const tValue: string = '1';

    try {
      let passed: StoreTestStatus = StoreTestStatus.Passed;

      // Test session
      sessionStorage.setItem(tKey, tValue);
      if (sessionStorage.getItem(tKey) !== tValue) {
        passed = passed | StoreTestStatus.Session_Failure;
      }
      sessionStorage.removeItem(tKey);

      // Test local
      localStorage.setItem(tKey, tValue);
      if (localStorage.getItem(tKey) !== tValue) {
        passed = passed | StoreTestStatus.Local_Failure;
      }
      localStorage.removeItem(tKey);

      return passed;
    } catch (ex) {
      if (ex.name === 'SecurityError') {
        return StoreTestStatus.Security_Failure;
      }
      throw ex;
    }
  }

  /**
   * Tests if the memory layout version number has changed
   */
  private VersionCheck(Version: number): boolean {
    // Do the versions differ?
    this.SessionVersion = StoreFactory.BuildVariable<number>(this, StoreTypes.Local, 'DCP_Version', null);
    if (this.SessionVersion.Get() !== Version) {
      // Memory layout has changed. Wipe all and start over.
      console.info('Detected new session schema. Reseting session data.');
      this.SessionVersion.Set(Version);
      return true;
    }
    return false;
  }
}

/**
 * Bridge data
 */
export class HueBridgeSession implements SessionStorageGroup {
  /**
   * IP address of the local bridge.
   */
  public IP: IStoreVariable<string>;

  /**
   * API username for the local bridge.
   */
  public Username: IStoreVariable<string>;

  Init(storage: StoreTypes): SessionStorageGroup {
    this.IP = StoreFactory.BuildVariable<string>(this, storage, 'HUE_BR_IP', null);
    this.Username = StoreFactory.BuildVariable<string>(this, storage, 'HUE_BR_KEY', null);
    return this;
  }
  ResetAll(): void {
    this.IP.Reset();
    this.Username.Reset();
  }
  RemoveAll(): void {
    this.IP.Remove();
    this.Username.Remove();
  }
}
