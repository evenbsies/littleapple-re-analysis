### load_apk
{"state":"LOADED","apk_path":"D://REA//device//hsj9.jar","class_count":254,"raw_class_count":254,"resource_count":2,"load_duration_ms":505,"decompile_timeout_ms":90000,"threads":4,"code_cache_size":64,"resources":"full"}
### get_class_source
package com.github.catvod.spider;



import android.content.Context;

import android.text.TextUtils;

import com.github.catvod.crawler.Spider;

import com.github.catvod.spider.harden.a2;

import com.github.catvod.spider.merge.entryauth.a4;

import com.github.catvod.spider.merge.f.b;

import com.github.catvod.spider.merge.liteapple20260731.a5;

import java.net.URI;

import java.net.URLEncoder;

import java.util.ArrayList;

import java.util.HashMap;

import java.util.LinkedHashMap;

import java.util.List;

import java.util.Locale;

import org.json.JSONArray;

import org.json.JSONObject;



/* JADX INFO: loaded from: classes.dex */

public class LiteApple extends Spider {

    private final b deviceHeaders = new b();

    private String base = "http://su.haotv.site";

    private String media = "http://s1.xpgtv.netmb.9box.store/m3u8/";



    private static String m52(String str) throws Exception {

        if (str == null) {

            str = "";

        }

        return URLEncoder.encode(str, "UTF-8");

    }



    private static JSONObject m53(String str, String str2, JSONArray jSONArray, boolean z) throws Exception {

        JSONArray jSONArray2 = new JSONArray();

        String strM244 = "v";

        String strM245 = "n";

        if (z) {

            jSONArray2.put(new JSONObject().put(strM245, "全部").put(strM244, ""));

        }

        for (int i = 0; i < jSONArray.length(); i++) {

            String string = jSONArray.getString(i);

            jSONArray2.put(new JSONObject().put(strM245, string).put(strM244, string));

        }

        return new JSONObject().put("key", str).put("name", str2).put("value", jSONArray2);

    }



    private JSONObject m54(String str) throws Exception {

        return new JSONObject(a5.m289(this.base + str, new HashMap()));

    }



    private String m55(String str, String str2, boolean z, HashMap<String, String> map) throws Exception {

        int iMax = Math.max(1, Integer.parseInt(str2));

        StringBuilder sbAppend = new StringBuilder("/api.php/v2.vod/androidfilter10086?page=").append(iMax).append("&type=").append(m52(str));

        if (map != null) {

            for (String str3 : map.keySet()) {

                String str4 = map.get(str3);

                if (str4 != null && !str4.trim().isEmpty()) {

                    sbAppend.append('&').append(m52(str3)).append('=').append(m52(str4.trim()));

                }

            }

        }

        JSONArray jSONArrayM63 = m63(m54(sbAppend.toString()).getJSONArray("data"));

        JSONObject jSONObjectPut = new JSONObject().put("list", jSONArrayM63).put("page", iMax);

        if (jSONArrayM63.length() == 20) {

            iMax++;

        }

        return jSONObjectPut.put("pagecount", iMax).put("limit", 20).put("total", Integer.MAX_VALUE).toString();

    }



    private String m56(List<String> list) throws Exception {

        JSONObject jSONObject = new JSONObject(a5.m289(this.base + "/api.php/v3.vod/androiddetail2?vod_id=" + m52(list.get(0)), this.deviceHeaders.a())).getJSONObject("data");

        JSONObject jSONObjectM64 = m64(jSONObject);

        jSONObjectM64.put("type_name", jSONObject.optString("className"));

        jSONObjectM64.put("vod_year", jSONObject.optString("year"));

        jSONObjectM64.put("vod_area", jSONObject.optString("area"));

        jSONObjectM64.put("vod_actor", jSONObject.optString("actor"));

        jSONObjectM64.put("vod_content", jSONObject.optString("content").trim());

        jSONObjectM64.put("vod_uploader", jSONObject.optString("uploader").trim());

        ArrayList arrayList = new ArrayList();

        JSONArray jSONArray = jSONObject.getJSONArray("urls");

        for (int i = 0; i < jSONArray.length(); i++) {

            JSONObject jSONObject2 = jSONArray.getJSONObject(i);

            arrayList.add(jSONObject2.getString("key") + "$" + jSONObject2.getString("url"));

        }

        jSONObjectM64.put("vod_play_from", "LiteApple").put("vod_play_url", TextUtils.join("#", arrayList));

        return new JSONObject().put("list", new JSONArray().put(jSONObjectM64)).toString();

    }



