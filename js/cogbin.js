//@ts-check

/**
 * @param {Uint8Array} bytes
 */
function rleDecode(bytes) {
  let s = "";
  for (let i = 0; i < bytes.length; i += 1) {
    let c = String.fromCharCode(bytes[i + 1]);
    for (let j = bytes[i] - 1; j > -1; j--)
      s += c;
  }
  return s;
}

class CogBinEl extends CogAsset {
  /** @override */
  get loader() {
    return CogBinElLoader;
  }

  /**
   * @param {CogContent} content
   * @param {string} path
   */
  constructor(content, path) {
    super(content, path);

    /** @type {string} */
    this.package = null;
    /** @type {string} */
    this.name = null;
    /** @type {Object.<string, any>} */
    this.attributes = null;
    /** @type {Array<CogBinEl>} */
    this.children = null;
  }
}

var CogBinElLoader = new (class CogBinElLoader extends CogAssetLoader {
  /**
   * @param {CogContent} content
   * @param {CogBinEl} el
   * @param {CogDataSrc} src
   * @param {string} path
   * @returns {Promise<CogBinEl>}
   */
  async load(content, el, src, path) {
    let reader = await src.loadBinary(path);

    reader.readString(); // ???
    el.package = reader.readString();

    let stringLookup = new Array(reader.readInt16());
    for (let i = 0; i < stringLookup.length; i++)
      stringLookup[i] = reader.readString();

    /**
     * @param {CogBinEl} [el]
     * @returns {CogBinEl}
     */
    function readElement(el) {
      el = el || new CogBinEl(null, null);

      el.name = stringLookup[reader.readInt16()];

      let attributes = reader.readByte();
      el.attributes = {};
      for (let i = 0; i < attributes; i++) {
        let key = stringLookup[reader.readInt16()];
        let value;
        switch (reader.readByte()) {
          case 0: value = reader.readBoolean(); break;
          case 1: value = reader.readByte(); break;
          case 2: value = reader.readInt16(); break;
          case 3: value = reader.readInt32(); break;
          case 4: value = reader.readSingle(); break;
          case 5: value = stringLookup[reader.readInt16()]; break;
          case 6: value = reader.readString(); break;
          case 7: value = rleDecode(reader.readBytes(reader.readInt16())); break;
        }
        el.attributes[key] = value;
      }

      let children = reader.readUint16();
      el.children = new Array(children);
      for (let i = 0; i < children; i++)
        el.children[i] = readElement();
      
      return el;
    }
    
    return readElement(el);
  }
})();
