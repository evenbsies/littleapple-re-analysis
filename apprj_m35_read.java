### load_apk
{"state":"LOADED","apk_path":"D://REA//device//hsj9.jar","class_count":254,"raw_class_count":254,"resource_count":2,"load_duration_ms":489,"decompile_timeout_ms":90000,"threads":4,"code_cache_size":64,"resources":"full"}
### get_method_by_name
    private static String m35(String str) throws Exception {

        try {

            StringBuilder sb = new StringBuilder(new BigInteger(1, MessageDigest.getInstance("MD5").digest(("7gp0bnd2sr85ydii2j32pcypscoc4w6c7g5spl" + str).getBytes("UTF-8"))).toString(16));

            while (sb.length() < 32) {

                sb.insert(0, "0");

            }

            return sb.toString().toLowerCase();

        } catch (Exception e2) {

            return "";

        }

    }
