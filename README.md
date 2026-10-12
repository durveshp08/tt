# Faculty Timetable Helper

A free, offline-first, mobile-friendly timetable app for the TY SPPU Computer Engineering AI Lab mini project. It is designed to be simple for faculty and students: add subjects, give their weekly frequency, and generate a transparent rule-based timetable.

## Important note about the supplied Python code

The supplied `tt_schedule.py` has **not been edited**. This app uses a separate browser-friendly implementation in `scheduler.js` that preserves the same rules: fixed slots, lab blocks first, theory rotation, daily variety where possible, and refresh-based rotation. The Python program remains your original reference implementation.

## What the app does

- Works on Android, desktop, and tablet browsers.
- Can be installed on Android as an app using Chrome's **Add to Home screen** option.
- Works offline after the first visit.
- Uses only local storage on the device; there is no login, server, ads, or cost.
- Shows every scheduling rule inside the app for easy explanation during your viva.
- Lets the user refresh only the arrangement, copy the result, or save it as a PDF through Android's print dialog.

## Run it on your computer

This is a static app: it needs no paid API, database, or build tool.

1. Open this folder in VS Code.
2. Install the free **Live Server** extension in VS Code.
3. Right-click `index.html` and choose **Open with Live Server**.
4. Try adding subjects and select **Generate timetable**.

The original Python version can still be run separately with `python tt_schedule.py` wherever Python is installed. Do not replace it with this web app; both are useful project artefacts.

## Use it on an Android phone for free

The easiest free publishing method is GitHub Pages.

1. Create a free account at [github.com](https://github.com), then create a new public repository named `faculty-timetable-helper`.
2. Upload every file from this folder. Keep the files at the repository's top level.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, select **Deploy from a branch**, choose `main` and `/ (root)`, then save.
5. Wait a few minutes. GitHub will show a public website address such as `https://your-name.github.io/faculty-timetable-helper/`.
6. Open that address in **Google Chrome on Android**. Open Chrome's three-dot menu and choose **Add to Home screen** (or **Install app**). The timetable then opens like a normal mobile app and continues working offline after its first visit.

GitHub Pages is free. Google Play Console publishing is **not** free because Google charges a one-time developer registration fee. For a genuinely no-cost mini-project demo, share the GitHub Pages link or install it from Chrome on a phone.

## Create a free installable APK

This project now includes a complete Android app shell in the `android` folder. It bundles the timetable interface inside the APK, so the app runs offline and does not ask for Internet permission.

### Easiest method: free GitHub build (recommended)

1. Follow the GitHub upload steps above, including the hidden `.github` folder. Keep all files in the repository exactly as they are.
2. In your GitHub repository, select the **Actions** tab.
3. Select **Build installable Android APK** from the left side, then click **Run workflow** and confirm **Run workflow**.
4. Wait until the workflow shows a green tick. Open that completed workflow.
5. At the bottom, under **Artifacts**, download **Faculty-Timetable-Helper-APK**. Unzip it: inside is `app-debug.apk`.
6. Transfer `app-debug.apk` to your Android phone, open it, and allow **Install unknown apps** when Android asks. Select **Install**.

This creates a real installable Android APK for free. It is a debug APK, ideal for your mini-project demonstration and direct sharing. It is not uploaded to the Play Store.

### Build locally with Android Studio (optional)

Install the free Android Studio application, open the `android` folder as a project, wait for Gradle sync, then choose **Build → Build APK(s)**. The APK will be at `android/app/build/outputs/apk/debug/app-debug.apk`.

Google Play Console publication is not free because Google charges a one-time developer registration fee. Direct APK installation and GitHub Actions builds are free.

## Explain it in your viva

> This is a rule-based recommendation system. It first reserves two consecutive lecture periods for every lab session. Next, it fills the remaining lecture periods with theory subjects. It chooses a subject not already used on that day whenever possible, which spreads subjects across the week. Refresh changes only the rotation order, so the schedule remains explainable and deterministic.

## Verify the scheduling engine

With Node.js installed, run:

```powershell
node --test scheduler.test.js
```

The checks cover the fixed grid, break/recess, lab pairs, theory placement, and input validation.
