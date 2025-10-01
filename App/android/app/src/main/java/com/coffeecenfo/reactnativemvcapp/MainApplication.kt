package com.coffeecenfo.reactnativemvcapp

import android.app.Application
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.PackageList
import com.facebook.react.defaults.DefaultReactNativeHost

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost = object : DefaultReactNativeHost(this) {
    override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

    override fun getPackages(): List<ReactPackage> {
      return PackageList(this).packages.apply {
        // Paquetes que no se autolinkean pueden agregarse manualmente aquí
      }
    }

    override fun getJSMainModuleName(): String = "index"
  }
}