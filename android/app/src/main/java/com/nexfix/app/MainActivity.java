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

        Bridge bridge = getBridge();
        if (bridge != null) {
            WebView webView = bridge.getWebView();
            if (webView != null) {
                WebSettings settings = webView.getSettings();

                // DOM Storage (LocalStorage) ဖွင့်မယ်
                settings.setDomStorageEnabled(true);

                // Database Storage (IndexedDB) ဖွင့်မယ်
                settings.setDatabaseEnabled(true);

                // JavaScript ဖွင့်မယ်
                settings.setJavaScriptEnabled(true);

                // Mixed Content ခွင့်ပြုမယ်
                settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

                // Cache Mode သတ်မှတ်မယ်
                // Cache ရှိရင် Cache ကနေ ယူ၊ မရှိမှ Network ကနေ ယူ
                settings.setCacheMode(WebSettings.LOAD_CACHE_ELSE_NETWORK);

                // File Access ခွင့်ပြုမယ်
                settings.setAllowFileAccess(true);
                settings.setAllowContentAccess(true);

                // Zoom ဖွင့်မယ်
                settings.setSupportZoom(true);
                settings.setBuiltInZoomControls(true);
                settings.setDisplayZoomControls(false);
            }
        }
    }
}
