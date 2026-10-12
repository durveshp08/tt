plugins {
    id("com.android.application")
}

android {
    namespace = "com.faculty.timetablehelper"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.faculty.timetablehelper"
        minSdk = 23
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }

    sourceSets {
        getByName("main") {
            // Package the finished web interface directly inside the APK.
            assets.srcDir("../..")
            assets.include("index.html", "styles.css", "app.js", "scheduler.js", "manifest.webmanifest", "icon.svg")
        }
    }
}
