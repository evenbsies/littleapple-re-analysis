// 同一组参数连调三次：判断是否有内部随机/时间因素
Java.perform(function () {
  var NA = Java.use('com.fongmi.android.tv.auth.NativeAuth');
  var a = ["POST", "/api.php/fongmi/play_auth", "1792256979",
           "4d9f51c5c681f4434c456f7897a2de86",
           "87c7ba8add9c4bdd1fd5d1676c4cad09466d4739f6b6e3f737b1a0908d039776"];
  for (var i = 0; i < 3; i++) {
    try {
      send({ t: 'SAME', i: i, out: String(NA.signRequest(a[0], a[1], a[2], a[3], a[4])) });
    } catch (e) { send({ t: 'E', i: i, e: String(e) }); }
  }
  // 加盐探测：只改 timestamp
  try {
    send({ t: 'TS0', out: String(NA.signRequest(a[0], a[1], "0", a[3], a[4])) });
    send({ t: 'TS1', out: String(NA.signRequest(a[0], a[1], "1", a[3], a[4])) });
    send({ t: 'M_GET', out: String(NA.signRequest("GET", a[1], a[2], a[3], a[4])) });
  } catch (e) { send({ t: 'E2', e: String(e) }); }
});
