---
sidebar_position: 2
title: "React Native bridge"
---

### Methods available in the React Native layer

These methods can be called from the React Native javascript code directly:

```js
import nodejs from 'nodejs-mobile-react-native';
```

- `nodejs.start`
- `nodejs.startWithScript`
- `nodejs.channel.addListener`
- `nodejs.channel.post`
- `nodejs.channel.send`

:::note
`nodejs.channel.send(...msg)` is equivalent to `nodejs.channel.post('message', ...msg)`. It is maintained for backward compatibility purposes.
:::

:::note
The `nodejs.channel` object inherits from [React Native's EventEmitter class](https://github.com/facebook/react-native/blob/055c941c4045468af4ff2b8162d3a35dd993b1b9/Libraries/vendor/emitter/EventEmitter.js), with `emit` removed and `post` and `send` added.
:::

#### nodejs.start(scriptFileName [, options])

Starts the nodejs-mobile runtime thread with a file inside the `nodejs-project` directory.

| Parameter | Type |
|-----------|------|
| scriptFileName | `string` |
| options | [StartupOptions](#startupoptions-object) |

#### nodejs.startWithScript(scriptBody [, options])

Starts the nodejs-mobile runtime thread with a script body.

| Parameter | Type |
|-----------|------|
| scriptBody | `string` |
| options | [StartupOptions](#startupoptions-object) |

#### nodejs.channel.addListener(event, callback)

Registers a callback for user-defined events raised from the nodejs-mobile side.

| Parameter | Type |
|-----------|------|
| event | `string` |
| callback | [function](#channel-callback-functionarg) |

#### nodejs.channel.post(event, ...message)

Raises a user-defined event on the nodejs-mobile side.

| Parameter | Type |
|-----------|------|
| event | `string` |
| ...message | any JS type that can be serialized with `JSON.stringify` and deserialized with `JSON.parse` |

#### nodejs.channel.send(...message)

Raises a 'message' event on the nodejs-mobile side. It is an alias for `nodejs.channel.post('message', ...message)`.

| Parameter | Type |
|-----------|------|
| ...message | any JS type that can be serialized with `JSON.stringify` and deserialized with `JSON.parse` |

#### StartupOptions: `object`

|Name|Type|Default|Description|
|----|----|-------|-----------|
|redirectOutputToLogcat|`boolean`|`true`|Allows to disable the redirection of the Node stdout/stderr to the Android logcat|

### Methods available in the Node layer

The following methods can be called from the Node javascript code through the `rn-bridge` module:

```js
const rn_bridge = require('rn-bridge');
```

- `rn_bridge.channel.on`
- `rn_bridge.channel.post`
- `rn_bridge.channel.send`
- `rn_bridge.app.on`
- `rn_bridge.app.datadir`

:::note
`rn_bridge.channel.send(...msg)` is equivalent to `rn_bridge.channel.post('message', ...msg)`. It is maintained for backward compatibility purposes.
:::

:::note
The `rn_bridge.channel` object inherits from [Node's EventEmitter class](https://github.com/nodejs-mobile/nodejs-mobile/blob/main/lib/events.js), with `emit` removed and `post` and `send` added.
:::

#### rn_bridge.channel.on(event, callback)

Registers a callback for user-defined events raised from the React Native side.

| Parameter | Type |
|-----------|------|
| event | `string` |
| callback | [function](#channel-callback-functionarg) |

:::note
To receive messages from React Native's `nodejs.channel.send`, use `rn_bridge.channel.on('message', listenerCallback)`.
:::

#### rn_bridge.channel.post(event, ...message)

Raises a user-defined event on the React Native side.

| Parameter | Type |
|-----------|------|
| event | `string` |
| ...message | any JS type that can be serialized with `JSON.stringify` and deserialized with `JSON.parse` |

#### rn_bridge.channel.send(...message)

Raises a 'message' event on the React Native side. It is an alias for `rn_bridge.channel.post('message', ...message)`.

| Parameter | Type |
|-----------|------|
| ...message | any JS type that can be serialized with `JSON.stringify` and deserialized with `JSON.parse` |


#### rn_bridge.app.on(event, callback)

Registers callbacks for App events. Currently supports the 'pause' and 'resume' events, which are raised automatically when the app switches to the background/foreground.

| Parameter | Type |
|-----------|------|
| event | `string` |
| callback | `function` |

```js
rn_bridge.app.on('pause', (pauseLock) => {
  console.log('[node] app paused.');
  pauseLock.release();
});

rn_bridge.app.on('resume', () => {
  console.log('[node] app resumed.');
});
```

The 'pause' event is raised when the application switches to the background. On iOS, the system will wait for the 'pause' event handlers to return before finally suspending the application. For the purpose of letting the iOS application know when it can safely suspend after going to the background, a `pauseLock` argument is passed to each 'pause' listener, so that `release()` can be called on it to signal that listener has finished doing all the work it needed to do. The application will only suspend after all the locks have been released (or iOS forces it to).

```js
rn_bridge.app.on('pause', (pauseLock) => {
  server.close( () => {
    // App will only suspend after the server stops listening for connections and current connections are closed.
    pauseLock.release();
  });
});
```

:::caution
On iOS, the application will eventually be suspended, so the pause event should be used to run the clean up operations as quickly as possible and let the application suspend after that. Make sure to call `pauseLock.release()` in each 'pause' event listener, or your Application will keep running in the background for as long as iOS will allow it.
:::

#### rn_bridge.app.datadir()

Returns a writable path used for persistent data storage in the application. Its value corresponds to `NSDocumentDirectory` on iOS and `FilesDir` on Android.

#### Channel callback: function(arg)

The messages sent through the channel can be of any type that can be correctly serialized with [JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify) on one side and deserialized with [JSON.parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse) on the other side, as it is what the channel does internally. This means that passing JS dates through the channel will convert them to strings and functions will be removed from their containing objects. In line with The [JSON Data Interchange Syntax Standard](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf), the channel supports sending messages that are composed of these JS types: `Boolean`, `Number`, `String`, `Object`, `Array`.

### Notes about other node APIs

#### os.tmpdir()

On iOS, `os.tmpdir()` returns a temporary directory, since iOS sets the `TMPDIR` environment variable of the application to the equivalent of calling `NSTemporaryDirectory`.

Android doesn't define a temporary directory for the system or application, so the plugin sets the `TMPDIR` environment variable to the value of the application context's `CacheDir` value.
