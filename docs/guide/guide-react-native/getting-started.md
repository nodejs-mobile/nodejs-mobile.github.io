---
sidebar_position: 1
title: "Getting started"
---

### Creating your project

To start, you must first initialize a React Native project that uses *native code* (not Expo Go), as described in the `Setting up the development environment` section of React Native's Environment Setup page.

### Installing the plugin

```bash
npm install nodejs-mobile-react-native --save
```

For iOS, run `pod install` for linking the native code parts:

```bash
cd iOS && pod install
```

#### iOS

Universal binaries are included in the plugin, so you can run in both iOS simulators and devices.

`nodejs-mobile-react-native` supports iOS 11.0 or later. In order to archive the application, the deployment target needs to be iOS 11.0 or later.

#### Android

You may need to open your app's `/android` folder in Android Studio, so that it detects, downloads and cofigures requirements that might be missing, like the NDK and CMake to build the native code part of the project.

You can also set the environment variable `ANDROID_NDK_HOME`, as in this example:

```bash
export ANDROID_NDK_HOME=/Users/username/Library/Android/sdk/ndk/24.0.8215888
```

### Writing the app code

#### The Node.js side

When `nodejs-mobile-react-native` is installed with npm, it creates a `nodejs-assets/nodejs-project/` folder inside your application's root folder. That's your app's **node home path**. It's where you put your app's Node.js code, and its contents will be packaged with your application.

When you use the `start(filename)` function exposed by the plugin, the Node.js engine will load and execute the specified file from your app's node home path.

During installation, the plugin pre-populates the node home path with a few goodies: `sample-main.js`, `sample-package.json`.

The `sample-main.js` and `sample-package.json` files contain a boilerplate echo project, which you can use to quickly get started. Simply copy `sample-main.js` to `main.js` and `sample-package.json` to `package.json`.

:::note
Attention: `sample-main.js` and `sample-package.json` will be overwritten with installs/updates of `nodejs-mobile-react-native`.
:::

The plugin includes a **React Native bridge** module that allows communicating between your Node.js code and your React Native code. It's added as a built-in module to your Node.js environment and can be included by `require('rn-bridge')`.

The bridge functioning is well illustrated by the code in `sample-main.js`:

```js
const rn_bridge = require('rn-bridge');

// Echo every message received from react-native.
rn_bridge.channel.on('message', (msg) => {
  rn_bridge.channel.send(msg);
} );

// Inform react-native node is initialized.
rn_bridge.channel.send('Node was initialized.');
```

The Node.js runtime accesses files through Unix-based pathnames, so in Android the node project is copied from the project's apk assets into the default application data folder at startup, during the first run or after an update, under `nodejs-project/`.

:::caution
Given the project folder will be overwritten after each application update, it should not be used for persistent storage.
:::

To expedite the process of extracting the assets files, instead of parsing the assets hierarchy, a list of files `file.list` and a list of folders `dir.list` are created when the application is compiled and then added to the application assets. On Android 6.x and older versions, this allows to work around a serious perfomance bug in the Android assets manager.

#### Node Modules

Node modules can be added to the project using `npm install` inside `nodejs-assets/nodejs-project/`, as long as there's a `package.json` already present.

#### Native Modules

On Linux and macOS, there is support for building modules that contain native code.

The plugin automatically detects native modules inside your `nodejs-project` folder by searching for `.gyp` files. It's recommended to have the build prerequisites mentioned in `nodejs-mobile` for Android and iOS. For Android it's also recommended that you set the `ANDROID_NDK_HOME` environment variable in your system.

Building native modules for Android can take a long time, since it depends on building a standalone NDK toolchain for each required architecture. The resulting `.node` binaries are then included in the final application in a separate asset path for each architecture and the correct one will be chosen at runtime.

While the plugin tries to detect automatically the presence of native modules, there's a way to override this detection and turn the native modules build process on or off, by creating the `nodejs-assets/BUILD_NATIVE_MODULES.txt` file and setting its contents to `1` or `0`, respectively. This can be used to start your application like this:

```bash
echo "1" > nodejs-assets/BUILD_NATIVE_MODULES.txt
react-native run-android
```

```bash
echo "1" > nodejs-assets/BUILD_NATIVE_MODULES.txt
react-native run-ios
```

### The React Native side

To communicate with Node.js from your React Native application, first import `nodejs-mobile-react-native`.

```js
import nodejs from 'nodejs-mobile-react-native';
```

Then add this effect to your App component's:

```js
React.useEffect(() => {
  nodejs.start('main.js');
  nodejs.channel.addListener('message', (msg) => {
    console.log('From node: ' + msg);
  });
});
```

This will start a dedicated thread running Node.js, and execute the `main.js` file in `nodejs-assets/nodejs-project/`, as described above. It will then register a listener to show alert boxes with each message sent from Node.js.

We can then define a button in our interface to send messages to our Node.js project:

```jsx
<Button title="Message Node"
  onPress={() => nodejs.channel.send('A message!')}
  />
```

:::tip
An app cannot have more than one instance of the Node.js engine. The first call to `nodejs.start()` will start the engine in a dedicated thread, and any further calls will have no effect. This means that if you use React Native's hot reload functionality your Node.js code will maintain the same state across hot reloads.
:::

### Troubleshooting

For Android applications, the React Native build process is sometimes unable to rebuild assets. If you are getting errors while building the application using `react-native run-android`, the following commands can help you do a clean rebuild of the project, when run in your project's folder.

On macOS/Linux:

```bash
cd android
./gradlew clean
cd ..
react-native run-android
```

On Windows:

```bash
cd android
gradlew clean
cd ..
react-native run-android
```

### Duplicate module name

During the React Native application's build process, the `nodejs-project` gets copied to the application's assets, where they'll be used by `nodejs-mobile`. The React Native packager monitors the project's folder for javascript packages and may throw a `"jest-haste-map: Haste module naming collision"` error.

To avoid this error, instruct the React Native packager to ignore the `nodejs-project` and the platform folders where it is copied to. Edit the `metro.config.js` file in your React Native project's root path with the following contents if you're using recent versions of `react-native` (`>= v0.60`) and add the `blacklist` require and the following resolver to the module exports:

```js
const blacklist = require('metro-config/src/defaults/blacklist');

module.exports = {
  resolver: {
    blacklistRE: blacklist([
      /\/nodejs-assets\/.*/,
      /\/android\/.*/,
      /\/ios\/.*/
    ])
  },

//...

};
```

### Bridge APIs

For a description of the available APIs see the [React Native bridge API reference](../../api/react-native-bridge).

### Native Modules Sample

There's a sample that can be downloaded from the [samples repo](https://github.com/nodejs-mobile/nodejs-mobile-samples) that showcases the use of the `sha3` and `sqlite3` native modules in React Native.
