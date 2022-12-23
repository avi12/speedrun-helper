import type { PlasmoContentScript } from "plasmo";

export const config: PlasmoContentScript = {
  matches: ["https://www.speedrun.com/*"],
  include_globs: ["https://www.speedrun.com/modhub"]
};

function injectStyles(): void {
  const elLink = document.createElement("link");
  elLink.rel = "stylesheet";
  elLink.href = chrome.runtime.getURL("style.css");
  document.head.append(elLink);
}

function getVideoId(elVideo: HTMLIFrameElement): string {
  return elVideo.src.match(/\/embed\/([^?]+\??)/)[1];
}

function getBst(videoId: string): HTMLIFrameElement {
  const elBst = document.createElement("iframe");
  elBst.src = `https://noobjsperson.github.io/speedrun-timer/new_run.html?id=${videoId}&type=y`;
  elBst.classList.add("iframe-bst");
  return elBst;
}

function injectBst(): void {
  new MutationObserver(() => {
    [...document.querySelectorAll(".ticket-metadata")].forEach(elSpeedrunSection => {
      const elVideo = elSpeedrunSection.querySelector<HTMLIFrameElement>("iframe[src*='youtube']");
      const videoId = getVideoId(elVideo);
      const elVideoContainer = elVideo.closest(".metadata-container");
      elVideoContainer.remove();
      elSpeedrunSection.prepend(getBst(videoId));
    });
  }).observe(getContentColumn(), { subtree: true, childList: true });
}

function getContentColumn(): HTMLDivElement {
  return document.querySelector(".content-column");
}

function prepareToInjectBst(): void {
  new MutationObserver((_, observer) => {
    if (getContentColumn()) {
      observer.disconnect();
      injectBst();
    }
  }).observe(document, { subtree: true, childList: true });
}

function init(): void {
  injectStyles();
  prepareToInjectBst();
}

init();
