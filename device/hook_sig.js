// 直接 hook NativeAuth.signRequest，记录应用真正传入的参数与返回签名
Java.perform(function () {
  try {
    var NA = Java.use('com.fongmi.android.tv.auth.NativeAuth');
    var s = NA.signRequest;
    s.overloads.forEach(function (ov) {
      if (ov.argumentTypes.length !== 5) return;
      ov.implementation = function (a, b, c, d, e) {
        var r = ov.call(this, a, b, c, d, e);
        send({ t: 'SIGN', a1: String(a), a2: String(b), a3: String(c),
               a4: String(d), a5: String(e), out: String(r) });
        return r;
      };
    });
    send({ t: 'hooked', what: 'signRequest' });
  } catch (e) {
    send({ t: 'err', e: String(e) });
  }
});
