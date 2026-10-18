// 抓 play_auth / vstc-broker 的响应：这两类走 enqueue 异步路径，
// 需要用 registerClass 包一层 okhttp3.Callback 才能截到 onResponse。
var n = 0;

function send_(o) { try { send(o); } catch (e) {} }
function clip(s, k) { s = String(s); return s.length > k ? s.substring(0, k) + '...(' + s.length + 'B)' : s; }

Java.perform(function () {
  try {
    var RC = Java.use('okhttp3.internal.connection.RealCall');
    var CB = Java.use('okhttp3.Callback');
    RC.enqueue.overload('okhttp3.Callback').implementation = function (cb) {
      var url = '';
      try { url = String(this.request().url().toString()); } catch (e) {}
      var wrapped = cb;
      try {
        var W = Java.registerClass({
          name: 'rea.Hook' + (++n),
          implements: [CB],
          methods: {
            onFailure: function (call, e) {
              try { send_({ t: 'AFAIL', url: url, err: String(e) }); } catch (x) {}
              return cb.onFailure(call, e);
            },
            onResponse: function (call, resp) {
              try {
                var body = '';
                try { body = clip(resp.peekBody(1048576).string(), 6000); } catch (x) {}
                send_({ t: 'ARESP', code: resp.code(), url: url, body: body });
              } catch (x) {}
              return cb.onResponse(call, resp);
            }
          }
        });
        wrapped = W.$new();
      } catch (e) {
        send_({ t: 'wrap-err', e: String(e) });
      }
      return RC.enqueue.overload('okhttp3.Callback').call(this, wrapped);
    };
    send_({ t: 'hooked', what: 'RealCall.enqueue' });
  } catch (e) {
    send_({ t: 'err', what: 'enqueue', e: String(e) });
  }

  // 同步路径的响应也留着
  try {
    var RC2 = Java.use('okhttp3.internal.connection.RealCall');
    RC2.execute.implementation = function () {
      var resp = RC2.execute.call(this);
      try {
        send_({ t: 'SRESP', code: resp.code(), url: String(resp.request().url().toString()),
                body: clip(resp.peekBody(1048576).string(), 6000) });
      } catch (e) {}
      return resp;
    };
    send_({ t: 'hooked', what: 'RealCall.execute' });
  } catch (e) { send_({ t: 'err', what: 'execute', e: String(e) }); }

  send_({ t: 'armed' });
});
