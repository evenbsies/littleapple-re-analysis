// minimal probe: is injection + ART introspection working in this translated process?
send({ tag: 'probe', msg: 'script top-level reached' });

try {
  send({ tag: 'probe', java_available: Java.available, android: Java.androidVersion });
} catch (e) {
  send({ tag: 'probe', err: 'Java namespace: ' + e });
}

try {
  Java.perform(function () {
    send({ tag: 'probe', msg: 'Java.perform entered' });
    var Act = Java.use('android.app.ActivityThread');
    var app = Act.currentApplication();
    send({ tag: 'probe', pkg: app ? app.getPackageName() : 'null' });
    var NA = Java.use('com.fongmi.android.tv.auth.NativeAuth');
    send({ tag: 'probe', msg: 'NativeAuth class resolved' });
    send({ tag: 'probe', keyVersion: String(NA.keyVersion()) });
  });
} catch (e) {
  send({ tag: 'probe', err: 'Java.perform: ' + e });
}
