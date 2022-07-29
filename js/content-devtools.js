(() => {
  const messageName = "update-data-layers";

  const createInjectionScript = (dataLayerNames, refreshInterval) => {
    const script = document.createElement("script");
    script.id = "simple-data-layer-viewer-live-helper";
    script.src = chrome.runtime.getURL("/js/inject-devtools.js");
    script.dataset.name = JSON.stringify(dataLayerNames);
    script.dataset.message = messageName;
    script.dataset.interval = refreshInterval;
    return script;
  };

  chrome.storage.sync.get(
    ["dataLayerNames", "refreshInterval"],
    ({ dataLayerNames, refreshInterval }) => {
      const script = createInjectionScript(dataLayerNames, refreshInterval);
      document.head.append(script);
    }
  );

  window.onmessage = (event) => {
    if (event.data.message === messageName) {
      chrome.runtime.sendMessage(event.data);
    }
  };
})();
