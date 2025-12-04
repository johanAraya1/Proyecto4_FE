package com.coffeecenfo.reactnativemvcapp

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

    /**
     * Nombre del componente principal registrado desde JavaScript
     */
    override fun getMainComponentName(): String = "main"

    /**
     * Se encarga de crear el ReactActivityDelegate, que gestiona la conexión entre
     * Android y la aplicación React Native
     */
    override fun createReactActivityDelegate(): ReactActivityDelegate {
        return DefaultReactActivityDelegate(
                this,
                mainComponentName
        )
    }

    /**
     * Setea el theme antes de onCreate para que funcione el splash screen correctamente
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        setTheme(R.style.AppTheme)
        super.onCreate(null)
    }
}
