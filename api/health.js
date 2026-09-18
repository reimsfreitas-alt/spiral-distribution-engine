"use strict";
module.exports = function handler(req,res){
  let version="1.0.0";
  try { version=require("../package.json").version; } catch {}
  const registry=require("../src/core/providerRegistry");
  res.setHeader("Cache-Control","no-store");
  res.status(200).json({
    service:"distribution-engine",status:"online",version,
    build:process.env.SPIRAL_BUILD||"vercel",
    uptimeSeconds:Math.round(process.uptime()),
    ledger:process.env.LEDGER_URL||"http://localhost:4700",
    providers:registry.list().map(p=>p.name),
    heartbeat:new Date().toISOString()
  });
};