(() => {
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

  const foundDataLayers = [];

  dataLayerNames.forEach((dataLayerName) => {
    const dataLayerData = referenceDataLayerFromWindow(dataLayerName);
    if (typeof dataLayerData === "object")
      pushToFoundDataLayers(dataLayerName, dataLayerData);
  });

  window.postMessage({ message: "found-data-layers", data: foundDataLayers });
})();
