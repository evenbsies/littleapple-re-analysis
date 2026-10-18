// 导出 NativeAuth 的密钥材料。此时 libhsjtv.so 已由应用自身加载完毕，
// 调用这些 native 方法不会再触发 <clinit> 里的 loadLibrary，因此不会崩。
Java.perform(function () {
  try {
    var NA = Java.use('com.fongmi.android.tv.auth.NativeAuth');
    var kv = String(NA.keyVersion());
    var bkv = String(NA.brokerKeyVersion());
    var base = String(NA.defaultBaseUrl());
    var key = NA.cryptoKey();
    var hex = '';
    if (key !== null) {
      for (var i = 0; i < key.length; i++) {
        var b = (key[i] + 256) % 256;
        hex += ('0' + b.toString(16)).slice(-2);
      }
    }
    send({ t: 'KEY', keyVersion: kv, brokerKeyVersion: bkv, defaultBaseUrl: base,
           cryptoKeyHex: hex, cryptoKeyLen: key === null ? 0 : key.length });
  } catch (e) {
    send({ t: 'KEYERR', e: String(e) });
  }
});
