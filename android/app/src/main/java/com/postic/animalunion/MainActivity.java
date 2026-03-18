package com.postic.animalunion;

import android.os.Bundle;
import android.view.View;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        applySafeAreaInsets();
    }

    @Override
    public void onResume() {
        super.onResume();
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        applySafeAreaInsets();
    }

    private void applySafeAreaInsets() {
        View rootView = getWindow().getDecorView();
        ViewCompat.setOnApplyWindowInsetsListener(rootView, (view, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            int top = systemBars.top;
            int bottom = systemBars.bottom;
            float density = getResources().getDisplayMetrics().density;
            float topDp = top / density;
            float bottomDp = bottom / density;

            String js = String.format(
                "document.documentElement.style.setProperty('--safe-area-inset-top', '%fpx');" +
                "document.documentElement.style.setProperty('--safe-area-inset-bottom', '%fpx');",
                topDp, bottomDp
            );

            if (getBridge() != null && getBridge().getWebView() != null) {
                getBridge().getWebView().post(() ->
                    getBridge().getWebView().evaluateJavascript(js, null)
                );
            }
            return insets;
        });
    }
}
