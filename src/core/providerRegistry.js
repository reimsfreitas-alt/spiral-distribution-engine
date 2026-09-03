"use strict";

const linkedin = require("../channels/linkedin");
const gmail = require("../channels/gmail");
const microsoft = require("../channels/microsoft");

const providers = {

    linkedin,

    gmail,

    microsoft

};

function list() {

    return Object.keys(providers);

}

function get(name) {

    return providers[name];

}

module.exports = {

    list,

    get

};