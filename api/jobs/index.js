"use strict";
const jobStore = require("../../src/core/jobStore");
module.exports = function handler(req,res){
  const limit=Math.min(Number((req.query && req.query.limit))||50,500);
  res.status(200).json({jobs:jobStore.list({limit})});
};