---
sidebar_position: 1
title: "Node.js APIs differences"
---

We support the majority of Node.js upstream APIs, see [the official docs](https://nodejs.org/dist/v18.17.1/docs/api/).

However, some Node.js APIs were designed with the purpose of running on a server/desktop environment, and on mobile they might not work as intended or are not supported at all.

This page contains a collection of differences for these APIs when running on a mobile environment or a description of the quirks in their behavior. Please [file an issue in the core library repo](https://github.com/nodejs-mobile/nodejs-mobile/issues/new/choose) for APIs that you find missing from the list.

### Child processes

:::danger
Unsupported
:::

The `child_process` and `cluster` modules are not available. nodejs-mobile runs in a mobile application process, which is expected to be a single process in the mobile operating systems, so forking the nodejs-mobile process results in errors for most cases. iOS doesn't give permissions to spawn new processes in most cases, as well. These modules are not supported in nodejs-mobile for the reasons presented.

### Console

:::info
Supported, with minor differences
:::

The global `console` instance is typically configured to write to `process.stdout` and `process.stderr`. On Android, the `process.stderr` and `process.stdout` streams output is sent to `/dev/null`, but it can be redirected to the application **logcat**. The redirection is done automatically in the `nodejs-mobile-cordova` and `nodejs-mobile-react-native` plugins. Instructions on how to achieve this in Android applications running the native nodejs-mobile library can be found in the Android [Redirect Output Streams to logcat](../guide/guide-android/redirect-to-logcat) guide.

### Debugger

:::danger
Unsupported
:::

The V8 inspector is not available on current nodejs-mobile builds, due to a dependency on the `intl` module. This means you cannot use (Chrome) DevTools to debug your nodejs-mobile app.

### File system module

:::caution
Supported, with significant differences
:::

The `fs` module provides wrappers around standard POSIX functions, but these might not be available on the mobile OSes, file systems or work differently in a mobile application process context.

Functions that can take relative paths apply that relative path to the current working directory where the node process was started in server/desktop environments. On mobile environments, nodejs-mobile is started in the context of an application, for which the current working environment is the root of the filesystem on iOS and Android. This can lead to unexpected behavior for code that assumes the current working directory is set to the directory of the starting Node.js script (which also might not be true in a server/desktop environment).

#### `fs.link()`, `fs.linkSync()`

Android does not support these functions because it does not support hard links.

### Internationalization module

:::danger
Unsupported
:::

The `intl` (internationalization) module is not available on current nodejs-mobile builds.

### Operation system module

:::caution
Supported, with significant differences
:::

The `os` module provides operating system-related utility methods. Some of these methods are not fully supported on mobile operating systems or behave differently in the context of an application process.

#### `os.cpus()`

On iOS, CPU speed values are always 0, due to lack of permissions to read these values.

On Android, returns undefined since Android 8.0, due to lack of permissions to read these values. On earlier Android versions the CPU values can be inconsistent, since some devices can turn CPU cores on and off as an energy saving strategy. Properties can be returned as zero for cores that have been turned off while getting them.

#### `os.homedir()`

On Android and iOS there isn't the concept of a user home directory. Android sets this value to `/data` and iOS sets it to root of the Application's sandboxed path.

#### `os.platform()`

Returns the strings `'android'` or `'ios'` in nodejs-mobile, depending on the platform.

#### `os.tmpdir()`

On iOS, returns the application's sandboxed temporary directory, equivalent to getting the `NSTemporaryDirectory` value, since iOS sets the `TMPDIR` environment variable for the application to that value.

The Android OS is an outlier in the sense that it doesn't have the concept of a temporary directory. In the nodejs-mobile-cordova and nodejs-mobile-react-native plugins, the nodejs-mobile runtime returns the application context's `CacheDir` value, which should have a similar behavior to a temporary directory for most situations (on Android, the files in the cache are kept until the system needs space, so it increases the disk foothold of the Application unless the developer deletes them manually).

### Process

:::caution
Supported, with significant differences
:::

The global `process` object provides information about the current process where Node.js is running on, which is the application process for nodejs-mobile.

#### `process.cwd()`

The current working directory of the process is the same as the current working directory for the mobile application, which is the root of the operating system on Android and iOS applications, i.e. `/`.

#### `process.exit()`

In nodejs-mobile, the process is the application, so running `process.exit()` terminates the application. This is not allowed in the Apple App Store guidelines for iOS.

#### `process.getegid()`, `process.geteuid()`, `process.getgid()`, `process.getgroups()`, `process.getuid()`, `process.setegid()`, `process.seteuid()`, `process.setgid()`, `process.setgroups()`, `process.setuid()`

These functions are only available on POSIX platforms, so they are unavailable on Android.

#### `process.stderr`, `process.stdout`

Read above in the [Console](#console) section.

#### `process.stdin`

nodejs-mobile is running in the context of a mobile application, so you can expect `process.stdin` to be **unavailable** unless there is some native code added to pipe to it.

#### `process.platform`

Like `os.platform()`, this is the string `'android'` or `'ios'`, depending on the platform.

#### `process.versions`

The `process.versions` object is supported, but also includes the `'mobile'` key, containing the version for the nodejs-mobile core library.

### RegExp Unicode Property Names

:::danger
Unsupported
:::

Nodejs-mobile is compiled with no internationalization which means that Unicode Property Names are not supported, examples:

- `\p{Letter}`
- `\p{L}`
- `\p{ID_Start}`
- `\p{ID_Continue}`

As an alternative, you can unwrap the characters belonging to property names, like this:

```js
const regenerate = require('regenerate');
const codePoints = require('@unicode/unicode-13.0.0/Binary_Property/ID_Start/code-points.js');

const set = regenerate(codePoints);
console.log(new RegExp(`[$_${set.toString()}]`));
```

Or do such as a dedicated package, like [unicode-word-regex](https://github.com/staltz/unicode-word-regex) does.

### WebAssembly

:::danger
Unsupported
:::

On iOS, WASM is unsupported because it requires Just-in-time (JIT) interpretation, which is forbidden by Apple's App Store guidelines.

On Android, WASM *may* work.
