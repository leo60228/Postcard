//@ts-check

const ERR_NOIMPL = "Not implemented!";

class CogBinaryReader {
  /**
   * @param {DataView} view
   */
  constructor(view) {
    this.view = view;
    this.position = 0;
    this.littleEndian = true;
  }

  readLEB128() {
    let result = 0;
    let shift = 0;
    while (true) {
      let byte = this.readSByte();
      result |= (byte & 0x7F) << shift;
      if ((byte & 0x80) === 0)
        break;
      shift += 7;
    }
    return result;
  }

  readString() {
    return String.fromCharCode(...this.readBytes(this.readLEB128()));
  }

  readBoolean() {
    return this.readByte() > 0;
  }

  /**
   * @param {number} length
   */
  readBytes(length) {
    let data = new Uint8Array(this.view.buffer, this.position, length);
    this.position += length;
    return data;
  }

  /**
  * Gets the Float32 value at the specified byte offset from the start of the view. There is
  * no alignment constraint; multi-byte values may be fetched from any offset.
  * @param {boolean} [littleEndian]
  * @returns {number}
  */
  readSingle(littleEndian) {
    let byteOffset = this.position;
    this.position += 4;
    return this.view.getFloat32(byteOffset, littleEndian !== undefined ? littleEndian : this.littleEndian);
  }
  
  /**
   * Gets the Float64 value at the specified byte offset from the start of the view. There is
   * no alignment constraint; multi-byte values may be fetched from any offset.
   * @param {boolean} [littleEndian]
   * @returns {number}
   */
  readDouble(littleEndian) {
    let byteOffset = this.position;
    this.position += 8;
    return this.view.getFloat64(byteOffset, littleEndian !== undefined ? littleEndian : this.littleEndian);
  }
  
  /**
   * Gets the Int8 value at the specified byte offset from the start of the view. There is
   * no alignment constraint; multi-byte values may be fetched from any offset.
   * @returns {number}
   */
  readSByte() {
    let byteOffset = this.position;
    this.position += 1;
    return this.view.getInt8(byteOffset);
  }
  
  /**
   * Gets the Int16 value at the specified byte offset from the start of the view. There is
   * no alignment constraint; multi-byte values may be fetched from any offset.
   * @param {boolean} [littleEndian]
   * @returns {number}
   */
  readInt16(littleEndian) {
    let byteOffset = this.position;
    this.position += 2;
    return this.view.getInt16(byteOffset, littleEndian !== undefined ? littleEndian : this.littleEndian);
  }
  /**
   * Gets the Int32 value at the specified byte offset from the start of the view. There is
   * no alignment constraint; multi-byte values may be fetched from any offset.
   * @param {boolean} [littleEndian]
   * @returns {number}
   */
  readInt32(littleEndian) {
    let byteOffset = this.position;
    this.position += 4;
    return this.view.getInt32(byteOffset, littleEndian !== undefined ? littleEndian : this.littleEndian);
  }
  
  /**
   * Gets the Uint8 value at the specified byte offset from the start of the view. There is
   * no alignment constraint; multi-byte values may be fetched from any offset.
   * @returns {number}
   */
  readByte() {
    let byteOffset = this.position;
    this.position += 1;
    return this.view.getUint8(byteOffset);
  }
  
  /**
   * Gets the Uint16 value at the specified byte offset from the start of the view. There is
   * no alignment constraint; multi-byte values may be fetched from any offset.
   * @param {boolean} [littleEndian]
   * @returns {number}
   */
  readUint16(littleEndian) {
    let byteOffset = this.position;
    this.position += 2;
    return this.view.getUint16(byteOffset, littleEndian !== undefined ? littleEndian : this.littleEndian);
  }
  
  /**
   * Gets the Uint32 value at the specified byte offset from the start of the view. There is
   * no alignment constraint; multi-byte values may be fetched from any offset.
   * @param {boolean} [littleEndian]
   * @returns {number}
   */
  readUint32(littleEndian) {
    let byteOffset = this.position;
    this.position += 4;
    return this.view.getUint32(byteOffset, littleEndian !== undefined ? littleEndian : this.littleEndian);
  }

}

/**
 * @abstract
 */
class CogDataSrc {
  /**
   * @abstract
   * @param {string} path
   * @returns {Promise<CogBinaryReader>}
   */
  async loadBinary(path) {
    throw new Error(ERR_NOIMPL);
  }

