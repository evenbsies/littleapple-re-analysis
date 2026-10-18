// 合并版：请求构造 + 同步/异步响应 + G2.m.b 解密入口
var n = 0;
function send_(o) { try { send(o); } catch (e) {} }
function clip(s, k) { s = String(s); return s.length > k ? s.substring(0, k) + '...(' + s.length + 'B)' : s; }

Java.perform(function () {
  // 请求（含全部头，能直接看到 X-HSJ-*）
  try {
    var RIC = Java.use('okhttp3.internal.http.RealInterceptorChain');
    RIC.proceed.overload('okhttp3.Request').implementation = function (req) {
      try {
        var u = String(req.url().toString());
        if (/9box|haotv|xpgtv|vstc/.test(u)) {
          var h = req.headers();
          var hs = [];
          for (var i = 0; i < h.size(); i++) hs.push(h.name(i) + '=' + clip(h.value(i), 400));
          var body = '';
          try {
            var b = req.body();
            if (b !== null) {
              var buf = Java.use('okio.Buffer').$new();
              b.writeTo(buf);
              body = clip(buf.readUtf8(), 3000);
            }
          } catch (e2) {}
          send_({ t: 'AUTHREQ', m: String(req.method()), url: u, h: hs.join(' | '), body: body });
        }
      } catch (e) {}
      return RIC.proceed.overload('okhttp3.Request').call(this, req);
    };
    send_({ t: 'hooked', what: 'proceed' });
  } catch (e) { send_({ t: 'err', what: 'proceed', e: String(e) }); }

  // 异步响应
  try {
    var RC = Java.use('okhttp3.internal.connection.RealCall');
    var CB = Java.use('okhttp3.Callback');
    RC.enqueue.overload('okhttp3.Callback').implementation = function (cb) {
      var url = '';
      try { url = String(this.request().url().toString()); } catch (e) {}
      var wrapped = cb;
      try {
        var W = Java.registerClass({
          name: 'rea.H' + (++n),
          implements: [CB],
          methods: {
            onFailure: function (call, e) { return cb.onFailure(call, e); },
            onResponse: function (call, resp) {
              try {
                if (/9box|haotv|xpgtv|vstc/.test(url)) {
                  send_({ t: 'AUTHRESP', code: resp.code(), url: url,
                          body: clip(resp.peekBody(1048576).string(), 8000) });
                }
              } catch (x) {}
              return cb.onResponse(call, resp);
            }
          }
        });
        wrapped = W.$new();
      } catch (e) { send_({ t: 'wrap-err', e: String(e) }); }
      return RC.enqueue.overload('okhttp3.Callback').call(this, wrapped);
    };
    // 同步
    RC.execute.implementation = function () {
      var resp = RC.execute.call(this);
      try {
        var u = String(resp.request().url().toString());
        if (/9box|haotv|xpgtv|vstc/.test(u)) {
          send_({ t: 'AUTHRESP', code: resp.code(), url: u, body: clip(resp.peekBody(1048576).string(), 8000) });
        }
      } catch (x) {}
      return resp;
    };
    send_({ t: 'hooked', what: 'enqueue+execute' });
  } catch (e) { send_({ t: 'err', what: 'call', e: String(e) }); }

  // 解密入口
  try {
    var M = Java.use('G2.m');
    M.b.overload('java.lang.String').implementation = function (raw) {
      var out = M.b.overload('java.lang.String').call(this, raw);
      send_({ t: 'MB', plain: clip(out, 8000) });
      return out;
    };
    send_({ t: 'hooked', what: 'G2.m.b' });
  } catch (e) { send_({ t: 'err', what: 'G2.m.b', e: String(e) }); }

  send_({ t: 'armed' });
});
