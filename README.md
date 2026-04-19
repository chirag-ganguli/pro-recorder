<div align="center">

# 🎬 Pro Recorder

**A highly optimized, direct-to-disk screen recorder.**

[![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows-lightgrey?style=flat-square)](#)
[![Built with Electron](https://img.shields.io/badge/Built_with-Electron-47848f?style=flat-square&logo=electron&logoColor=white)](#)
[![FFmpeg](https://img.shields.io/badge/Powered_by-FFmpeg-22A559?style=flat-square&logo=ffmpeg&logoColor=white)](#)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg?style=flat-square)](#)

</div>

## 🚀 Overview

Pro Recorder is an Electron-based desktop utility designed specifically for recording marathon, multi-hour sessions without crashing your computer. 

Unlike standard web-based recorders that store video data in temporary memory (RAM) and eventually crash, Pro Recorder streams video **directly to your hard drive in 1-second chunks**. It also features a built-in FFmpeg engine to instantly convert recordings for cross-device compatibility.

## ✨ Features

* **💾 Memory-Safe Direct-to-Disk Recording:** Never lose a 4-hour recording to a RAM limit crash again.
* **🎯 Precision Capture:** Select specific application windows or entire monitors. Categorized neatly in the UI.
* **🎙️ Advanced Audio Routing:** Capture any connected microphone, or route internal system audio.
* **🎞️ Built-in FFmpeg Converter:** Convert native `.webm` recordings to `.mp4` entirely locally.
  * **⚡ Fast Mode:** Near-instant conversion for web, Windows, and VLC.
  * **🍏 Mac-Compatible Mode:** Full H.264 re-encoding for native QuickTime and iPhone playback.
* **📈 Live Progress UI:** Real-time progress bars and time-conversion tracking.
* **📂 Standalone Converter Utility:** Select and convert older `.webm` files you have sitting on your hard drive.

---

## 📥 How to Download & Install

You do not need to build this app from source. Pre-compiled, ready-to-run installers are generated automatically.

1. Go to the **[Releases](../../releases)** page on the right side of this repository.
2. Click on the latest release version (e.g., `v1.0.0`).
3. Download the correct file for your operating system:
   * **Windows:** Download the `.exe` file.
   * **macOS:** Download the `.zip` or `.dmg` file.

*Note: Because this is an indie open-source app, it is not currently code-signed with paid certificates. Your operating system may show a security warning upon first launch.*

### 🍎 macOS: Fixing the "Damaged" App Error

When you download and open the Mac app, you may see:
> **"Pro Recorder" is damaged and can't be opened. You should move it to the Trash.**

This is because the app is not code-signed with an Apple Developer certificate. Here are three ways to fix it:

#### **Solution 1: Quick Fix (Right-Click & Open)** ✨ Easiest
1. Right-click (or `Ctrl+Click`) the `Pro Recorder.app` in Finder
2. Select **"Open"** from the menu
3. Click **"Open"** when the security dialog appears
4. The app will launch and works normally from then on!

#### **Solution 2: Terminal Command**
Open Terminal and run:
```bash
xattr -cr ~/Applications/Pro\ Recorder.app
```
Then double-click to launch normally.

#### **Solution 3: Remove Code Signature**
If the above don't work, open Terminal and run:
```bash
rm -rf ~/Downloads/Pro\ Recorder.app/Contents/_CodeSignature
open ~/Downloads/Pro\ Recorder.app
```

### 🪟 Windows Users
If you see a blue "Windows protected your PC" screen, click **More info** → **Run anyway**.

---

## ⚙️ Operating System Permissions

Due to modern OS privacy features, you must grant the app permission to record your screen and audio.

### 🍎 macOS Permissions
1. Go to **System Settings > Privacy & Security**.
2. Under **Screen Recording**, toggle ON the switch for Pro Recorder.
3. Repeat this exact step for **Microphone**.
4. **Restart the app completely** for permissions to take effect.
> **Note on System Audio:** To record the voices of others, Apple requires a virtual audio cable. Install a free tool like [BlackHole](https://existential.audio/blackhole/). Create a "Multi-Output Device" in your Mac's Audio MIDI Setup containing your headphones + BlackHole, and select BlackHole from the app's audio dropdown.

#### Here's the entire phase-wise setup process for Mac users:
**Phase 1: Create the Multi-Output Device (For Hearing & Routing)**
This step ensures that the audio from your Applications goes to your physical speakers (so you hear it) and to BlackHole (so your recording app can hear it).

1. Open the Audio MIDI Setup app. (The easiest way is to press Command + Space, type "Audio MIDI Setup", and hit Enter).
2. Click the small + (plus) button in the bottom-left corner of the window.
3. Select Create Multi-Output Device.
4. In the list of audio devices on the right, check the Use box for your MacBook Pro Speakers (or headphones, if you use them).
5. Check the Use box for BlackHole 2ch.
6. *Important:* Look at the "Master Device" dropdown at the top. Set it to your MacBook Pro Speakers.
7. Check the Drift Correction box next to BlackHole 2ch. (This keeps the audio perfectly synced).
8. Optional but recommended: Double-click the name "Multi-Output Device" in the left sidebar and rename it to something like "Meet Output".

**Phase 2: Create the Aggregate Device (For Recording)**
This step combines your physical microphone and the BlackHole system audio into one single "virtual microphone" that your screen recorder can use.

1. Still in Audio MIDI Setup, click the + (plus) button in the bottom-left corner again.
2. Select Create Aggregate Device.
3. In the device list on the right, check the Use box for your MacBook Pro Microphone.
4. Check the Use box for BlackHole 2ch.
5. Check the Drift Correction box next to BlackHole 2ch.
6. Double-click the name "Aggregate Device" in the left sidebar and rename it to something like "Recording Mic + System".

**Phase 3: Configure Your System and Apps**
Now that the virtual wiring is built, you just need to tell your Mac and your apps to use it.

1. Mac System Settings

- Open your Mac's System Settings > Sound.
- Under the Output tab, select the Multi-Output device you created in Phase 1 ("Meet Output").

(Note: You won't be able to change your Mac's volume using the keyboard keys while this is selected. Set your volume to a comfortable level before switching, or use a tool to manage it).

2. Application Settings

- Click the three dots inside your Application > Settings > Audio.
- Set the Microphone to your MacBook Pro Microphone. (Critical: Do not set this to BlackHole or the Aggregate device, or everyone will hear an echo).
- Set the Speakers to either "Default" or explicitly select your Multi-Output device ("Meet Output").

3. Your Screen Recording Software (QuickTime, OBS, etc.)

- Open your recording app.
- Find the audio input or microphone selection for your recording.
- Select the Aggregate Device you created in Phase 2 ("Recording Mic + System").

---


### 🪟 Windows Permissions
1. Go to **Settings > Privacy & security**.
2. Under App permissions, ensure "Let desktop apps access your camera/screen" and "Microphone" are turned **ON**.

---

## ⚖️ Legal Disclaimer & Notice

**Notice to Users:** Recording conversations or screens without the explicit consent of all participants may be illegal in your jurisdiction. 

* **Consent:** It is your sole responsibility to notify all parties that they are being recorded and to obtain necessary consent.
* **Liability:** The developers of Pro Recorder take no responsibility for any unauthorized or illegal recordings made using this software. By using this application, you agree to comply with all local and international privacy laws.

---

## 📝 License

This project is licensed under the **GNU General Public License v3.0**. See the [LICENSE](LICENSE) file for details.