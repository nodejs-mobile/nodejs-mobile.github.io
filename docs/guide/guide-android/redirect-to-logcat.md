---
sidebar_position: 3
title: "Redirect output streams to logcat"
---

This guide will guide you on how to redirect the `stdout` and `stderr` streams to `adb logcat` on Android.

A complete project where this technique is applied can also be downloaded [from the samples repo](https://github.com/nodejs-mobile/nodejs-mobile-samples).

### Redirect the stdout and stderr to logcat

The Node.js runtime and the Node.js `console` module use the process' `stdout` and `stderr` streams. Some code is needed to redirect those streams to the Android system log, so they can be viewed with `logcat`. C++ code to manage the redirection can be included by starting two background threads (one for `stdout` and the other for `stderr`), to provide a more pleasant Node.js debugging experience.

Add the helper functions to `native-lib.cpp`:

```cpp title="app/src/main/cpp/native-lib.cpp"
#include <pthread.h>
#include <unistd.h>
#include <android/log.h>

//...

// Start threads to redirect stdout and stderr to logcat.
int pipe_stdout[2];
int pipe_stderr[2];
pthread_t thread_stdout;
pthread_t thread_stderr;
const char *ADBTAG = "NODEJS-MOBILE";

void *thread_stderr_func(void*) {
    ssize_t redirect_size;
    char buf[2048];
    while((redirect_size = read(pipe_stderr[0], buf, sizeof buf - 1)) > 0) {
        //__android_log will add a new line anyway.
        if(buf[redirect_size - 1] == '\n')
            --redirect_size;
        buf[redirect_size] = 0;
        __android_log_write(ANDROID_LOG_ERROR, ADBTAG, buf);
    }
    return 0;
}

void *thread_stdout_func(void*) {
    ssize_t redirect_size;
    char buf[2048];
    while((redirect_size = read(pipe_stdout[0], buf, sizeof buf - 1)) > 0) {
        //__android_log will add a new line anyway.
        if(buf[redirect_size - 1] == '\n')
            --redirect_size;
        buf[redirect_size] = 0;
        __android_log_write(ANDROID_LOG_INFO, ADBTAG, buf);
    }
    return 0;
}

int start_redirecting_stdout_stderr() {
    //set stdout as unbuffered.
    setvbuf(stdout, 0, _IONBF, 0);
    pipe(pipe_stdout);
    dup2(pipe_stdout[1], STDOUT_FILENO);

    //set stderr as unbuffered.
    setvbuf(stderr, 0, _IONBF, 0);
    pipe(pipe_stderr);
    dup2(pipe_stderr[1], STDERR_FILENO);

    if(pthread_create(&thread_stdout, 0, thread_stdout_func, 0) == -1)
        return -1;
    pthread_detach(thread_stdout);

    if(pthread_create(&thread_stderr, 0, thread_stderr_func, 0) == -1)
        return -1;
    pthread_detach(thread_stderr);

    return 0;
}
```

Start the redirection right begore starting the Node.js runtime:

```cpp
    //Start threads to show stdout and stderr in logcat.
    if (start_redirecting_stdout_stderr()==-1) {
        __android_log_write(ANDROID_LOG_ERROR, ADBTAG, "Couldn't start redirecting stdout and stderr to logcat.");
    }

    //Start node, with argc and argv.
    return jint(node::Start(argument_count,argv));
```