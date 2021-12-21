(() => {
  window.onmessage = (event) => {
    if (event.data.message === "found-data-layers") {
      chrome.runtime.sendMessage(event.data);
    }
  };

  const createInjectionScript = (dataLayerNames) => {
    const script = document.createElement("script");
    script.id = "simple-data-layer-viewer-helper";
    script.src = chrome.runtime.getURL("/js/inject.js");
    script.dataset.name = JSON.stringify(dataLayerNames);
    script.onload = () => {
      document.querySelector(`#${script.id}`).remove();
    };
    return script;
  };

  chrome.storage.sync.get("dataLayerNames", ({ dataLayerNames }) => {
    const script = createInjectionScript(dataLayerNames);
    document.head.append(script);
  });
})();
