package com.faculty.timetablehelper;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * Native Android shell for the offline timetable interface.
 * It loads only the files packaged in this APK; no login, server, or Internet
 * permission is required to generate a timetable.
 */
public class MainActivity extends Activity {
    private WebView timetableView;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        timetableView = findViewById(R.id.timetable_webview);
        WebSettings settings = timetableView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);

        // Keep navigation inside this local, offline app.
        timetableView.setWebViewClient(new WebViewClient());
        timetableView.setWebChromeClient(new WebChromeClient());
        timetableView.loadUrl("file:///android_asset/index.html");
    }

    @Override
    public void onBackPressed() {
        if (timetableView.canGoBack()) {
            timetableView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
