/**
 * Web Storage
 * Management of local, session, and in-memory variables.
 * Author: Chris McGhee, Nividica@gmail.com
 */

import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';


/**
 * Wraps a value to be saved.
 */
interface StoredVariableWrapper {
  V: any;
}

/**
 * Defines the fn def for a property mutator
 */
type PropertyMutator = (target: Object, propertyName: string) => void;

type Primitive = number | string | boolean;

type PrimitiveArray = Array<Primitive> | Array<Array<Primitive>> | Array<Array<Array<Primitive>>>;

/**
 * Defines types that can be saved.
 */
type StoreableTypes = Primitive | PrimitiveArray;

/**
 * Wraps a value with accessors.
 */
export interface IStoreVariable<VarType extends StoreableTypes> {
  Get(): VarType;

  /**
   * Sets and returns the value of this variable in the store.
   *
   * Note: Will not update if the two values are functionally
   * equavalent.
   */
  Set(value: VarType): VarType;

  /**
   * Removes the variable from the store.
   */
  Remove(): void;

  /**
   * Sets this value back to its default. Returns the value.
   *
   * Note: If that value was not specified, then remove is called instead.
   */
  Reset(): VarType;

  /**
   * Forces the value in the store to be reevaluated, and returns the value. Useful if the value is modified
   * by something other than this instance while this instance exists.
   */
  ForceGet(): VarType;

  /**
   * Forces the value to be written into storage, even if the specified value is (thought) to already be there.
   * Useful if the value is modified by something other than this instance while this instance exists.
   * Returns the value set.
   */
  ForceSet(value: VarType): VarType;

  /**
   * Listens for changes to the value.
   */
  AsObservable(): Observable<VarType>;
}

export enum StoreTypes {
  Local,
  Session,
  InMemory
}

export class StoreFactory {
  /**
   *
   * @param parent
   * @param store
   * @param key
   * @param defaultValue
   */
  public static BuildVariable<VarType extends StoreableTypes>(parent: any, store: StoreTypes, key: string, defaultValue?: VarType): IStoreVariable<VarType> {
    return (store === StoreTypes.InMemory ? StoreFactory.BuildInMemory(defaultValue) : StoreFactory.BuildOnStore(parent, store, key, defaultValue));
  }

  private static BuildOnStore<VarType extends StoreableTypes>(parent: any, store: StoreTypes, key: string, defaultValue?: VarType): IStoreVariable<VarType> {
    const useStore = (store === StoreTypes.Session ? sessionStorage : (store === StoreTypes.Local ? localStorage : null));
    return new StoreVariable<VarType>(parent, useStore, key, defaultValue);
  }

  private static BuildInMemory<VarType extends StoreableTypes>(defaultValue?: VarType): IStoreVariable<VarType> {
    return new MemoryVariable<VarType>(defaultValue);
  }
}

/**
 * Stores a wrapped value in memory.
 *
 * Can be used as a fall-back when stores are not available.
 */
export class MemoryVariable<VarType extends StoreableTypes> implements IStoreVariable<VarType> {
  protected _value: VarType;
  protected _default: VarType;
  private Emitter: BehaviorSubject<VarType> = null;

  public constructor(defaultValue?: VarType) {
    this._default = defaultValue;
    this._value = defaultValue;


    // Create the emitter
    this.Emitter = new BehaviorSubject<VarType>(defaultValue);
  }

  public Get(): VarType {
    return this._value;
  }

  public Set(value: VarType): VarType {
    return this.ForceSet(value);
  }

  public Remove(): void {
    this.Reset();
  }

  public Reset(): VarType {
    return this.ForceSet(this._default);
  }

  public ForceGet(): VarType {
    return this._value;
  }

  public ForceSet(value: VarType): VarType {
    this._value = value;
    this.Emitter.next(value);
    return value;
  }

  public AsObservable(): Observable<VarType> {
    return this.Emitter;
  }

}

/**
 * Wraps a variable that is backed by both an in-memory value and a storage value.
 *
 * The in-memory value provides speedy access, while the storage value provides perminance.
 * The level of this perminance depends on the store that is used.
 */
export class StoreVariable<VarType extends StoreableTypes> implements IStoreVariable<VarType> {

  /**
   * Internal trackers.
   */
  private _value: VarType = null;
  private HasValue: boolean = false;
  private DefaultValue: VarType = null;
  private HasDefault: boolean = false;
  private Emitter: BehaviorSubject<VarType> = null;

  /**
   * Storage calls.
   */
  private StoreGet: () => VarType;
  private StoreSet: (value: VarType) => void;
  private StoreRemove: () => void;

  public constructor(parent: any, store: Storage, key: string, defaultValue?: VarType) {
    this.StoreGet = WebStorage.GenerateGetter<VarType>(parent, store, key);
    this.StoreSet = WebStorage.GenerateSetter<VarType>(parent, store, key);
    this.StoreRemove = WebStorage.GenerateRemover(parent, store, key);
    this.Emitter = new BehaviorSubject<VarType>(defaultValue);

    // Pull the value from the store.
    this.ForceGet();

    if (defaultValue) {
      this.HasDefault = true;
      this.DefaultValue = defaultValue;

      // Set to default if no value was in the store.
      if (!this.HasValue) {
        this.Reset();
      }
    }
    // Set the emitter
    this.Emitter.next(this._value);

  }

