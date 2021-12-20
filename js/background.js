(() => {
  chrome.runtime.onInstalled.addListener(() => {
    const dataLayerNames = [
        "dataLayer",
        "digitalData",
        "utag_data",
        "tc_vars",
        "udo",
      ],
      windowWidth = 500,
      textSize = 8;

    chrome.storage.sync.set({
      dataLayerNames,
      windowWidth,
      textSize,
    });
  });
})();
