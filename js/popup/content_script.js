(() => {
  const messageName = "found-data-layers";

  const createInjectionScript = (dataLayerNames) => {
    const script = document.createElement("script");
    script.id = "simple-data-layer-viewer-helper";
    script.src = chrome.runtime.getURL("/js/popup/inject_script.js");
    script.dataset.name = JSON.stringify(dataLayerNames);
    script.dataset.message = messageName;
    script.onload = () => {
      document.querySelector(`#${script.id}`).remove();
    };
    return script;
  };

  chrome.storage.sync.get("dataLayerNames", ({ dataLayerNames }) => {
    const script = createInjectionScript(dataLayerNames);
    document.head.append(script);
  });

  window.onmessage = (event) => {
    if (event.data.message === messageName) {
      chrome.runtime.sendMessage(event.data);
    }
  };
})();
