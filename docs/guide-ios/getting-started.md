---
sidebar_position: 1
title: "Getting started"
---

### Download the library

The iOS shared libraries are distributed in a zip file, which you can download from the [core library release page](https://github.com/nodejs-mobile/nodejs-mobile/releases).

The zip file contains the 64 bit universal and device-only `NodeMobile.framework` binaries for iOS 11. The universal `Release-universal/NodeMobile.framework` contains both simulator and device binary code and should be used for development, while the device-only `Release-iphoneos/NodeMobile.framework` only contains device binary code and should be used for App store submissions.

### Creating your First Project

The following steps will guide you through creating an Xcode 9 project that uses the library. The complete project can also be downloaded from the [samples repo](https://github.com/nodejs-mobile/nodejs-mobile-samples).

This sample runs the Node.js engine in a background thread to start an HTTP server on port 3000 and return the `process.versions` value. The app's Main Activity UI has a button to query the server and show the server's response. Alternatively, it's also possible to access the server from a browser running on a different device connected to the same local network.

### Development Prerequisites

- A macOS device with Xcode version 9 or higher, with the iOS SDK version 11.0 or higher.
- An iOS device with arm64 architecture, running iOS version 11.0 or higher.
- A valid Apple Developer Account.

### Create an Xcode Project

Using Xcode's "Create a new Xcode Project" wizard, create a new Project with the following settings, by the order the options appear in screens:

1. `iOS Single View App` template selected
2. Enter in the `ProductName` the `native-xcode` name and leave the other fields with their defaults, which were, in our case:
  - Team: None
  - Organization Name: Sample Org
  - Organization Identifier: com.sampleorg
  - Language: Objective-C
  - `Use Core Data` unselected
  - `Include Unit Tests` unselected
  - `Include UI Tests` unselected
3. Selected a path for my project
4. Create

### Add NodeMobile.framework to the project

#### Copy the library files

Create the `libnode/` folder path in the project's root folder, next to the `native-xcode.xcodeproj` package. Unzip the downloaded zip file, and copy the `NodeMobile.framework` from the `Release-universal/` path inside the zip file to the `libnode/` folder that was just created.

#### Add `NodeMobile.framework` to the app bundle

In the project settings (click on the project main node), drag the `NodeMobile.framework` file that is inside `libnode/`, from a Finder Window to the `Embedded Binaries` portion of the `General` tab. This will add the framework to both the `Embedded Binaries` and `Linked Frameworks and Libraries` section.

#### Turn `ENABLE_BITCODE` off

The Node binary isn't currently build with bitcode enabled, so, for the time being, we need to disable bitcode for the application as well.

In the project settings (click on the project main node), in the `Build Options` portion of the `Build Settings` tab, set `Enable Bitcode` to `No`.

### Create the NodeRunner object that will run the Node.js engine

#### Create NodeRunner.h

Create a new header file in the project, in the same location as the already existing code files, and call it `NodeRunner.h`.

Add the following code to that file:

```objectivec title="NodeRunner.h"
#ifndef NodeRunner_h
#define NodeRunner_h
#import <Foundation/Foundation.h>

@interface NodeRunner : NSObject {}
+ (void) startEngineWithArguments:(NSArray*)arguments;
@end

#endif
```

#### Create NodeRunner.mm

Create a new Objective-C File in the project's structure in the same level as the already existing code files, called `NodeRunner.mm`. The .mm extension is important as this will indicate Xcode that this file will contain C++ code in addition to Objective-C code.

This file will contain the following code to start node:

```objectivec title="NodeRunner.mm"
#include "NodeRunner.h"
#include <NodeMobile/NodeMobile.h>
#include <string>

@implementation NodeRunner

//node's libUV requires all arguments being on contiguous memory.
+ (void) startEngineWithArguments:(NSArray*)arguments
{
    int c_arguments_size=0;

    //Compute byte size need for all arguments in contiguous memory.
    for (id argElement in arguments)
    {
        c_arguments_size+=strlen([argElement UTF8String]);
        c_arguments_size++; // for '\0'
    }

    //Stores arguments in contiguous memory.
    char* args_buffer=(char*)calloc(c_arguments_size, sizeof(char));

    //argv to pass into node.
    char* argv[[arguments count]];

    //To iterate through the expected start position of each argument in args_buffer.
    char* current_args_position=args_buffer;

    //Argc
    int argument_count=0;

    //Populate the args_buffer and argv.
    for (id argElement in arguments)
    {
        const char* current_argument=[argElement UTF8String];

        //Copy current argument to its expected position in args_buffer
        strncpy(current_args_position, current_argument, strlen(current_argument));

        //Save current argument start position in argv and increment argc.
        argv[argument_count]=current_args_position;
        argument_count++;

        //Increment to the next argument's expected position.
        current_args_position+=strlen(current_args_position)+1;
    }

    //Start node, with argc and argv.
    node_start(argument_count,argv);
    free(args_buffer);
}
@end
```

### Start a background thread to run startNodeWithArguments

The app uses a background thread to run the Node.js engine.

:::note
Currently, only a single instance of the Node.js runtime can be started within an application. Restarting the engine after it has finished running is also not supported.
:::

The Node code is a simple HTTP server on port 3000 that returns `process.versions`. This is the corresponding Node code:

```js
const http = require('http');
const versions_server = http.createServer( (request, response) => {
  response.end('Versions: ' + JSON.stringify(process.versions));
});
versions_server.listen(3000);
```

For simplicity, the Node code is added to the `AppDelegate.m` file.

Add the following line in the file #import section:

```objectivec
#import "NodeRunner.h"
```

Create a `startNode` selector and start the thread inside the `didFinishLaunchingWithOptions` selector, which signature should be already have been created by the wizard:

```objectivec
- (void)startNode {
    NSArray* nodeArguments = [NSArray arrayWithObjects:
                                @"node",
                                @"-e",
                                @"var http = require('http'); "
                                " var versions_server = http.createServer( (request, response) => { "
                                "   response.end('Versions: ' + JSON.stringify(process.versions)); "
                                " }); "
                                " versions_server.listen(3000); "
                                ,
                                nil
                                ];
    [NodeRunner startEngineWithArguments:nodeArguments];
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    NSThread* nodejsThread = nil;
    nodejsThread = [[NSThread alloc]
        initWithTarget:self
        selector:@selector(startNode)
        object:nil
    ];
    // Set 2MB of stack space for the Node.js thread.
    [nodejsThread setStackSize:2*1024*1024];
    [nodejsThread start];
    return YES;
}
```

:::note
The iOS node runtime expects to have 1MB of stack space available. Having 2MB of stack space available is recommended.
:::

### Run the Application

You should now be able to run the application on your iOS device.

In the project settings (click on the project main node), in the `Signing` portion of the General tab, select a valid Team and handle the provisioning profile creation/update. If you get an error that the bundle identifier cannot be used, you can simply change the bundle identifier to a unique string by appending a few characters to it.

Try to run the app. If the build process doesn't start the app right away, you might have to go to `Settings > General` in the device and enter the `Device Management` or `Profiles & Device Management` screen to manually accept the profile.

### Add simple UI to test

At this point, it's already possible to run the app on an iOS device and access the HTTP server from any device connected to the same local network. If the iOS device's IP address is `192.168.1.100` point the browser at `http://192.168.1.100:3000/`.

However, the sample also comes with the UI to query the local HTTP server and show the response.

#### Create Button and TextView

In `Main.storyboard`, use the Xcode interface designer to create a UIButton and a UITextView components.

#### Add UI properties and connect them

Inside the `ViewController.m` file, add the `IBOutlet` and `IBAction` declarations to the `interface` section:

```objectivec
@interface ViewController ()
@property (weak, nonatomic) IBOutlet UIButton *myButton;
@property (weak, nonatomic) IBOutlet UITextView *myTextView;

- (IBAction)myButtonAction:(id)sender;
@end
```

In the `Assistant Editors` mode of Xcode:

- Connect the `@property (weak, nonatomic) IBOutlet UITextView *myTextView;` property from `ViewController.m` to the `UITextView` previously created in `Main.storyboard`.
- Connect the `@property (weak, nonatomic) IBOutlet UIButton *myButton;` property from `ViewController.m` to the `UIButton` previously created in `Main.storyboard`.
- Connect the `- (IBAction)myButtonAction:(id)sender;` selector from `ViewController.m` to the `UIButton` previously created in `Main.storyboard`.

Add the `- (IBAction)myButtonAction:(id)sender;` definition to the `ViewController.m` implementation section:

```objectivec
- (IBAction)myButtonAction:(id)sender
{
    NSString *localNodeServerURL = @"http:/127.0.0.1:3000/";
    NSURL  *url = [NSURL URLWithString:localNodeServerURL];
    NSString *versionsData = [NSString stringWithContentsOfURL:url];
    if (versionsData)
    {
        [_myTextView setText:versionsData];
    }
}
```

While the application is running on your device, tapping the button in the app sends a request to the local Node.js HTTP server and shows the response in the `TextView`.