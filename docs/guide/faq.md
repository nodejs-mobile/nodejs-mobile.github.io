---
sidebar_position: 5
title: "F.A.Q."
---

**Frequently Asked Questions**

<!-- Can I use npm node-modules with nodejs-mobile?
Are all Node.js APIs supported on mobile?
Trying to write a file results in an error. What's going on?
Are Node.js native modules supported?
How can I improve Node.js load times?
Can I run two or more Node.js instances?
Can I run Node.js code in a WebView?
Can you support a plugin for the X mobile framework? -->

### Can I use npm node_modules with nodejs-mobile?

**Yes**, npm modules can be used with nodejs-mobile. They need to be installed at development time in the application source folder that contains the Node.js project files. There are samples that show how to use npm modules for [Android](https://github.com/nodejs-mobile/nodejs-mobile-samples/tree/master/android/native-gradle-node-folder) and [iOS](https://github.com/nodejs-mobile/nodejs-mobile-samples/tree/master/ios/native-xcode-node-folder) when using the native library directly. There are instructions in the `nodejs-mobile-cordova`'s and `nodejs-mobile-react-native`'s plugins READMEs on how to use them.

### Are all Node.js APIs supported on mobile?

**No**, not every API is supported on mobile, the main reason for this being that the mobile operating systems won't allow applications to call certain APIs that are expected to be available on other operating systems.

See a [full list of unsupported APIs here](../api/differences).

### Trying to write a file results in an error. What's going on?

Mobile platforms are different than the usual desktop platforms in that they require applications to write in specific sandboxed paths and don't have permissions to write elsewhere. You should pass an appropriate writable path for your use case to the Node.js runtime and write there. An API call to return the path most regularly used for data in each platform has been added to the `nodejs-mobile-cordova` and `nodejs-mobile-react-native` plugins.

### Are Node.js native addons supported?

**Yes**, node native modules, which contain native code (C/C++ or Rust), are able to run on nodejs-mobile, as long as they can be cross-compiled for the target platform / CPU. The cross-compiling feature is integrated into the plugins and instructions can be found in the `nodejs-mobile-cordova` or in the `nodejs-mobile-react-native` READMEs, but only Linux and MacOS development machines are currently supported.

Modules that contain custom build steps and platform specific code may need workarounds/changes to get them to work. There is a [discussion section](https://github.com/orgs/nodejs-mobile/discussions/categories/native-addons) dedicated to this so that the workarounds/changes can be discussed and shared.

We also have an official CLI tool called [prebuild-for-nodejs-mobile](https://github.com/nodejs-mobile/prebuild-for-nodejs-mobile) which enables you to compile the native addon ahead-of-time, and then import it into your project. This means that these native addons don't need to be re-compiled every time you compile your mobile app.

### How can I improve Node.js load times?

Applications that contain a large number of files in the Node.js project can have their load times decreased by reducing the number of files. While installing npm modules, these can be installed with the `--production` flag, so that modules that are used for development only are not included in your project, e.g.: `npm install --production <module_name>`.

However, the most effective method is to use a bundler such as [esbuild](https://esbuild.github.io/) to create a single file for all the JavaScript source used by nodejs-mobile, and then you can delete the node_modules folder (minus the native addons)

### Can I run two or more Node.js instances?

**No**, the runtime expects to be run as a single instance in the process. In practice this should not preclude any usage scenarios, given node's asynchronous nature. Multiple sub-tasks can be executed by simply loading all the corresponding modules with `require` from a main script. The library supports `worker_threads`, which should allow running Node.js code on more than one thread.

### Can I run Node.js code in a WebView?

**No**, Node.js uses a libuv event loop at its core, which is different than the event loop in the WebView. Having the node runtime run in its own thread also prevents Node.js tasks for interfering with the UI, which might cause responsiveness issues. The supported usage scenario is that nodejs-mobile runs in a background thread and the UI (in this case a WebView) must use a communication mechanism to send/receive data from Node.js. This technique is used in the `nodejs-mobile-cordova` plugin, where Cordova uses a dedicated thread to run Node.js alongside the WebView.
