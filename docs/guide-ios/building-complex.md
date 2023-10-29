---
sidebar_position: 2
title: "Building complex projects"
---

This guide will show you how to start the node runtime from a project folder on Android. It builds on top of the [iOS Getting Started](./getting-started.md) instructions, having the same functionality but using a `nodejs-project` folder that contains the Node part of the project. It also shows how to use an npm module in the project.

The complete project can also be downloaded [from the samples repo](https://github.com/nodejs-mobile/nodejs-mobile-samples).

### Create the `nodejs-project` folder

Create a `nodejs-project` folder inside the project and add it as a Resource to the Xcode project. It contains two files inside:

```js title="app/src/main/assets/nodejs-project/main.js"
const http = require('http');
const versions_server = http.createServer( (request, response) => {
  response.end('Versions: ' + JSON.stringify(process.versions));
});
versions_server.listen(3000);
console.log('The node project has started.');
```

```json title="app/src/main/assets/nodejs-project/package.json"
{
  "name": "native-xcode-node-project",
  "version": "0.0.1",
  "description": "node part of the project",
  "main": "main.js",
  "author": "me",
  "license": ""
}
```

### Add a npm module to the `nodejs-project`

Having a `nodejs-project` path with a `package.json` inside is helpful for using npm modules, by running `npm install {module_name}` inside `nodejs-project` so that the modules are also packaged with the application and made available at runtime.

Install the `left-pad` module, by running npm `install left-pad` inside the `nodejs-project` folder.

Update `main.js` to use the module:

```js title="app/src/main/assets/nodejs-project/main.js"
const http = require('http');
// highlight-next-line
const leftPad = require('left-pad');
const versions_server = http.createServer( (request, response) => {
// highlight-next-line
  response.end('Versions: ' + JSON.stringify(process.versions) + ' left-pad: ' + leftPad(42, 5, '0'));
});
versions_server.listen(3000);
```

### Start the node runtime from the Node Project

Change the code that starts the node runtime in `AppDelegate.m` to find the `main.js` inside the Application's bundle and start from there:

```objectivec
- (void)startNode {
    NSString* srcPath = [[NSBundle mainBundle] pathForResource:@"nodejs-project/main.js" ofType:@""];
    NSArray* nodeArguments = [NSArray arrayWithObjects:
                                @"node",
                                srcPath,
                                nil
                                ];
    [NodeRunner startEngineWithArguments:nodeArguments];
}
```