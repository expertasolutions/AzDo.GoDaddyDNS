"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });

var tl = require('azure-pipelines-task-lib');
var shell = require('node-powershell');

try {

    var goDaddyEndpoint = tl.getInput("godaddyAccount", true);
    var goDaddyToken = tl.getEndpointAuthorizationParameter(goDaddyEndpoint, "apitoken", false);
    var goDaddySecret = tl.getEndpointAuthorizationParameter(goDaddyEndpoint, "apisecret", false);

    var goDaddyToken = tl.getInput("godaddyKey", true);
    var goDaddySecret = tl.getInput("godaddySecret", true);
    var domainName = tl.getInput("domainName", true);
    var aName = tl.getInput("aName", true);

    var actionType = tl.getInput("actionType", true);

    var ipRequired = actionType == "createUpdate";

    var ipAddress = tl.getInput("ipAddress", ipRequired);
    var ttl = tl.getInput("ttl", true);
    
    console.log("GoDaddyKey: " + goDaddyToken);
    console.log("GoDaddySecret: " + goDaddySecret);
    console.log("ActionType: " + actionType);
    console.log("DomainName: " + domainName);
    console.log("A Name: " + aName);
    console.log("Ip Address: " + ipAddress);
    console.log("TTL (seconds): " + ttl);
    
} catch (err) {
    tl.setResult(tl.TaskResult.Failed, err.message || 'run() failed');
}