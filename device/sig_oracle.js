// 确定性检验：用抓包里的真实 5 个参数调用 signRequest，看是否复现同一签名
Java.perform(function () {
  try {
    var NA = Java.use('com.fongmi.android.tv.auth.NativeAuth');
    var cases = [
      ["POST", "/api.php/fongmi/play_auth", "1792256979",
       "4d9f51c5c681f4434c456f7897a2de86",
       "87c7ba8add9c4bdd1fd5d1676c4cad09466d4739f6b6e3f737b1a0908d039776"],
      ["POST", "/api.php/fongmi/play_auth", "1792256979",
       "207e95c80278d293510e106fd98acb43",
       "154f10aabece613414c556e2cbb7aa7d72ef65e8c7c4156405f8540e03504114"],
      ["POST", "/api.php/fongmi/play_auth", "1792256987",
       "7e06d22766d3d6fb3f6bce9e224b5808",
       "b97537eb387a04bc82ed5cdd757934e8b37d12b792b4914a632bb46b1caab3b7"]
    ];
    for (var i = 0; i < cases.length; i++) {
      var c = cases[i];
      try {
        var s = String(NA.signRequest(c[0], c[1], c[2], c[3], c[4]));
        send({ t: 'SIG', idx: i, out: s });
      } catch (e) {
        send({ t: 'SIGERR', idx: i, e: String(e) });
      }
    }
    // 空输入，观察行为
    try {
      send({ t: 'SIG_EMPTY', out: String(NA.signRequest("", "", "", "", "")) });
    } catch (e) { send({ t: 'SIG_EMPTY_ERR', e: String(e) }); }
  } catch (e) {
    send({ t: 'ERR', e: String(e) });
  }
});
