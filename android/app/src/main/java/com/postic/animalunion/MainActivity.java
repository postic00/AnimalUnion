package com.postic.animalunion;

import android.os.Bundle;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // edge-to-edge 비활성화 (시스템 바가 레이아웃을 침범하지 않도록)
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
    }
}