    private String m57(boolean z) throws Exception {

        String strM244;

        JSONArray jSONArray = m54("/api.php/v2.vod/androidtypes").getJSONArray("data");

        JSONArray jSONArray2 = new JSONArray();

        JSONObject jSONObject = new JSONObject();

        int i = 0;

        while (true) {

            int length = jSONArray.length();

            strM244 = "class";

            if (i >= length) {

                break;

            }

            JSONObject jSONObject2 = jSONArray.getJSONObject(i);

            String strM245 = "type_id";

            String string = jSONObject2.getString(strM245);

            JSONObject jSONObjectPut = new JSONObject().put(strM245, string);

            String strM246 = "type_name";

            jSONArray2.put(jSONObjectPut.put(strM246, jSONObject2.getString(strM246)));

            if (z) {

                JSONArray jSONArray3 = new JSONArray();

                jSONArray3.put(m53(strM244, "类别", jSONObject2.getJSONArray("classes"), false));

                jSONArray3.put(m53("area", "地区", jSONObject2.getJSONArray("areas"), true));

                jSONArray3.put(m53("year", "年份", jSONObject2.getJSONArray("years"), true));

                JSONArray jSONArray4 = new JSONArray();

                JSONObject jSONObject3 = new JSONObject();

                String strM247 = "时间";

                String strM248 = "n";

                JSONObject jSONObjectPut2 = jSONObject3.put(strM248, strM247);

                String strM249 = "updatetime";

                String strM2410 = "v";

                jSONArray4.put(jSONObjectPut2.put(strM2410, strM249));

                jSONArray4.put(new JSONObject().put(strM248, "人气").put(strM2410, "hits"));

                jSONArray4.put(new JSONObject().put(strM248, "评分").put(strM2410, "score"));

                jSONArray3.put(new JSONObject().put("key", "sortby").put("name", "排序").put("value", jSONArray4));

                jSONObject.put(string, jSONArray3);

            }

            i++;

        }

        JSONObject jSONObjectPut3 = new JSONObject().put(strM244, jSONArray2);

        if (z) {

            jSONObjectPut3.put("filters", jSONObject);

        }

        return jSONObjectPut3.toString();

    }



    private String m58() throws Exception {

        JSONObject jSONObject = m54("/api.php/v2.main/androidhome").getJSONObject("data");

        String strM244 = "list";

        JSONArray jSONArray = jSONObject.getJSONArray(strM244);

        LinkedHashMap linkedHashMap = new LinkedHashMap();

        for (int i = 0; i < jSONArray.length(); i++) {

            JSONArray jSONArray2 = jSONArray.getJSONObject(i).getJSONArray(strM244);

            for (int i2 = 0; i2 < Math.min(4, jSONArray2.length()); i2++) {

                JSONObject jSONObjectM64 = m64(jSONArray2.getJSONObject(i2));

                linkedHashMap.put(jSONObjectM64.getString("vod_id"), jSONObjectM64);

            }

        }

        return new JSONObject().put(strM244, new JSONArray(linkedHashMap.values())).toString();

    }



    private void m59(Context context, String str) throws Exception {

        super.init(context, str);

        this.deviceHeaders.a = context;

        if (str == null || str.trim().isEmpty()) {

            return;

        }

        String strTrim = str.trim();

        if (strTrim.startsWith("{")) {

            JSONObject jSONObject = new JSONObject(strTrim);

            strTrim = jSONObject.optString("url", jSONObject.optString("host", ""));

        }

        if (strTrim.isEmpty()) {

            return;

        }

        URI uriCreate = URI.create(strTrim);

        if ((!"https".equalsIgnoreCase(uriCreate.getScheme()) && !"http".equalsIgnoreCase(uriCreate.getScheme())) || uriCreate.getHost() == null || uriCreate.getRawUserInfo() != null || uriCreate.getRawQuery() != null || uriCreate.getRawFragment() != null) {

            throw new IllegalArgumentException("LiteApple ext must be an HTTP(S) API root");

        }

        this.base = strTrim.replaceAll("/+$", "");

    }



    private String m60(String str, String str2, List<String> list) throws Exception {

        JSONObject jSONObject = new JSONObject();

        String strM244 = "parse";

        JSONObject jSONObjectPut = jSONObject.put(strM244, 0).put("playUrl", "");

        if (str2.startsWith("JBN_")) {

            str2 = "https://www.yangshipin.cn/tv/home?pid=" + str2.substring(4);

            jSONObjectPut.put(strM244, 1).put("header", new JSONObject().put("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36").toString());

        }

        String lowerCase = str2.toLowerCase(Locale.ROOT);

        if (!lowerCase.startsWith("http://") && !lowerCase.startsWith("https://")) {

            str2 = this.media + str2 + ".m3u8";

        }

        return jSONObjectPut.put("url", str2).toString();

    }



    private String m61(String str, boolean z) throws Exception {

        return searchContent(str, z, "1");

    }



    private String m62(String str, boolean z, String str2) throws Exception {

        return new JSONObject().put("list", m63(m54("/api.php/v2.vod/androidsearch10086?page=" + Math.max(1, Integer.parseInt(str2)) + "&wd=" + m52(str)).getJSONArray("data"))).toString();

    }



    private static JSONArray m63(JSONArray jSONArray) throws Exception {

        JSONArray jSONArray2 = new JSONArray();

        for (int i = 0; i < jSONArray.length(); i++) {

            jSONArray2.put(m64(jSONArray.getJSONObject(i)));

        }

        return jSONArray2;

    }



    private static JSONObject m64(JSONObject jSONObject) throws Exception {

        return new JSONObject().put("vod_id", jSONObject.getString("id")).put("vod_name", jSONObject.optString("name")).put("vod_pic", jSONObject.optString("pic")).put("vod_remarks", jSONObject.optString("updateInfo"));

    }



    public String categoryContent(String str, String str2, boolean z, HashMap map) {

        a4.m278();

        return m55(str, str2, z, map);

    }



    public String detailContent(List list) {

        a4.m278();

        return m56(list);

    }



    public String homeContent(boolean z) {

        a4.m278();

        return m57(z);

    }



    public String homeVideoContent() {

        a4.m278();

        return m58();

    }



    public void init(Context context, String str) throws Exception {

        a4.m279(context);

        m59(context, str);

    }



    public String playerContent(String str, String str2, List list) throws Exception {

        a4.m278();

        return a4.m282("LiteApple", str, m60(str, str2, list));

    }



    public String searchContent(String str, boolean z) {

        a4.m278();

        return m61(str, z);

    }



    public String searchContent(String str, boolean z, String str2) {

        a4.m278();

        return m62(str, z, str2);

    }

}
