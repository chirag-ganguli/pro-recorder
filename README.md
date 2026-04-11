<div align="center">

# 🎬 Pro Recorder

**A highly optimized, direct-to-disk screen and meeting recorder.**

[![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows-lightgrey?style=flat-square)](#)
[![Built with Electron](https://img.shields.io/badge/Built_with-Electron-47848f?style=flat-square&logo=electron&logoColor=white)](#)
[![FFmpeg](https://img.shields.io/badge/Powered_by-FFmpeg-22A559?style=flat-square&logo=ffmpeg&logoColor=white)](#)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg?style=flat-square)](#)

</div>

## 🚀 Overview

Pro Recorder is an Electron-based desktop utility designed specifically for recording marathon, multi-hour meetings (Teams, Webex, Zoom) without crashing your computer. 

Unlike standard web-based recorders that store video data in temporary memory (RAM) and eventually crash, Pro Recorder streams video **directly to your hard drive in 1-second chunks**. It also features a built-in FFmpeg engine to instantly convert recordings for cross-device compatibility.

## ✨ Features

* **💾 Memory-Safe Direct-to-Disk Recording:** Never lose a 4-hour meeting recording to a RAM limit crash again.
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

*Note: Because this is an indie open-source app, it is not currently code-signed with paid certificates. Your operating system may show a security warning upon first launch:*
* *__Windows Users__: If you see a blue "Windows protected your PC" screen, click **More info** -> **Run anyway**.*
* *__Mac Users__: If it says the app cannot be opened because the developer cannot be verified, **Right-click** the app icon and select **Open**.*

---

## ⚙️ Operating System Permissions

Due to modern OS privacy features, you must grant the app permission to record your screen and audio.

### 🍎 macOS Users
1. Go to **System Settings > Privacy & Security**.
2. Under **Screen Recording**, toggle ON the switch for Pro Recorder.
3. Repeat this exact step for **Microphone**.
4. **Restart the app completely** for permissions to take effect.
> **Note on System Audio:** To record the voices of others in a meeting, Apple requires a virtual audio cable. Install a free tool like [BlackHole](https://existential.audio/blackhole/). Create a "Multi-Output Device" in your Mac's Audio MIDI Setup containing your headphones + BlackHole, and select BlackHole from the app's audio dropdown.

### 🪟 Windows Users
1. Go to **Settings > Privacy & security**.
2. Under App permissions, ensure "Let desktop apps access your camera/screen" and "Microphone" are turned **ON**.

---

## ⚖️ Legal Disclaimer & Notice

**Notice to Users:** Recording conversations, meetings, or screens without the explicit consent of all participants may be illegal in your jurisdiction. 

* **Consent:** It is your sole responsibility to notify all parties that they are being recorded and to obtain necessary consent.
* **Liability:** The developers of Pro Recorder take no responsibility for any unauthorized or illegal recordings made using this software. By using this application, you agree to comply with all local and international privacy laws.

---

## 📝 License

This project is licensed under the **GNU General Public License v3.0**. See the [LICENSE](LICENSE) file for details.