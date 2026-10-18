### load_apk
{"state":"LOADED","apk_path":"D://REA//device//hsj9.jar","class_count":254,"raw_class_count":254,"resource_count":2,"load_duration_ms":523,"decompile_timeout_ms":90000,"threads":4,"code_cache_size":64,"resources":"full"}
### get_class_source
package com.github.catvod.spider;



import android.content.Context;

import android.text.TextUtils;

import com.github.catvod.crawler.Spider;

import com.github.catvod.spider.harden.a2;

import com.github.catvod.spider.merge.entryauth.a4;

import java.security.MessageDigest;

import java.util.Collections;

import java.util.HashMap;

import java.util.LinkedHashMap;

import java.util.List;

import java.util.Map;

import java.util.TreeMap;

import java.util.UUID;

import java.util.concurrent.TimeUnit;

import okhttp3.HttpUrl;

import okhttp3.OkHttpClient;

import okhttp3.Request;

import okhttp3.Response;

import org.json.JSONArray;

import org.json.JSONObject;



/* JADX INFO: loaded from: classes.dex */

public class JpysNew extends Spider {

    private static final String b = "cb808529bae6b6be45ecfab29a4889bc";

    private static final String c;

    private static final String[][] d;

    private static final OkHttpClient e;

    private final String a = UUID.randomUUID().toString();



    static {

        String strM244 = "1";

        c = strM244;

        d = new String[][]{new String[]{strM244, "电影"}, new String[]{"2", "电视剧"}, new String[]{"3", "综艺"}, new String[]{"4", "动漫"}};

        OkHttpClient.Builder builder = new OkHttpClient.Builder();

        TimeUnit timeUnit = TimeUnit.SECONDS;

        e = builder.connectTimeout(15L, timeUnit).readTimeout(15L, timeUnit).build();

    }



    private static JSONObject a(String str, String str2, JSONArray jSONArray) throws Exception {

        JSONArray jSONArray2 = new JSONArray();

        JSONObject jSONObject = new JSONObject();

        String strM244 = "全部";

        String strM245 = "n";

        JSONObject jSONObjectPut = jSONObject.put(strM245, strM244);

        String strM246 = "v";

        jSONArray2.put(jSONObjectPut.put(strM246, ""));

        if (jSONArray != null) {

            for (int i = 0; i < jSONArray.length(); i++) {

                JSONObject jSONObject2 = jSONArray.getJSONObject(i);

                jSONArray2.put(new JSONObject().put(strM245, jSONObject2.optString("itemText")).put(strM246, jSONObject2.optString("itemValue")));

            }

        }

        return new JSONObject().put("key", str).put("name", str2).put("value", jSONArray2);

    }



    private String b(String str, Map<String, String> map) throws Exception {

        String strM0;

        String strM1;

        String strM244 = "UTF-8";

        long jCurrentTimeMillis = System.currentTimeMillis();

        HttpUrl.Builder builderNewBuilder = HttpUrl.parse(str).newBuilder();

        for (Map.Entry<String, String> entry : map.entrySet()) {

            if (entry.getValue() != null && !entry.getValue().isEmpty()) {

                builderNewBuilder.addQueryParameter(entry.getKey(), entry.getValue());

            }

        }

        Request.Builder builderUrl = new Request.Builder().url(builderNewBuilder.build());

        TreeMap treeMap = new TreeMap(map);

        StringBuilder sb = new StringBuilder();

        for (Map.Entry entry2 : treeMap.entrySet()) {

            String str2 = (String) entry2.getValue();

            if (str2 != null && !str2.isEmpty()) {

                if (sb.length() > 0) {

                    sb.append('&');

                }

                sb.append((String) entry2.getKey());

                sb.append('=');

                sb.append(str2);

            }

        }

        if (sb.length() > 0) {

            sb.append('&');

        }

        sb.append("key=");

        sb.append(b);

        sb.append("&t=");

        sb.append(jCurrentTimeMillis);

        try {

            strM0 = m0(MessageDigest.getInstance("MD5"), sb.toString().getBytes(strM244));

        } catch (Exception e2) {

            strM0 = "";

        }

        try {

            strM1 = m0(MessageDigest.getInstance("SHA-1"), strM0.getBytes(strM244));

        } catch (Exception e3) {

            strM1 = "";

        }

        Response responseExecute = e.newCall(builderUrl.header("sign", strM1).header("t", String.valueOf(jCurrentTimeMillis)).header("deviceId", this.a).header("authorization", "").header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)").build()).execute();

        String strString = responseExecute.body().string();

        responseExecute.close();

        return strString;

    }



