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
var http = require('https');

try {
    var goDaddyEndpoint = tl.getInput("godaddyAccount", true);
    var url = tl.getEndpointUrl(goDaddyEndpoint, true);
    var goDaddyApiUrl = url.replace("http://", "").replace("https://", "").replace('/', '');
    var goDaddyToken = tl.getEndpointAuthorizationParameter(goDaddyEndpoint, "apitoken", false);
    var goDaddySecret = tl.getEndpointAuthorizationParameter(goDaddyEndpoint, "apisecret", false);

    var domainName = tl.getInput("domainName", true);
    var aName = tl.getInput("aName", true);
    var ipAddress = tl.getInput("ipAddress", true);
    var actionType = tl.getInput("actionType", true);
    var ttl = +(tl.getInput("ttl", true));

    console.log("GoDaddy API URL: " + goDaddyApiUrl);
    console.log("GoDaddy API Token: " + goDaddyToken);
    console.log("GoDaddy API Secret: " + goDaddySecret);

    console.log("ActionType: " + actionType);
    console.log("DomainName: " + domainName);
    console.log("A: " + aName);
    console.log("IPAddress: " + ipAddress);
    console.log("TTL: " + ttl);

    var authToken = "sso-key " + goDaddyToken + ":" + goDaddySecret;

    if(actionType === "createUpdate") {
        const data = JSON.stringify([{
            "data": ipAddress,
            "name": aName,
            "type": "A",
            "ttl": ttl
        }]);

        var options = {
            host: goDaddyApiUrl,
            path: '/v1/domains/' + domainName + '/records/A/' + aName,
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                "Content-Length": data.length,
                "Authorization": authToken
            }
        };
    
        const req = http.request(options, response => {
            
        });
    
        req.on('error', error => {
            tl.setResult(tl.TaskResult.Failed, error || 'run() failed');
        });
    
        req.write(data);
        req.end();

    } else if(actionType === "remove") {
        // List the current A Records
        var listOptions = {
            host: goDaddyApiUrl,
            path: '/v1/domains/' + domainName + '/records/A',
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": authToken
            }
        };
        http.request(listOptions, r => {
            var body = '';

            r.on('data', d => {
                body += d;
            });
              
            r.on('end', () => {
                console.log(body);
                var aList = JSON.parse(body);
                const index = aList.findIndex(x=> x.name.toLowerCase() == aName.toLowerCase());
                if(index > -1){
                   aList.splice(index, 1);
                }

                // Update All A records without old one
                const data = JSON.stringify(aList);
                console.log("show data:");
                console.log(data);

                var options = {
                    host: goDaddyApiUrl,
                    path: '/v1/domains/' + domainName + '/records/A/',
                    method: 'PUT',
                    headers: {
                        "Content-Type": "application/json",
                        "Content-Length": data.length,
                        "Authorization": authToken
                    }
                };

                const req = http.request(options, response => { 
                    console.log(response.statusCode);
                    response.on('data', dt => { });
                });
            
                req.on('error', error => {
                    tl.setResult(tl.TaskResult.Failed, error || 'run() failed');
                });
                
                req.write(data);
                req.end();
            });
            
        }).on("error", err => {
            tl.setResult(tl.TaskResult.Failed, err || 'run() failed');
        }).end();
    }
} catch (err) {
    tl.setResult(tl.TaskResult.Failed, err.message || 'run() failed');
}