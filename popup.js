"use strict";

const prefix = "page:";
const byId = id => document.getElementById(id);
const list = byId("links");
const status = byId("status");
const save = byId("save");
let archiveView = false;
let pages = [];

function webUrl(value) {
  try {
    const url = new URL(value);
    if ((url.protocol === "http:" || url.protocol === "https:") && !url.username && !url.password) return url;
  } catch {
    // Chrome may omit the URL when the tab doesn't grant access.
  }
  return null;
}

function render() {
  const query = byId("search").value.trim().toLowerCase();
  const archived = pages.filter(page => page.archived).length;
  byId("queue-count").textContent = pages.length - archived;
  byId("archive-count").textContent = archived;
  byId("queue").setAttribute("aria-pressed", String(!archiveView));
  byId("archive").setAttribute("aria-pressed", String(archiveView));
  const visible = pages.filter(page => page.archived === archiveView &&
    (page.title.toLowerCase().includes(query) || page.url.toLowerCase().includes(query)));
  list.replaceChildren();
  for (const page of visible) {
    const row = document.createElement("li");
    row.className = "row";
    const text = document.createElement("div");
    const link = document.createElement("a");
    link.href = page.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = page.title;
    const domain = document.createElement("p");
    domain.className = "domain";
    domain.textContent = new URL(page.url).hostname;
    text.append(link, domain);
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.textContent = archiveView ? "Restore" : "Archive";
    toggle.setAttribute("aria-label", `${toggle.textContent} ${page.title}`);
    toggle.onclick = async () => {
      toggle.disabled = true;
      try {
        await chrome.storage.local.set({ [prefix + page.url]: { ...page, archived: !page.archived } });
        await reload();
        status.textContent = page.archived ? "Restored to your reading queue." : "Page archived.";
      } catch {
        status.textContent = "Could not update this page. Try again.";
      } finally {
        toggle.disabled = false;
      }
    };
    row.append(text, toggle);
    list.append(row);
  }
  const empty = byId("empty");
  empty.hidden = visible.length > 0;
  empty.textContent = query ? "No pages match your search." :
    archiveView ? "Your archive is empty." : "Save a page to start your reading queue.";
}

async function reload() {
  const saved = await chrome.storage.local.get(null);
  pages = Object.entries(saved)
    .filter(([key, page]) => key.startsWith(prefix) && page && key === prefix + page.url &&
      webUrl(page.url) && typeof page.title === "string" && typeof page.archived === "boolean")
    .map(([, page]) => page)
    .sort((a, b) => b.savedAt - a.savedAt);
  render();
}

save.onclick = async () => {
  save.disabled = true;
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const url = webUrl(tab?.url);
    if (!url) {
      status.textContent = "Open a regular web page, then try saving it.";
      return;
    }
    const key = prefix + url.href;
    const previous = (await chrome.storage.local.get(key))[key];
    if (previous && !previous.archived) {
      status.textContent = "This page is already on your shelf.";
      return;
    }
    await chrome.storage.local.set({ [key]: {
      url: url.href, title: tab.title?.trim() || url.hostname, savedAt: Date.now(), archived: false,
    } });
    archiveView = false;
    byId("search").value = "";
    await reload();
    status.textContent = previous ? "Restored to your reading queue." : "Page saved.";
  } catch {
    status.textContent = "Could not save this page. Try again.";
  } finally {
    save.disabled = false;
  }
};

byId("search").addEventListener("input", render);
byId("queue").onclick = () => { archiveView = false; render(); };
byId("archive").onclick = () => { archiveView = true; render(); };
reload().then(() => { save.disabled = false; }).catch(() => {
  status.textContent = "Could not read your saved pages.";
});