  /**
   * Gets the value of this variable, or null.
   */
  public Get(): VarType {
    if (!this.HasValue) { this.ForceGet(); }
    return this._value;
  }

  public Set(value: VarType): VarType {
    if (value !== this._value) {
      this.ForceSet(value);
    }
    return this._value;
  }

  public Remove(): void {
    this._value = null;
    this.HasValue = false;
    this.StoreRemove();
    this.Emitter.next(null);
  }

  public Reset(): VarType {
    if (this.HasDefault) {
      this.Set(this.DefaultValue);
    } else {
      this.Remove();
    }
    return this._value;
  }

  public ForceGet(): VarType {
    this._value = this.StoreGet();
    this.HasValue = (this._value !== null);
    return this._value;
  }

  public ForceSet(value: VarType): VarType {
    this._value = value;
    this.HasValue = true;
    this.StoreSet(value);
    this.Emitter.next(value);
    return this._value;
  }

  public AsObservable(): Observable<VarType> {
    return this.Emitter;
  }

}


class WebStorage {
  /**
   * Adds the property to local storage. This value will live between sessions.
   *
   * Note: Do not set this property equal to a default value. Use the
   * defaultValue argument instead.
   *
   * Bad:
   * @WebStorage.Local(null, 'uName') public UserName: string = 'NoUser';
   *
   * Good:
   * @WebStorage.Local('NoUser', 'uName') public UserName: string;
   *
   * The reason for this is that the value will be assigned when the property
   * is defined, which would overwrite any existing stored value.
   */
  public static Local<T extends StoreableTypes>(defaultValue: any, key?: string): PropertyMutator {
    return WebStorage.AddAccessors<T>(localStorage, defaultValue, key);
  }

  /**
   * Adds the property to session storage. This value will only live as
   * long as the session remains open.
   *
   * Note: Do not set this property equal to a default value. Use the
   * defaultValue argument instead.
   *
   * Bad:
   * @WebStorage.Session(null, 'uName') public UserName: string = 'NoUser';
   *
   * Good:
   * @WebStorage.Session('NoUser', 'uName') public UserName: string;
   *
   * The reason for this is that the value will be assigned when the property
   * is defined, which would overwrite any existing stored value.
   */
  public static Session(defaultValue: any, key?: string): PropertyMutator {
    return WebStorage.AddAccessors(sessionStorage, defaultValue, key);
  }

  /**
   * Creates a function that gets a value from the specified store.
   */
  public static GenerateGetter<T>(target: Object, store: Storage, subKey: string): () => T {
    const key: string = WebStorage.GenKey(target, subKey);

    // Define the getter function
    const getter = function (): T {
      // Is there no value in the store?
      if (!store.hasOwnProperty(key)) {
        return null;
      }

      // Get the value from the storeage
      let wrapper: StoredVariableWrapper = null;
      try {
        wrapper = <StoredVariableWrapper>JSON.parse(store.getItem(key));
      } catch (_) {
        console.log('Unable to parse storage variable: ', key);
        return null;
      }

      // Return the value or null if not found
      return wrapper !== null ? wrapper.V : null;
    };

    return getter;
  }

  /**
   * Creates a function that stores a value in the specified store.
   */
  public static GenerateSetter<T>(target: Object, store: Storage, subKey: string): (value: T) => void {
    const key: string = WebStorage.GenKey(target, subKey);

    // Define the setter
    const setter = function (value: T): void {
      // Create and store the wrapper
      store.setItem(key, JSON.stringify(<StoredVariableWrapper>{ V: value }));
    };

    return setter;
  }

  /**
   * Creates a function that removes the value from the store.
   */
  public static GenerateRemover(target: Object, store: Storage, subKey: string): () => void {
    const key: string = WebStorage.GenKey(target, subKey);
    const remover = function () {
      store.removeItem(key);
    };
    return remover;
  }

  /**
   * Generates a long-form key using the subkey and object name
   */
  private static GenKey(target: Object, subKey: string): string {
    return 'DCP_' + (target.constructor ? target.constructor.name : 'GLOBAL') + '_' + subKey;
  }

  /**
   * Adds a getter and setter to a property which accesses the specified storage.
   */
  private static AddAccessors<T>(store: Storage, defaultValue: T, subKey?: string): PropertyMutator {
    return function (target: Object, propertyName: string) {
      subKey = (subKey || propertyName);

      // Create the getter and setters
      const getter = WebStorage.GenerateGetter<T>(target, store, subKey);
      const setter = WebStorage.GenerateSetter<T>(target, store, subKey);

      // Attach to property
      Object.defineProperty(target, propertyName, {
        get: getter,
        set: setter
      });

      // Is there no value in the store?
      if (!store.hasOwnProperty(subKey)) {
        setter(defaultValue);
      }

    };
  }
}