"use strict";
const { publishCampaign } = require("../src/core/publisher");
module.exports = async function handler(req,res){
  if(req.method !== "POST") return res.status(405).json({ok:false,error:"method not allowed"});
  if(!req.body || typeof req.body !== "object" || Array.isArray(req.body)) return res.status(400).json({ok:false,error:"corpo da requisição inválido: esperado um objeto JSON."});
  try { const result = await publishCampaign(req.body); return res.status(200).json({ok:true,result}); }
  catch(err){ console.error("ERRO NO PUBLISH",err); return res.status(500).json({ok:false,error:String((err && err.message)||err)}); }
};