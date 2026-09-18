"use strict";
const jobStore = require("../../src/core/jobStore");
module.exports = function handler(req,res){
  const id=req.query && req.query.id;
  const job=jobStore.get(id);
  if(!job) return res.status(404).json({ok:false,error:"job não encontrado"});
  return res.status(200).json({ok:true,job});
};