(() => {
  const stringify = (dataLayerData) => {
    let cache = [];
    let str = JSON.stringify(dataLayerData, function (key, value) {
      if (typeof value === "object" && value !== null) {
        if (cache.indexOf(value) !== -1 || value instanceof Node) {
          return;
        }
        cache.push(value);
      }
      return value;
    });
    cache = null;
    return str;
  };

  const referenceDataLayerFromWindow = (dataLayerName) => {
    return dataLayerName.split(".").reduce((accumulator, currentValue) => {
      return accumulator[currentValue];
    }, window);
  };

  const pushToFoundDataLayers = (dataLayerName, dataLayerData) => {
    foundDataLayers.push({
      name: dataLayerName,
      layer: JSON.stringify(dataLayerData),
    });
  };

  const dataLayerNames = JSON.parse(
    document.getElementById("simple-data-layer-viewer-helper").dataset.name
  );

  const messageName = document.getElementById("simple-data-layer-viewer-helper")
    .dataset.message;

  const foundDataLayers = {};

  dataLayerNames.forEach((dataLayerName) => {
    const dataLayerData = referenceDataLayerFromWindow(dataLayerName);
    const stringifiedDataLayerData = stringify(dataLayerData);
    if (typeof dataLayerData === "object")
      foundDataLayers[dataLayerName] = stringifiedDataLayerData;
  });

  window.postMessage({
    message: messageName,
    data: foundDataLayers,
    url: document.location.href,
  });
})();
