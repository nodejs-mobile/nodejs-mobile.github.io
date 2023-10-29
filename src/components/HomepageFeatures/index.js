import React from 'react';
import styles from './styles.module.css';

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.row}>
          <h2>The power of Node.js inside your mobile apps</h2>
          <p>
            Node.js for Mobile Apps is a toolkit for integrating Node.js into
            mobile applications. Its core component is a library – available for{' '}
            <strong>Android</strong> and <strong>iOS</strong> – that lets you
            add a Node.js background worker to any mobile app. It also includes
            plugins for <strong>React Native</strong> and <strong>Cordova</strong>.
          </p>
          <h2>Cross-platform code</h2>
          <p>
            Does your business logic really need to be written in a different language and using different APIs for each mobile platform? Node.js abstracts a great deal of functionality in a truly cross-platform way. And with its module ecosystem, you have an immense toolbox of reusable code at your disposal.
          </p>
          <h2>Enables peer-to-peer apps</h2>
          <p>
            Typically with React Native or Cordova you cannot run a web server or open UDP sockets, because the JavaScript runtime doesn't have those features. With Node.js Mobile, now your mobile app can serve localhost web clients, open TCP/UDP sockets with other peers on the internet, or use Node.js Filesystem APIs, and more.
          </p>
          <h2>Offload heavy computation</h2>
          <p>
            On the web, you can rely on Web Workers for tasks that need heavy lifting. However, JavaScript environments such as React Native don't out-of-the-box support anything that looks like Workers. With Node.js Mobile, you can run Node.js for heavy tasks that unclutter the UI thread in React Native.
          </p>
          <h2>Free and open source</h2>
          <p>
            The source code is <a href="https://github.com/nodejs-mobile">available on GitHub</a>.
          </p>
          <h2>Used in production</h2>
          <p>
            You are in good company when using this library. It has been successfully deployed in apps on iOS App Store and Google Play Store, such as:
          </p>
          <ul>
            <li><a href="https://manyver.se">Manyverse</a></li>
            <li><a href="https://www.digital-democracy.org/mapeo">Mapeo</a></li>
          </ul>
        </div>
      </div>
    </section>
  );
}
