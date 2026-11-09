# Pocket Shelf

A Chrome extension for pages you want to read later. Save the current page, search titles and addresses, and archive finished links. Restore archived links whenever you want to read them again.

## Load in Chrome

1. Open `chrome://extensions`.
2. Turn on **Developer mode**.
3. Select **Load unpacked** and choose this folder, the one containing `manifest.json`.
4. Open a web page, click **Pocket Shelf** in the extensions menu, then choose **Save current page**. You can pin the extension to keep it in your toolbar.

Saved pages stay in this Chrome profile using `chrome.storage.local`. Removing the extension also removes its stored queue. The `activeTab` permission supplies the current page’s title and address when you open the extension. Pocket Shelf stores links locally. [Chrome’s activeTab guide](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab) · [Chrome’s storage documentation](https://developer.chrome.com/docs/extensions/reference/api/storage)

## More extension ideas

| Idea | What it would do |
| --- | --- |
| Tab Snapshot | Save and restore a set of tabs for a task, class, or research session. |
| Copy as Citation | Copy a page’s title, URL, and access date as Markdown. |
| Page Notes | Keep private notes attached to a page URL, with search across notes. |
| Link Cleaner | Remove recognized tracking parameters before copying a link. |
| Focus Pass | Set a time budget for sites you choose and display how much time is left. |
| Price Notes | Record a product price and date by hand and compare with earlier entries. |