    private static String m0(MessageDigest messageDigest, byte[] bArr) throws Exception {

        byte[] bArrDigest = messageDigest.digest(bArr);

        StringBuilder sb = new StringBuilder(bArrDigest.length * 2);

        for (byte b2 : bArrDigest) {

            sb.append(String.format("%02x", Integer.valueOf(b2 & 255)));

        }

        return sb.toString();

    }



    private static void m1(LinkedHashMap linkedHashMap, HashMap map, String str) throws Exception {

        Object obj;

        if (map == null || (obj = map.get(str)) == null) {

            return;

        }

        String strTrim = obj.toString().trim();

        if (strTrim.isEmpty() || "全部".equals(strTrim)) {

            return;

        }

        linkedHashMap.put(str, strTrim);

    }



    private String m10(String str, boolean z, String str2) throws Exception {

        JSONObject jSONObjectOptJSONObject;

        LinkedHashMap linkedHashMap = new LinkedHashMap();

        linkedHashMap.put("keyword", str);

        linkedHashMap.put("pageNum", str2);

        linkedHashMap.put("pageSize", "20");

        JSONObject jSONObjectOptJSONObject2 = new JSONObject(b("https://www.hkybqufgh.com/api/mw-movie/anonymous/video/searchByWord", linkedHashMap)).optJSONObject("data");

        String strM244 = "list";

        JSONArray jSONArrayOptJSONArray = null;

        if (jSONObjectOptJSONObject2 != null) {

            String strM245 = "result";

            if (jSONObjectOptJSONObject2.has(strM245) && (jSONObjectOptJSONObject = jSONObjectOptJSONObject2.optJSONObject(strM245)) != null) {

                jSONArrayOptJSONArray = jSONObjectOptJSONObject.optJSONArray(strM244);

            }

            if (jSONArrayOptJSONArray == null) {

                jSONArrayOptJSONArray = jSONObjectOptJSONObject2.optJSONArray(strM244);

            }

        }

        JSONArray jSONArray = new JSONArray();

        if (jSONArrayOptJSONArray != null) {

            for (int i = 0; i < jSONArrayOptJSONArray.length(); i++) {

                jSONArray.put(m2(jSONArrayOptJSONArray.getJSONObject(i)));

            }

        }

        return new JSONObject().put(strM244, jSONArray).put("total", jSONObjectOptJSONObject2 != null ? jSONObjectOptJSONObject2.optInt("totalCount", 0) : 0).toString();

    }



    private static JSONObject m2(JSONObject jSONObject) throws Exception {

        JSONObject jSONObject2 = new JSONObject();

        jSONObject2.put("vod_id", jSONObject.optString("vodId"));

        jSONObject2.put("vod_name", jSONObject.optString("vodName"));

        jSONObject2.put("vod_pic", jSONObject.optString("vodPic"));

        jSONObject2.put("vod_remarks", jSONObject.optString("vodRemarks"));

        return jSONObject2;

    }



