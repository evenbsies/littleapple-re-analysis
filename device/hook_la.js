// LittleApple TVBox 2.0.3 — runtime capture
// 只做 ART(Java) 层 hook：进程在内核层是 x86_64（ndk-translation 跑 ARM so），
// 直接 Interceptor 改写 ARM 转译代码会崩，改 ArtMethod 入口点是安全的。
// 目标：NativeAuth 签名/验签的入参出参 + 所有 OkHttp 请求响应 + Gson 解析入口

var T = '[LA]';

function S(v) {
  try {
    if (v === null || v === undefined) return String(v);
    if (typeof v === 'string') return v;
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    if (v.getClass && v.getClass().isArray && v.getClass().isArray()) return '[array]';
    return v.toString();
  } catch (e) {
    return '<unprintable>';
  }
}

function clip(s, n) {
  s = String(s);
  return s.length > n ? s.substring(0, n) + '...(' + s.length + 'B)' : s;
}

function hookNativeAuth() {
  var names = ['signRequest', 'signBrokerRequest', 'verifyResponse', 'verifyBrokerResponse',
               'cryptoKey', 'keyVersion', 'brokerKeyVersion', 'defaultBaseUrl'];
  var NA;
  try { NA = Java.use('com.fongmi.android.tv.auth.NativeAuth'); } catch (e) {
    console.log(T + ' NativeAuth not found: ' + e); return;
  }
  names.forEach(function (n) {
    if (!NA[n]) { console.log(T + ' missing method ' + n); return; }
    NA[n].overloads.forEach(function (ov) {
      ov.implementation = function () {
        var a = [];
        for (var i = 0; i < arguments.length; i++) a.push(clip(S(arguments[i]), 300));
        var r;
        try {
          r = ov.apply(this, arguments);
        } catch (err) {
          console.log(T + ' AUTH ' + n + ' THROW ' + err);
          throw err;
        }
        console.log(T + ' AUTH ' + n + ' IN=' + JSON.stringify(a) + ' OUT=' + clip(S(r), 300));
        return r;
      };
    });
  });
  console.log(T + ' NativeAuth hooked');
}

function hookVstc() {
  var names = ['nativeStart', 'nativePlaybackUrl', 'nativeSwitch', 'nativeRenewLease',
               'nativeUpdatePeers', 'nativeHealth'];
  var NV;
  try { NV = Java.use('com.fongmi.android.tv.vstc.NativeVstc'); } catch (e) { return; }
  names.forEach(function (n) {
    if (!NV[n]) return;
    NV[n].overloads.forEach(function (ov) {
      ov.implementation = function () {
        var a = [];
        for (var i = 0; i < arguments.length; i++) a.push(clip(S(arguments[i]), 200));
        var r = ov.apply(this, arguments);
        console.log(T + ' VSTC ' + n + ' IN=' + JSON.stringify(a) + ' OUT=' + clip(S(r), 200));
        return r;
      };
    });
  });
  console.log(T + ' NativeVstc hooked');
}

function hookOkHttpRequest() {
  try {
    var RIC = Java.use('okhttp3.internal.http.RealInterceptorChain');
    RIC.proceed.overload('okhttp3.Request').implementation = function (req) {
      try {
        var url = req.url().toString();
        var m = req.method();
        console.log(T + ' >>> ' + m + ' ' + url);
        var h = req.headers();
        var hn = h.size();
        for (var i = 0; i < hn; i++) console.log(T + '     H ' + h.name(i) + ': ' + clip(h.value(i), 200));
        var body = req.body();
        if (body !== null) {
          try {
            var B = Java.use('okio.Buffer');
            var buf = B.$new();
            body.writeTo(buf);
            console.log(T + '     BODY ' + clip(buf.readUtf8(), 2000));
          } catch (e2) { console.log(T + '     BODY? ' + e2); }
        }
      } catch (e) { console.log(T + ' req log err ' + e); }
      return RIC.proceed.overload('okhttp3.Request').call(this, req);
    };
    console.log(T + ' OkHttp request hooked');
  } catch (e) { console.log(T + ' OkHttp request hook failed: ' + e); }
}

function hookOkHttpResponse() {
  try {
    var RC = Java.use('okhttp3.RealCall');
    RC.execute.implementation = function () {
      var resp = RC.execute.call(this);
      try {
        var url = resp.request().url().toString();
        console.log(T + ' <<< ' + resp.code() + ' ' + url);
        var h = resp.headers();
        for (var i = 0; i < h.size(); i++) console.log(T + '     RH ' + h.name(i) + ': ' + clip(h.value(i), 200));
        console.log(T + '     RESP ' + clip(resp.peekBody(1048576).string(), 3000));
      } catch (e) { console.log(T + ' resp log err ' + e); }
      return resp;
    };
    console.log(T + ' OkHttp response hooked');
  } catch (e) { console.log(T + ' OkHttp response hook failed: ' + e); }
}

function hookGson() {
  try {
    var G = Java.use('com.google.gson.Gson');
    G.fromJson.overload('java.lang.String', 'java.lang.Class').implementation = function (s, c) {
      console.log(T + ' GSON -> ' + S(c) + ' :: ' + clip(s, 3000));
      return G.fromJson.overload('java.lang.String', 'java.lang.Class').call(this, s, c);
    };
    console.log(T + ' Gson hooked');
  } catch (e) { console.log(T + ' Gson hook failed: ' + e); }
}

setImmediate(function () {
  Java.perform(function () {
    console.log(T + ' === start ===');
    hookNativeAuth();
    hookVstc();
    hookOkHttpRequest();
    hookOkHttpResponse();
    hookGson();
    console.log(T + ' === armed ===');
  });
});
