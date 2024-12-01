"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const parameters_1 = require("./parameters");
const debug_1 = __importDefault(require("debug"));
const debug = (0, debug_1.default)('Block Cache');
function expiry(cache, k) {
    debug('delete expired cache entry, key:', k);
    cache.delete(k);
}
class BlockCache {
    /**
     *
     * @param retentionPeriod
     * @param factory Function which returns new cache objects
     */
    constructor(retentionPeriod, factory) {
        this._cache = new Map();
        if (retentionPeriod != null) {
            this._retentionPeriod = retentionPeriod;
        }
        else {
            this._retentionPeriod = parameters_1.parameters.exchangeLifetime * 1000;
        }
        debug(`Created cache with ${this._retentionPeriod / 1000} s retention period`);
        this._factory = factory;
    }
    clearTimeout(key) {
        var _a;
        const timeoutId = (_a = this._cache.get(key)) === null || _a === void 0 ? void 0 : _a.timeoutId;
        if (timeoutId != null) {
            clearTimeout(timeoutId);
        }
    }
