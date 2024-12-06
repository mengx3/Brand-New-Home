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
        if (this._opts.port != null) {
            this._sock.bind(this._opts.port);
        }
        this._sock.on('error', (err) => {
            this.emit('error', err);
        });
        this._msgIdToReq = new Map();
        this._tkToReq = new Map();
        this._tkToMulticastResAddr = new Map();
        this._lastToken = Math.floor(Math.random() * (maxToken - 1));
        this._lastMessageId = Math.floor(Math.random() * (maxMessageId - 1));
        this._msgInFlight = 0;
        this._requests = 0;
    }
    close(done) {
        if (this._msgIdToReq.size === 0 && this._msgInFlight === 0) {
            // No requests in flight, close immediately
            this._doClose(done);
            return this;
        }
        done = done !== null && done !== void 0 ? done : (() => { });
        this.once('close', done);
        for (const req of this._msgIdToReq.values()) {
            this.abort(req);
        }
        return this;
    }
    _cleanUp() {
        if (--this._requests !== 0) {
            return;
        }
        if (this._opts.socket == null) {
            this._closing = true;
        }
        if (this._msgInFlight > 0) {
            return;
        }
        this._doClose();
    }
   _doClose(done) {
        for (const req of this._msgIdToReq.values()) {
            req.sender.reset();
        }
        if (this._opts.socket != null) {
            return;
        }
        if (this._sock == null) {
            this.emit('close');
            return;
        }
        this._sock.close(() => {
            this._sock = null;
            if (done != null) {
                done();
            }
            this.emit('close');
        });
    }
    _handle(packet, rsinfo, outSocket) {
        let buf;
        let response;
        let req = this._msgIdToReq.get(packet.messageId);
        const ackSent = (err) => {
            if (err != null && req != null) {
                req.emit('error', err);
            }
            this._msgInFlight--;
            if (this._closing && this._msgInFlight === 0) {
                this._doClose();
            }
        };
        if (req == null) {
            if (packet.token.length > 0) {
                req = this._tkToReq.get(packet.token.toString('hex'));
            }
            if ((packet.ack || packet.reset) && req == null) {
                // Nothing to do on unknown or duplicate ACK/RST packet
                return;
            }
            if (req == null) {
                buf = (0, coap_packet_1.generate)({
                    code: '0.00',
                    reset: true,
                    messageId: packet.messageId
                });
                if (this._sock != null) {
                    this._msgInFlight++;
                    this._sock.send(buf, 0, buf.length, rsinfo.port, rsinfo.address, ackSent);
                }
                return;
            }
        }
        if (packet.confirmable) {
            buf = (0, coap_packet_1.generate)({
                code: '0.00',
                ack: true,
                messageId: packet.messageId
            });
            if (this._sock != null) {
                this._msgInFlight++;
                this._sock.send(buf, 0, buf.length, rsinfo.port, rsinfo.address, ackSent);
            }
        }
        if (packet.code !== '0.00' && (req._packet.token == null || req._packet.token.length !== packet.token.length || Buffer.compare(req._packet.token, packet.token) !== 0)) {
            // The tokens don't match, ignore the message since it is a malformed response
            return;
        }
        const block1Buff = (0, helpers_1.getOption)(packet.options, 'Block1');
        let block1 = null;
        if (block1Buff instanceof Buffer) {
            block1 = (0, block_1.parseBlockOption)(block1Buff);
            // check for error
            if (block1 == null) {
                req.sender.reset();
                req.emit('error', new Error('Failed to parse block1'));
                return;
            }
        }
        req.sender.reset();
        if (block1 != null && packet.ack) {
            // If the client takes too long to respond then the retry sender will send
            // another packet with the previous messageId, which we've already removed.
            const segmentedSender = req.segmentedSender;
            if (segmentedSender != null) {
                // If there's more to send/receive, then carry on!
                if (segmentedSender.remaining() > 0) {
                    if (segmentedSender.isCorrectACK(block1)) {
                        if (req._packet.messageId != null) {
                            this._msgIdToReq.delete(req._packet.messageId);
                        }
                        req._packet.messageId = this._nextMessageId();
                        this._msgIdToReq.set(req._packet.messageId, req);
                        segmentedSender.receiveACK(block1);
                    }
                    else {
                        segmentedSender.resendPreviousPacket();
                    }
                    return;
                }
                else {
                    // console.log("Packet received done");
                    if (req._packet.options != null) {
                        (0, helpers_1.removeOption)(req._packet.options, 'Block1');
                    }
                    delete req.segmentedSender;
                }
            }
        }
       if (!packet.confirmable && !req.multicast) {
            this._msgIdToReq.delete(packet.messageId);
        }
        // Drop empty messages (ACKs), but process RST
        if (packet.code === '0.00' && !packet.reset) {
            return;
        }
        const block2Buff = (0, helpers_1.getOption)(packet.options, 'Block2');
        let block2 = null;
        // if we got blockwise (2) response
        if (block2Buff instanceof Buffer) {
            block2 = (0, helpers_1.parseBlock2)(block2Buff);
            // check for error
            if (block2 == null) {
                req.sender.reset();
                req.emit('error', new Error('failed to parse block2'));
                return;
            }
        }
        if (block2 != null) {
            if (req.multicast) {
                req = this._convertMulticastToUnicastRequest(req, rsinfo);
                if (req == null) {
                    return;
                }
            }
            // accumulate payload
            req._totalPayload = Buffer.concat([req._totalPayload, packet.payload]);
            if (block2.more === 1) {
                // increase message id for next request
                if (req._packet.messageId != null) {
                    this._msgIdToReq.delete(req._packet.messageId);
                }
                req._packet.messageId = this._nextMessageId();
                this._msgIdToReq.set(req._packet.messageId, req);
                // next block2 request
                const block2Val = (0, helpers_1.createBlock2)({
                    more: 0,
                    num: block2.num + 1,
                    size: block2.size
                });
                if (block2Val == null) {
                    req.sender.reset();
                    req.emit('error', new Error('failed to create block2'));
                    return;
                }
                req.setOption('Block2', block2Val);
                req._packet.payload = undefined;
                req.sender.send((0, coap_packet_1.generate)(req._packet));
                return;
            }
            else {
                // get full payload
                packet.payload = req._totalPayload;
                // clear the payload incase of block2
                req._totalPayload = Buffer.alloc(0);
            }
        }
const observe = req.url.observe != null && [true, 0, '0'].includes(req.url.observe);
        if (req.response != null) {
            const response = req.response;
            if (response.append != null) {
                // it is an observe request
                // and we are already streaming
                return response.append(packet);
            }
            else {
                // TODO There is a previous response but is not an ObserveStream !
                return;
            }
        }
        else if (block2 != null && packet.token != null && !observe) {
            this._tkToReq.delete(packet.token.toString('hex'));
        }
        else if (!observe && !req.multicast) {
            // it is not, so delete the token
            this._tkToReq.delete(packet.token.toString('hex'));
        }
        if (observe && packet.code !== '4.04') {
            response = new observe_read_stream_1.default(packet, rsinfo, outSocket);
            response.on('close', () => {
                this._tkToReq.delete(packet.token.toString('hex'));
                this._cleanUp();
            });
            response.on('deregister', () => {
                const deregisterUrl = Object.assign({}, req === null || req === void 0 ? void 0 : req.url);
                deregisterUrl.observe = 1;
                deregisterUrl.token = req === null || req === void 0 ? void 0 : req._packet.token;
                const deregisterReq = this.request(deregisterUrl);
                // If the request fails, we'll deal with it with a RST message anyway.
                deregisterReq.on('error', () => { });
                deregisterReq.end();
            });
        }
        else {
            response = new incoming_message_1.default(packet, rsinfo, outSocket);
        }
        if (!req.multicast) {
            req.response = response;
        }
        req.emit('response', response);
    }
    _nextToken() {
        const buf = Buffer.alloc(8);
        if (++this._lastToken === maxToken) {
            this._lastToken = 0;
        }
        buf.writeUInt32BE(this._lastToken, 0);
        crypto.randomBytes(4).copy(buf, 4);
        return buf;
    }
