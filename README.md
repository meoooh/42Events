# 42 Intra Chrome Extension

Enhance your experience on the [42 Intra Profile](https://profile-v3.intra.42.fr/) page with this Chrome extension.

![image](https://github.com/user-attachments/assets/78640749-f02d-4d2e-a3ac-9f08c14ed6cf)
![image](https://github.com/user-attachments/assets/1f509e24-349d-4de6-bb46-85cfd05e45d5)

## Installation

- **Chrome:** [Install from the Chrome Web Store](https://chromewebstore.google.com/detail/eaepeooggcmbngkdgoepncledkckjokl)
- **Firefox:** [Install from Firefox Add-ons](https://addons.mozilla.org/addon/42-events/)

### Manual installation for development

1. **Clone the repository**
```
git clone https://github.com/meoooh/42Events.git # copy & paste this
```

2. **Open Chrome Extensions page**
- Go to
	```
	chrome://extensions
	```
	in your Chrome browser.

3. **Enable Developer Mode**
- Turn on **Developer mode** in the top right corner.

4. **Load the extension**
- Click **Load unpacked**.
- Select the directory where you cloned this repository.
	> For detailed instructions, see the official Chrome documentation:
	> [Load an unpacked extension](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)

5. **Activate the extension**
- Visit [https://profile-v3.intra.42.fr/](https://profile-v3.intra.42.fr/)
- Refresh the page.

## Usage

- After installation, simply refresh your 42 profile page.
- The extension will automatically enhance your experience.
- Event times on the profile event list use your browser's local timezone.
- Open an event and select the calendar button to prepare a Google Calendar event. Review its details before saving; the extension does not save calendar entries automatically.
- An existing 42 account is required to access 42 Intra.

## Privacy

See the [42 Events privacy policy](PRIVACY.md) for local processing and the event details sent to Google Calendar when you choose a calendar link.

## Chrome Web Store package

Run `python3 scripts/package_chrome.py` to create the upload ZIP in `dist/`. The package contains the bundled extension files and omits Firefox-only manifest settings. The source manifest retains Firefox support.

## TODO

- [x] Firefox support - [https://addons.mozilla.org/addon/42-events](https://addons.mozilla.org/addon/42-events/)
- [ ] Safari support
- [ ] Brave support
- [ ] Mobile browser
- [ ] Download ICS
- [ ] Support [/events](https://profile.intra.42.fr/events) page
- [x] Publish in the [Chrome Web Store](https://chromewebstore.google.com/detail/eaepeooggcmbngkdgoepncledkckjokl)

## Support

If you encounter any issues or have suggestions, please [open an issue](https://github.com/meoooh/42Events/issues/new) in this repository. or contact [me](https://profile-v3.intra.42.fr/users/hangkim)

---

**Enjoy your enhanced 42 Intra profile!**