    private String m3(String str, String str2, boolean z, HashMap map) throws Exception {

        LinkedHashMap linkedHashMap = new LinkedHashMap();

        linkedHashMap.put("type1", str);

        String strM244 = "pageNum";

        linkedHashMap.put(strM244, str2);

        linkedHashMap.put("pageSize", "20");

        m1(linkedHashMap, map, "vClass");

        m1(linkedHashMap, map, "area");

        m1(linkedHashMap, map, "year");

        m1(linkedHashMap, map, "sortBy");

        JSONObject jSONObjectOptJSONObject = new JSONObject(b("https://www.hkybqufgh.com/api/mw-movie/anonymous/video/list", linkedHashMap)).optJSONObject("data");

        JSONArray jSONArray = new JSONArray();

        String strM245 = "list";

        JSONArray jSONArrayOptJSONArray = jSONObjectOptJSONObject == null ? null : jSONObjectOptJSONObject.optJSONArray(strM245);

        if (jSONArrayOptJSONArray != null) {

            for (int i = 0; i < jSONArrayOptJSONArray.length(); i++) {

                jSONArray.put(m2(jSONArrayOptJSONArray.getJSONObject(i)));

            }

        }

        return new JSONObject().put(strM245, jSONArray).put("page", jSONObjectOptJSONObject == null ? 1 : jSONObjectOptJSONObject.optInt(strM244, 1)).put("pagecount", jSONObjectOptJSONObject != null ? jSONObjectOptJSONObject.optInt("totalPage", 1) : 1).put("limit", 20).put("total", jSONObjectOptJSONObject != null ? jSONObjectOptJSONObject.optInt("totalCount", 0) : 0).toString();

    }



    private String m4(List list) throws Exception {

        int i = 0;

        String strValueOf = String.valueOf(list.get(0));

        JSONObject jSONObjectOptJSONObject = new JSONObject(b("https://www.hkybqufgh.com/api/mw-movie/anonymous/video/detail", Collections.singletonMap("id", strValueOf))).optJSONObject("data");

        if (jSONObjectOptJSONObject == null) {

            return "";

        }

        JSONArray jSONArrayOptJSONArray = jSONObjectOptJSONObject.optJSONArray("episodeList");

        StringBuilder sb = new StringBuilder();

        if (jSONArrayOptJSONArray != null) {

            while (i < jSONArrayOptJSONArray.length()) {

                JSONObject jSONObject = jSONArrayOptJSONArray.getJSONObject(i);

                i++;

                String strOptString = jSONObject.optString("name", String.valueOf(i));

                String strOptString2 = jSONObject.optString("nid");

                if (!TextUtils.isEmpty(strOptString2)) {

                    if (sb.length() > 0) {

                        sb.append('#');

                    }

                    sb.append(strOptString);

                    sb.append('$');

                    sb.append(strValueOf);

                    sb.append('@');

                    sb.append(strOptString2);

                }

            }

        }

        JSONObject jSONObjectM2 = m2(jSONObjectOptJSONObject);

        jSONObjectM2.put("vod_content", jSONObjectOptJSONObject.optString("vodContent"));

        jSONObjectM2.put("vod_actor", jSONObjectOptJSONObject.optString("vodActor"));

        jSONObjectM2.put("vod_director", jSONObjectOptJSONObject.optString("vodDirector"));

        jSONObjectM2.put("vod_area", jSONObjectOptJSONObject.optString("vodArea"));

        jSONObjectM2.put("vod_year", jSONObjectOptJSONObject.optString("vodYear"));

        jSONObjectM2.put("vod_class", jSONObjectOptJSONObject.optString("vodClass"));

        jSONObjectM2.put("vod_play_from", "在线播放");

        jSONObjectM2.put("vod_play_url", sb.toString());

        return new JSONObject().put("list", new JSONArray().put(jSONObjectM2)).toString();

    }



