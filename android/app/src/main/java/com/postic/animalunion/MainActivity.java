package com.postic.animalunion;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        applyFitsSystemWindows();
    }

    @Override
    public void onStart() {
        super.onStart();
        applyFitsSystemWindows();
    }

    @Override
    public void onResume() {
        super.onResume();
        applyFitsSystemWindows();
    }

    private void applyFitsSystemWindows() {
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
    }
}
