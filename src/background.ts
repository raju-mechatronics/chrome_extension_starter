console.log("background script loaded");

chrome.tabs.query({ url: "https://studio.youtube.com/*" }, (tabs) => {
  if (tabs.length === 0) {
    return;
  }
  for (const tab of tabs) {
    chrome.tabs.reload(tab?.id!);
  }
});
