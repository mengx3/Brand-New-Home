"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto");
const dgram_1 = require("dgram");
const events_1 = require("events");
const coap_packet_1 = require("coap-packet");
const incoming_message_1 = __importDefault(require("./incoming_message"));
const outgoing_message_1 = __importDefault(require("./outgoing_message"));
const observe_read_stream_1 = __importDefault(require("./observe_read_stream"));
const retry_send_1 = __importDefault(require("./retry_send"));
const helpers_1 = require("./helpers");
const segmentation_1 = require("./segmentation");
const block_1 = require("./block");
const parameters_1 = require("./parameters");
const maxToken = Math.pow(2, 32);
const maxMessageId = Math.pow(2, 16);
class Agent extends events_1.EventEmitter {
    constructor(opts) {
        super();
        if (opts == null) {
            opts = {};
        }
        if (opts.type == null) {
            opts.type = 'udp4';
        }
        if (opts.socket != null) {
            const sock = opts.socket;
            opts.type = sock.type;
            delete opts.port;
        }
        this._opts = opts;
        this._init(opts.socket);
    }
    _init(socket) {
        var _a;
        this._closing = false;
        if (this._sock != null) {
            return;
        }
        this._sock = socket !== null && socket !== void 0 ? socket : (0, dgram_1.createSocket)({ type: (_a = this._opts.type) !== null && _a !== void 0 ? _a : 'udp4' });
        this._sock.on('message', (msg, rsinfo) => {
            let packet;
            try {
                packet = (0, coap_packet_1.parse)(msg);
            }
            catch (err) {
                return;
            }
            if (packet.code[0] === '0' && packet.code !== '0.00') {
                // ignore this packet since it's not a response.
                return;
            }
            if (this._sock != null) {
                const outSocket = this._sock.address();
                this._handle(packet, rsinfo, outSocket);
            }
        });
