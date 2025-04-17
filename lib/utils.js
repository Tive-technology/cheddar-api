"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeAuthHeader = makeAuthHeader;
function makeAuthHeader({ username, password, }) {
    return `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
}