    private String m5(boolean z) throws Exception {

        JSONObject jSONObjectOptJSONObject;

        JSONArray jSONArray = new JSONArray();

        String[][] strArr = d;

        for (String[] strArr2 : strArr) {

            jSONArray.put(new JSONObject().put("type_id", strArr2[0]).put("type_name", strArr2[1]));

        }

        JSONObject jSONObject = new JSONObject();

        String strM244 = "data";

        if (z && (jSONObjectOptJSONObject = new JSONObject(b("https://www.hkybqufgh.com/api/mw-movie/anonymous/v1/get/filer/list", Collections.emptyMap())).optJSONObject(strM244)) != null) {

            for (String[] strArr3 : strArr) {

                JSONObject jSONObjectOptJSONObject2 = jSONObjectOptJSONObject.optJSONObject(strArr3[0]);

                if (jSONObjectOptJSONObject2 != null) {

                    JSONArray jSONArray2 = new JSONArray();

                    jSONArray2.put(a("vClass", "类型", jSONObjectOptJSONObject2.optJSONArray("typeList")));

                    jSONArray2.put(a("area", "地区", jSONObjectOptJSONObject2.optJSONArray("areaList")));

                    jSONArray2.put(a("year", "年份", jSONObjectOptJSONObject2.optJSONArray("yearList")));

                    jSONArray2.put(a("sortBy", "排序", jSONObjectOptJSONObject2.optJSONArray("orderList")));

                    jSONObject.put(strArr3[0], jSONArray2);

                }

            }

        }

        JSONObject jSONObjectOptJSONObject3 = new JSONObject(b("https://www.hkybqufgh.com/api/mw-movie/anonymous/home/hotSearch", Collections.emptyMap())).optJSONObject(strM244);

        String strM245 = "list";

        JSONArray jSONArray3 = jSONObjectOptJSONObject3 == null ? new JSONArray() : jSONObjectOptJSONObject3.optJSONArray(strM245);

        JSONArray jSONArray4 = new JSONArray();

        if (jSONArray3 != null) {

            for (int i = 0; i < jSONArray3.length(); i++) {

                jSONArray4.put(m2(jSONArray3.getJSONObject(i)));

            }

        }

        return new JSONObject().put("class", jSONArray).put(strM245, jSONArray4).put("filters", jSONObject).toString();

    }



    private void m6(Context context, String str) throws Exception {

    }



    private String m7(String str, String str2, List list) throws Exception {

        String str3;

        int iOptInt;

        String[] strArrSplit = str2.split("@", 2);

        int length = strArrSplit.length;

        String strM244 = "{}";

        if (length < 2) {

            return strM244;

        }

        String str4 = strArrSplit[0];

        String str5 = strArrSplit[1];

        LinkedHashMap linkedHashMap = new LinkedHashMap();

        linkedHashMap.put("clientType", c);

        linkedHashMap.put("id", str4);

        linkedHashMap.put("nid", str5);

        JSONObject jSONObjectOptJSONObject = new JSONObject(b("https://www.hkybqufgh.com/api/mw-movie/anonymous/v2/video/episode/url", linkedHashMap)).optJSONObject("data");

        if (jSONObjectOptJSONObject == null) {

            return strM244;

        }

        JSONArray jSONArrayOptJSONArray = jSONObjectOptJSONObject.optJSONArray("list");

        String strM245 = "url";

        if (jSONArrayOptJSONArray == null || jSONArrayOptJSONArray.length() == 0) {

            str3 = "";

        } else {

            int i = -1;

            str3 = "";

            for (int i2 = 0; i2 < jSONArrayOptJSONArray.length(); i2++) {

                JSONObject jSONObject = jSONArrayOptJSONArray.getJSONObject(i2);

                String strOptString = jSONObject.optString(strM245);

                if (!TextUtils.isEmpty(strOptString) && (iOptInt = jSONObject.optInt("resolution", 0)) > i) {

                    i = iOptInt;

                    str3 = strOptString;

                }

            }

        }

        return new JSONObject().put("parse", 0).put("playUrl", "").put(strM245, str3).toString();

    }



    private String m8(String str, boolean z) throws Exception {

        return m10(str, z, "1");

    }



    private String m9(String str, boolean z, String str2) throws Exception {

        return m10(str, z, a1.page(str2));

    }



    public String categoryContent(String str, String str2, boolean z, HashMap map) {

        a4.m278();

        return m3(str, str2, z, map);

    }



    public String detailContent(List list) {

        a4.m278();

        return m4(list);

    }



    public String homeContent(boolean z) {

        a4.m278();

        return m5(z);

    }



    public void init(Context context, String str) throws Exception {

        a4.m279(context);

        m6(context, str);

    }



    public String playerContent(String str, String str2, List list) {

        a4.m278();

        return m7(str, str2, list);

    }



    public String searchContent(String str, boolean z) {

        a4.m278();

        return m8(str, z);

    }



    public String searchContent(String str, boolean z, String str2) {

        a4.m278();

        return m9(str, z, str2);

    }

}
