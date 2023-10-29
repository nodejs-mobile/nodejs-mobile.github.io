---
sidebar_position: 2
title: "Building complex projects"
---

This guide will show you how to start the node runtime from a project folder on Android. It builds on top of the [Android Getting Started](./getting-started.md) instructions, having the same functionality but using a `nodejs-project` folder that contains the Node part of the project. It also shows how to use an npm module in the project.

The complete project can also be downloaded [from the samples repo](https://github.com/nodejs-mobile/nodejs-mobile-samples).

### Create the `nodejs-project` folder

Create a `nodejs-project` folder inside the project, in Gradle's default folder for Android's application assets ( `app/src/main/assets/nodejs-project` ). Create the `main.js` and `package.json` files as:

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
  "name": "native-gradle-node-project",
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

### Copy the `nodejs-project` at runtime and start from there

To start the Node.js engine runtime with a file path, we need to first copy the project to somewhere in the Android file system, because the Android Application's APK is an archive file and Node.js won't be able to start running from there. For this purpose, we choose to copy the `nodejs-project` into the Application's `FilesDir`.

Add the helper functions to `app/src/main/java/com/yourorg/sample/MainActivity.java`:

```java
import android.content.Context;
import android.content.res.AssetManager;

//...

    private static boolean deleteFolderRecursively(File file) {
        try {
            boolean res=true;
            for (File childFile : file.listFiles()) {
                if (childFile.isDirectory()) {
                    res &= deleteFolderRecursively(childFile);
                } else {
                    res &= childFile.delete();
                }
            }
            res &= file.delete();
            return res;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    private static boolean copyAssetFolder(AssetManager assetManager, String fromAssetPath, String toPath) {
        try {
            String[] files = assetManager.list(fromAssetPath);
            boolean res = true;

            if (files.length==0) {
                //If it's a file, it won't have any assets "inside" it.
                res &= copyAsset(assetManager,
                        fromAssetPath,
                        toPath);
            } else {
                new File(toPath).mkdirs();
                for (String file : files)
                res &= copyAssetFolder(assetManager,
                        fromAssetPath + "/" + file,
                        toPath + "/" + file);
            }
            return res;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    private static boolean copyAsset(AssetManager assetManager, String fromAssetPath, String toPath) {
        InputStream in = null;
        OutputStream out = null;
        try {
            in = assetManager.open(fromAssetPath);
            new File(toPath).createNewFile();
            out = new FileOutputStream(toPath);
            copyFile(in, out);
            in.close();
            in = null;
            out.flush();
            out.close();
            out = null;
            return true;
        } catch(Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    private static void copyFile(InputStream in, OutputStream out) throws IOException {
        byte[] buffer = new byte[1024];
        int read;
        while ((read = in.read(buffer)) != -1) {
            out.write(buffer, 0, read);
        }
    }
```

Before starting the Node runtime, delete the previous `nodejs-project` and copy the current one into the `FilesDir` and start the runtime from there:

```java
            new Thread(new Runnable() {
                @Override
                public void run() {
                    //The path where we expect the node project to be at runtime.
                    String nodeDir=getApplicationContext().getFilesDir().getAbsolutePath()+"/nodejs-project";
                    //Recursively delete any existing nodejs-project.
                    File nodeDirReference=new File(nodeDir);
                    if (nodeDirReference.exists()) {
                        deleteFolderRecursively(new File(nodeDir));
                    }
                    //Copy the node project from assets into the application's data path.
                    copyAssetFolder(getApplicationContext().getAssets(), "nodejs-project", nodeDir);
                    startNodeWithArguments(new String[]{"node",
                            nodeDir+"/main.js"
                    });
                }
            }).start();
```

:::caution
Given the project folder can be overwritten, it should not be used for persistent data storage.
:::

### Copy the nodejs-project only after an APK change

Recopying the `nodejs-project` at each Application's run can be expensive, so improve it by saving the last time the APK was updated on an Application Shared Preference and check if we need to delete and copy the `nodejs-project`.

Add the helper functions to `app/src/main/java/com/yourorg/sample/MainActivity.java`:

```java
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.SharedPreferences;

//...

    private boolean wasAPKUpdated() {
        SharedPreferences prefs = getApplicationContext().getSharedPreferences("NODEJS_MOBILE_PREFS", Context.MODE_PRIVATE);
        long previousLastUpdateTime = prefs.getLong("NODEJS_MOBILE_APK_LastUpdateTime", 0);
        long lastUpdateTime = 1;
        try {
            PackageInfo packageInfo = getApplicationContext().getPackageManager().getPackageInfo(getApplicationContext().getPackageName(), 0);
            lastUpdateTime = packageInfo.lastUpdateTime;
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }
        return (lastUpdateTime != previousLastUpdateTime);
    }

    private void saveLastUpdateTime() {
        long lastUpdateTime = 1;
        try {
            PackageInfo packageInfo = getApplicationContext().getPackageManager().getPackageInfo(getApplicationContext().getPackageName(), 0);
            lastUpdateTime = packageInfo.lastUpdateTime;
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }
        SharedPreferences prefs = getApplicationContext().getSharedPreferences("NODEJS_MOBILE_PREFS", Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putLong("NODEJS_MOBILE_APK_LastUpdateTime", lastUpdateTime);
        editor.commit();
    }
```

Change the code that starts the node runtime to check if it needs to delete the previous `nodejs-project` and copy the current one into the `FilesDir`:

```java
            new Thread(new Runnable() {
                @Override
                public void run() {
                    //The path where we expect the node project to be at runtime.
                    String nodeDir=getApplicationContext().getFilesDir().getAbsolutePath()+"/nodejs-project";
                    if (wasAPKUpdated()) {
                        //Recursively delete any existing nodejs-project.
                        File nodeDirReference=new File(nodeDir);
                        if (nodeDirReference.exists()) {
                            deleteFolderRecursively(new File(nodeDir));
                        }
                        //Copy the node project from assets into the application's data path.
                        copyAssetFolder(getApplicationContext().getAssets(), "nodejs-project", nodeDir);

                        saveLastUpdateTime();
                    }
                    startNodeWithArguments(new String[]{"node",
                            nodeDir+"/main.js"
                    });
                }
            }).start();
```

The sample for this guide also contains code to redirect Node's output to logcat, which can be included by following the [Redirect output streams to logcat](./redirect-to-logcat.md) guide.