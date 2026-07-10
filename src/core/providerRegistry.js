"use strict";

const linkedin = require("../channels/linkedin");
const gmail = require("../channels/gmail");

const providers = {

    linkedin,

    gmail

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