  /**
   * @abstract
   * @param {string} path
   * @returns {Promise<string>}
   */
  async loadText(path) {
    throw new Error(ERR_NOIMPL);
  }
}

class CogDataWebSrc extends CogDataSrc {
  /** @param {function(string) : string} transformer */
  constructor(transformer) {
    super();
    this.transformer = transformer || (p => p);
  }

  /**
   * @override
   * @param {string} path
   * @returns {Promise<CogBinaryReader>}
   */
  async loadBinary(path) {
    let url = this.transformer(path);
    console.log("[CogDataWebSrc]", "GET BINARY:", path, "=>", url);
    return new CogBinaryReader(new DataView(await fetch(url).then(r => r.arrayBuffer())));
  }

  /**
   * @override
   * @param {string} path
   * @returns {Promise<string>}
   */
  async loadText(path) {
    let url = this.transformer(path);
    console.log("[CogDataWebSrc]", "GET TEXT:", path, "=>", url);
    return await fetch(url).then(r => r.text());
  }
}

class CogContent {
  /**
   * @param {CogDataSrc[]} sources
   */
  constructor(...sources) {
    this.sources = sources;
    /** @type {Object.<string, CogAsset>} */    
    this.map = {};
  }

  /**
   * @param {string} path
   * @returns {Promise<CogBinaryReader>}
   */
  async _loadBinary(path) {
    let elist = [];
    for (let src of this.sources)
      try {
        return await src.loadBinary(path);
      } catch (e) {
        elist.push(e);
      }
    throw elist;
  }

  /**
   * @param {string} path
   * @returns {Promise<string>}
   */
  async _loadText(path) {
    let elist = [];
    for (let src of this.sources)
      try {
        return await src.loadText(path);
      } catch (e) {
        elist.push(e);
      }
    throw elist;
  }

  /**
   * @template T
   * @param {T & typeof CogAsset} type
   * @param {string} id
   * @param {string} [path]
   * @param {any[]} args
   * @returns {Promise<T["prototype"] & CogAsset>}
   */
  async load(type, id, path, ...args) {
    /** @type {CogAsset} */
    let asset;
    if (id && (asset = this.get(type, id)))
      // @ts-ignore Type is checked by get.
      return asset;

    console.log("[CogContent]", "Loading:", type.name, id, path, ...args);

    asset = Reflect.construct(type, [this, path]);
    let loaded = false;

    let elist = [];
    for (let src of this.sources)
      try {
        asset = await type.prototype.loader.load(this, asset, src, path, ...args);
        loaded = true;
      } catch (e) {
        elist.push(e);
      }
    if (!loaded)
      throw elist;


    if (id)
      this.map[id] = asset;
    // @ts-ignore Type is guaranteed to match.
    return asset;
  }

  /**
   * @template T
   * @param {T & typeof CogAsset} type
   * @param {string} id
   * @returns {T["prototype"] & CogAsset}
   */
  get(type, id) {
    let value = this.map[id];
    if (!value)
      return null;
    if (type !== value.constructor)
      throw new Error(`Expected ${type.name}, got ${value.constructor.name}`);
    // @ts-ignore Type is checked above.
    return value;
  }
}

/**
 * @abstract
 */
class CogAsset {
  /**
   * @abstract
   * @returns {CogAssetLoader}
   */
  get loader() {
    throw new Error(ERR_NOIMPL);
  }

  /**
   * @abstract
   * @returns {string}
   */
  get dataURL() {
    throw new Error(ERR_NOIMPL);
  }

  /**
   * @virtual
   * @returns {boolean}
   */
  get isPixiLoadable() {
    return Object.getOwnPropertyDescriptor(this, "dataURL") !== Object.getOwnPropertyDescriptor(CogAsset.prototype, "dataURL") && !!this.path;
  }

  /**
   * @param {CogContent} content
   * @param {string} path
   */
  constructor(content, path) {
    if (content)
      this._content = content;
    if (path)
      this.path = path;
  }
}

/**
 * @abstract
 * @template T
 */
class CogAssetLoader {
  /**
   * @abstract
   * @param {CogContent} content
   * @param {T} asset
   * @param {CogDataSrc} src
   * @param {string} path
   * @param {any[]} args
   * @returns {Promise<T>}
   */
  async load(content, asset, src, path, ...args) {
    throw new Error(ERR_NOIMPL);
  }
}
