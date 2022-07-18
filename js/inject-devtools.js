(() => {
  const script = document.getElementById(
    "simple-data-layer-viewer-live-helper"
  );
  const dataLayerNames = JSON.parse(script.dataset.name);
  const messageName = script.dataset.message;
  const refreshInterval = parseInt(script.dataset.interval);
  const foundDataLayers = {};

  const referenceDataLayerFromWindow = (dataLayerName) => {
    return dataLayerName.split(".").reduce((accumulator, currentValue) => {
      return accumulator[currentValue];
    }, window);
  };

  setInterval(() => {
    let updateFound = false;
    const updatedDataLayers = {};
    dataLayerNames.forEach((dataLayerName) => {
      const dataLayerData = referenceDataLayerFromWindow(dataLayerName);
      const stringifiedDataLayerData = JSON.stringify(dataLayerData);
      if (
        typeof dataLayerData === "object" &&
        stringifiedDataLayerData !== foundDataLayers[dataLayerName]
      ) {
        foundDataLayers[dataLayerName] = stringifiedDataLayerData;
        updatedDataLayers[dataLayerName] = stringifiedDataLayerData;
        updateFound = true;
      }
    });
    if (updateFound) {
      window.postMessage({ message: messageName, data: updatedDataLayers });
    }
  }, refreshInterval);
})();
