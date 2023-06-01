// Use https://www.npmjs.com/package/nanoid to create unique IDs
const { nanoid } = require('nanoid');

// const { randomUUID } = require('crypto');
// const randomId = randomUUID();
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');
const logger = require('../logger');
const mime = require('mime-types');
const sharp = require('sharp');
const md = require('markdown-it')({
  html: true,
});

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');
//supposed to be ./data

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    // TODO
    if (!ownerId) {
      throw new Error('ownerId is required');
    } else if (!type) {
      throw new Error('type is required');
    } else if (!Fragment.isSupportedType(type)) {
      throw new Error('invalid type');
    } else if (typeof size !== 'number') {
      throw new Error('size must be a number');
    } else if (size < 0) {
      throw new Error('size cannot be negative');
    } else {
      this.id = id || nanoid();
      this.ownerId = ownerId;
      this.created = created || new Date().toISOString();
      this.updated = updated || new Date().toISOString();
      this.type = type;
      this.size = size;
    }
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    // TODO
    try {
      const returnedList = await listFragments(ownerId, expand);
      if (returnedList) {
        logger.info('list of fragments returned');
        return returnedList;
      }
    } catch (error) {
      logger.warn({ error }, 'Error getting fragments, return empty array');
      return [];
    }
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    // TODO
    try {
      logger.info(`fragment ${ownerId} read`);
      return new Fragment(await readFragment(ownerId, id));
    } catch (error) {
      logger.error({ error }, 'Error reading fragment');
      throw new Error('Error reading fragment');
    }
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise
   */
  static delete(ownerId, id) {
    // TODO
    // try {
    if (deleteFragment(ownerId, id)) {
      logger.info(`fragment ${ownerId} deleted`);
      return deleteFragment(ownerId, id);
    }
    // } catch (error) {
    //   logger.error({ error }, 'Error deleting fragment');
    //   throw new Error('Error deleting fragment');
    // }
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise
   */
  save() {
    // TODO
    // try {
    this.updated = new Date().toISOString();
    logger.info(`fragment updated with date`);
    return writeFragment(this);
    // } catch (error) {
    //   logger.error({ error }, 'Error saving fragment');
    //   throw new Error('Error saving fragment');
    // }
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    // TODO
    try {
      logger.info(`fragment data retrieved`);
      return readFragmentData(this.ownerId, this.id);
    } catch (error) {
      logger.error({ error }, 'Error getting fragment data');
      throw new Error('Error getting fragment data');
    }
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise
   */
  async setData(data) {
    // TODO
    if (Buffer.isBuffer(data)) {
      //check if data is buffer

      try {
        this.size = Buffer.byteLength(data);
        //update Buffer's size in this.size
        this.save();
        //update date and save
        logger.info(`fragment data ${this.ownerId} saved`);
        return await writeFragmentData(this.ownerId, this.id, data);
      } catch (error) {
        logger.error({ error }, 'Error writing fragment data');
        throw new Error('Error writing fragment data');
      }
    } else {
      throw new Error('data is not a Buffer');
    }
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    // TODO
    if (this.mimeType.match(/text\/+/)) return true;
    else return false;
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    // TODO
    //support text/ and application/json
    if (this.mimeType === 'text/plain') {
      return ['text/plain'];
    } else if (this.mimeType === 'text/markdown') {
      return ['text/plain', 'text/markdown', 'text/html'];
    } else if (this.mimeType === 'text/html') {
      return ['text/plain', 'text/html'];
    } else if (this.mimeType === 'application/json') {
      return ['text/plain', 'application/json'];
    } else {
      return ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    }
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    // TODO
    logger.debug(`is ${value} supported type?`);
    //return value === 'text/plain' ? true : false;
    return value.startsWith('text/') ||
      value.match('application/json') ||
      value.startsWith('image/')
      ? true
      : false;
  }

  /**
   * Returns the data converted to the desired type
   * @param {Buffer} data fragment data to be converted
   * @param {string} extension the type extension you want to convert to (desired type)
   * @returns {Buffer} converted fragment data
   */
  async convertType(data, extension) {
    let toType = mime.lookup(extension);
    const convertable = this.formats;

    logger.debug(this.type + ' | ' + this.mimeType);
    logger.debug('convertable formats: ' + convertable);

    if (!convertable.includes(toType)) {
      logger.warn('Cannot convert fragment to this type');
      return false;
    }

    let convertedF = data;
    if (this.mimeType !== toType) {
      if (this.mimeType === 'text/markdown' && toType === 'text/html') {
        convertedF = md.render(data.toString());
        convertedF = Buffer.from(convertedF);
      } else if (toType === 'image/jpeg') {
        convertedF = await sharp(data).jpeg().toBuffer();
      } else if (toType === 'image/png') {
        convertedF = await sharp(data).png().toBuffer();
      } else if (toType === 'image/webp') {
        convertedF = await sharp(data).webp().toBuffer();
      } else if (toType === 'image/gif') {
        convertedF = await sharp(data).gif().toBuffer();
      }
    }
    return { convertedF, convertedType: toType };
  }
}

module.exports.Fragment = Fragment;
