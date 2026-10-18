// 截获 SHA-1 的输入原文：给 MessageDigest 实例按 hashCode 记住算法，
// 在 update 时把喂进去的字节按线程累积下来，最终以字符串形式发回。
// 目的：拿到内容源 sign 的计算原文，从而离线复算。
var algos = {};      // hashCode -> 算法名
var acc = {};        // threadId -> [bytes]

function toStr(arr) {
  try {
    var s = '';
    for (var i = 0; i < arr.length; i++) {
      var c = arr[i] & 0xff;
      if (c === 0) break;
      if (c < 32 || c > 126) return null;   // 只保留可打印串
      s += String.fromCharCode(c);
    }
    return s;
  } catch (e) { return null; }
}

Java.perform(function () {
  var MD = Java.use('java.security.MessageDigest');

  MD.getInstance.overload('java.lang.String').implementation = function (a) {
    var inst = MD.getInstance.overload('java.lang.String').call(this, a);
    try { algos[inst.hashCode()] = String(a); } catch (e) {}
    return inst;
  };

  var ups = MD.update.overloads;
  for (var i = 0; i < ups.length; i++) {
    (function (ov) {
      ov.implementation = function () {
        try {
          var tid = Process.getCurrentThreadId();
          var name = algos[this.hashCode()] || '';
          if (name.toUpperCase().indexOf('SHA-1') >= 0) {
            var arr = null;
            if (arguments.length >= 3 && arguments[0] !== null) {
              var b = arguments[0], off = arguments[1], len = arguments[2];
              if (len > 0 && len < 1024) {
                arr = [];
                for (var k = 0; k < len; k++) arr.push(b[off + k]);
              }
            } else if (arguments.length === 1 && arguments[0] !== null) {
              var b2 = arguments[0];
              if (b2.length > 0 && b2.length < 1024) {
                arr = [];
                for (var j = 0; j < b2.length; j++) arr.push(b2[j]);
              }
            }
            if (arr) {
              acc[tid] = (acc[tid] || []).concat(arr);
              if (acc[tid].length > 4096) acc[tid] = acc[tid].slice(-4096);
              var s = toStr(acc[tid]);
              if (s && s.length >= 8 && s.length <= 400) {
                send({ t: 'SHA1IN', s: s });
              }
            }
          }
        } catch (e) {}
        return ov.apply(this, arguments);
      };
    })(ups[i]);
  }

  send({ t: 'hooked', what: 'MessageDigest(SHA-1) update' });
});
