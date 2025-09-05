package com.eric.avalia.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public class CategoryMapper {

    public static final class Category {
        public final String type;
        public final String keyword; // pode ser null

        public Category(String type, String keyword) {
            this.type = type;
            this.keyword = keyword;
        }
    }

    private static final Map<String, Category> MAP = new HashMap<>();
    static {
        put("restaurante", "restaurant");
        put("bar", "bar");
        put("cafe", "cafe");
        put("hotel", "lodging");
        put("academia", "gym");
        put("hospital", "hospital");
        put("escola", "school");
        put("mercado", "supermarket", "mercado|supermercado|grocery");
        put("farmacia", "pharmacy");
        put("parque", "park");
        put("shopping", "shopping_mall", "shopping|shopping center|centro comercial");

        // sinônimos em inglês já funcionam direto (ex.: cafe, park, school)
    }

    private static void put(String k, String type) {
        MAP.put(k, new Category(type, null));
    }

    private static void put(String k, String type, String kw) {
        MAP.put(k, new Category(type, kw));
    }

    public static Category resolve(String raw) {
        if (raw == null) return new Category("restaurant", null);
        String k = raw.toLowerCase(Locale.ROOT).trim();
        Category c = MAP.get(k);
        if (c != null) return c;
        // Se vier um type inglês válido, deixamos passar
        if (k.matches("[a-z_]+")) return new Category(k, null);
        // fallback
        return new Category("restaurant", null);
    }

    public static String encode(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }
}
