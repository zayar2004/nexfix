package com.nexfix.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Bridge;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // WebView Settings တွေ ရယူမယ်
        Bridge bridge = getBridge();
        if (bridge != null) {
            WebView webView = bridge.getWebView();
            if (webView != null) {
                WebSettings settings = webView.getSettings();

                // ၁။ DOM Storage (LocalStorage) ဖွင့်မယ်
                settings.setDomStorageEnabled(true);

                // ၂။ Database Storage (IndexedDB) ဖွင့်မယ်
                settings.setDatabaseEnabled(true);

                // ၃။ App Cache ဖွင့်မယ်
                settings.setAppCacheEnabled(true);

                // ၄။ JavaScript ဖွင့်မယ် (Service Worker အတွက်)
                settings.setJavaScriptEnabled(true);

                // ၅။ Mixed Content ခွင့်ပြုမယ်
                settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

                // ၆။ Cache Mode သတ်မှတ်မယ်
                // Cache ရှိရင် Cache ကနေ ယူ၊ မရှိမှ Network ကနေ ယူ
                settings.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);

                // ၇။ Service Worker Cache ကို ဖွင့်မယ်
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
                    webView.setWebViewClient(new android.webkit.WebViewClient() {
                        @Override
                        public android.webkit.WebResourceResponse shouldInterceptRequest(
                                WebView view,
                                android.webkit.WebResourceRequest request) {
                            // Service Worker Request တွေကို ဖြတ်သန်းခွင့်ပြုမယ်
                            return super.shouldInterceptRequest(view, request);
                        }
                    });
                }

                // ၈။ File Access ခွင့်ပြုမယ်
                settings.setAllowFileAccess(true);
                settings.setAllowContentAccess(true);

                // ၉။ Zoom ဖွင့်မယ်
                settings.setSupportZoom(true);
                settings.setBuiltInZoomControls(true);
                settings.setDisplayZoomControls(false);

                // ၁၀။ Cache ကို မဖျက်ဘူး
                webView.clearCache(false);
            }
        }
    }
}
