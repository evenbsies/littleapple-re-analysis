// LittleApple runtime capture — attach mode (app already started, NativeAuth already initialized)
// 不触碰 NativeAuth / NativeVstc：它们的 <clinit> 会 System.loadLibrary("hsjtv")，
// 在 houdini 转译层 + frida 注入的进程里加载 ARM64 so 会 SIGSEGV。
// 改为 hook 纯 Java 层：G2.m.b() 的返回值就是解密后的明文 JSON。

function send_(o) { try { send(o); } catch (e) {} }

function clip(s, n) {
  s = String(s);
  return s.length > n ? s.substring(0, n) + '...(' + s.length + 'B)' : s;
}

Java.perform(function () {
  send_({ t: 'start', android: Java.androidVersion });

  // 1) 响应解密入口：G2.m.b(String) -> String
  try {
    var M = Java.use('G2.m');
    M.b.overload('java.lang.String').implementation = function (raw) {
      var out = M.b.overload('java.lang.String').call(this, raw);
      send_({ t: 'RESP', raw: clip(raw, 1500), plain: clip(out, 4000) });
      return out;
    };
    send_({ t: 'hooked', what: 'G2.m.b' });
  } catch (e) { send_({ t: 'err', what: 'G2.m.b', e: String(e) }); }

  // 2) OkHttp 请求
  try {
    var RIC = Java.use('okhttp3.internal.http.RealInterceptorChain');
    RIC.proceed.overload('okhttp3.Request').implementation = function (req) {
      try {
        var h = req.headers();
        var hs = [];
        for (var i = 0; i < h.size(); i++) hs.push(h.name(i) + '=' + clip(h.value(i), 300));
        var bodyStr = '';
        try {
          var body = req.body();
          if (body !== null) {
            var buf = Java.use('okio.Buffer').$new();
            body.writeTo(buf);
            bodyStr = clip(buf.readUtf8(), 2000);
          }
        } catch (e2) {}
        send_({ t: 'REQ', m: String(req.method()), url: String(req.url().toString()),
                h: hs.join(' | '), body: bodyStr });
      } catch (e) { send_({ t: 'err', what: 'REQ', e: String(e) }); }
      return RIC.proceed.overload('okhttp3.Request').call(this, req);
    };
    send_({ t: 'hooked', what: 'OkHttp.proceed' });
  } catch (e) { send_({ t: 'err', what: 'OkHttp', e: String(e) }); }

  // 3) OkHttp 同步响应（okhttp 4.x 把 RealCall 挪到了 internal.connection）
  var rcNames = ['okhttp3.internal.connection.RealCall', 'okhttp3.RealCall'];
  rcNames.forEach(function (cn) {
    try {
      var RC = Java.use(cn);
      RC.execute.implementation = function () {
        var resp = RC.execute.call(this);
        try {
          send_({ t: 'RAW', code: resp.code(), url: String(resp.request().url().toString()),
                  body: clip(resp.peekBody(1048576).string(), 3000) });
        } catch (e) {}
        return resp;
      };
      send_({ t: 'hooked', what: cn + '.execute' });
    } catch (e) { send_({ t: 'err', what: cn, e: String(e).substring(0, 120) }); }
  });

  // 4) newCall 入口兜底
  try {
    var OC = Java.use('okhttp3.OkHttpClient');
    OC.newCall.overload('okhttp3.Request').implementation = function (req) {
      try {
        send_({ t: 'NEW', url: String(req.url().toString()), m: String(req.method()) });
      } catch (e) {}
      return OC.newCall.overload('okhttp3.Request').call(this, req);
    };
    send_({ t: 'hooked', what: 'OkHttpClient.newCall' });
  } catch (e) { send_({ t: 'err', what: 'newCall', e: String(e).substring(0, 120) }); }

  send_({ t: 'armed' });
});
