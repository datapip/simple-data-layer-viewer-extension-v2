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
      windowHeight = 600,
      textSize = 9,
      refreshInterval = 250,
      isNotified = true;

    chrome.storage.sync.set({
      dataLayerNames,
      windowWidth,
      windowHeight,
      textSize,
      refreshInterval,
      isNotified,
    });

    chrome.storage.sync.set({
      defaults: {
        dataLayerNames,
        windowWidth,
        windowHeight,
        refreshInterval,
        textSize,
      },
    });
  });
})();
