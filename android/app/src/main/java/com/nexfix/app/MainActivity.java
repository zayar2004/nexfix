package com.nexfix.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.ServiceWorkerController;
import android.webkit.ServiceWorkerWebSettings;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Bridge;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        Bridge bridge = getBridge();
        if (bridge != null) {
            WebView webView = bridge.getWebView();
            if (webView != null) {
                WebSettings settings = webView.getSettings();

                // ၁။ DOM Storage (LocalStorage) ဖွင့်မယ်
                settings.setDomStorageEnabled(true);

                // ၂။ Database Storage (IndexedDB) ဖွင့်မယ်
                settings.setDatabaseEnabled(true);

                // ၃။ JavaScript ဖွင့်မယ်
                settings.setJavaScriptEnabled(true);

                // ၄။ Mixed Content ခွင့်ပြုမယ်
                settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

                // ၅။ Cache Mode သတ်မှတ်မယ်
                settings.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);

                // ၆။ File Access ခွင့်ပြုမယ်
                settings.setAllowFileAccess(true);
                settings.setAllowContentAccess(true);

                // ၇။ Service Worker ကို ဖွင့်မယ် (Android 7.0+)
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.N) {
                    try {
                        ServiceWorkerController swController = ServiceWorkerController.getInstance();
                        ServiceWorkerWebSettings swSettings = swController.getServiceWorkerWebSettings();
                        swSettings.setAllowContentAccess(true);
                        swSettings.setAllowFileAccess(true);
                        swSettings.setBlockNetworkLoads(false);
                        swSettings.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);
                    } catch (Exception e) {
                        android.util.Log.e("MainActivity", "Service Worker setup failed", e);
                    }
                }

                // ၈။ Cache ကို မဖျက်ဘူး
                webView.clearCache(false);
            }
        }
    }
}
