package com.hrsjm_application_ui

import android.os.Bundle
import android.view.View
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "HRSJM_APPLICATION_UI"

  override fun onCreate(savedInstanceState: Bundle?) {
    // Pass null to prevent state restoration crashes with react-native-screens
    super.onCreate(null)

    // Ensure soft keyboard (IME) dynamically adjusts root view on Android devices
    val rootView = window.decorView.findViewById<View>(android.R.id.content)
    ViewCompat.setOnApplyWindowInsetsListener(rootView) { view, insets ->
      val imeInsets = insets.getInsets(WindowInsetsCompat.Type.ime())
      val navInsets = insets.getInsets(WindowInsetsCompat.Type.navigationBars())

      val keyboardPadding = if (imeInsets.bottom > navInsets.bottom) {
        imeInsets.bottom - navInsets.bottom
      } else if (imeInsets.bottom > 0) {
        imeInsets.bottom
      } else {
        0
      }

      view.setPadding(
        0,
        0,
        0,
        keyboardPadding
      )
      insets
    }
  }

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
