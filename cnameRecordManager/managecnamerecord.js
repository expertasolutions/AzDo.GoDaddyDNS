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
    var cname = tl.getInput("cname", true);
    var alias = tl.getInput("alias", true);
    var actionType = tl.getInput("actionType", true);
    var ttl = +(tl.getInput("ttl", true));
    
    console.log("GoDaddy API URL: " + goDaddyApiUrl);
    console.log("GoDaddy API Token: " + goDaddyToken);
    console.log("GoDaddy API Secret: " + goDaddySecret);

    console.log("ActionType: " + actionType);
    console.log("DomainName: " + domainName);
    console.log("CName: " + cname);
    console.log("Alias: " + alias);
    console.log("TTL: " + ttl);

    var authToken = "sso-key " + goDaddyToken + ":" + goDaddySecret;

    if(actionType === "createUpdate") {
        const data = JSON.stringify([{
            "data": alias,
            "name": cname,
            "type": "CNAME",
            "ttl": ttl
        }]);

        var options = {
            host: goDaddyApiUrl,
            path: '/v1/domains/' + domainName + '/records/CNAME/' + cname,
            method: 'PUT',
            headers: {
                "Content-Type": "application/json",
                "Content-Length": data.length,
                "Authorization": authToken
            }
        };
    
        const req = http.request(options, response => { 
            console.log(response.statusCode);
        });
    
        req.on('error', error => {
            tl.setResult(tl.TaskResult.Failed, error || 'run() failed');
        });
    
        req.write(data);
        req.end();

    } else if(actionType === "remove") {
        // List the current CNAME Records
        var listOptions = {
            host: goDaddyApiUrl,
            path: '/v1/domains/' + domainName + '/records/CNAME',
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
                var cnameList = JSON.parse(body);
                const index = cnameList.findIndex(x=> x.name.toLowerCase() == cname.toLowerCase());
                if(index > -1){
                   cnameList.splice(index, 1);
                }

                // Update All CNAME records without old one
                const data = JSON.stringify(cnameList);

                var options = {
                    host: goDaddyApiUrl,
                    path: '/v1/domains/' + domainName + '/records/CNAME/',
                    method: 'PUT',
                    headers: {
                        "Content-Type": "application/json",
                        "Content-Length": data.length,
                        "Authorization": authToken
                    }
                };

                const req = http.request(options, response => { });
            
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