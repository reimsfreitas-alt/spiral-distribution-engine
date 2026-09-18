"use strict";
const registry = require("../src/core/providerRegistry");
module.exports = function handler(req,res){
  res.setHeader("Cache-Control","no-store");
  res.status(200).json({ total: registry.list().length, providers: registry.list() });
};