const state = {
  url: null,
  id: null,
  data: {},
  updateData() {
    setTitle();
    setURL();
    setLayerContent();
  },
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "expand-data-layer") {
    const { id, data, url } = request.data;
    state.url = url;
    state.id = id;
    state.data = data;
    state.updateData();
  }
});

const setTitle = () => {
  document.title = `${state.id} - Snapshot`;
};

const setURL = () => {
  document.querySelector("#url").innerHTML = state.url;
};

const setLayerContent = () => {
  const node = utils.createLayerNode(state.id, state.data, "all");
  node.classList.add("is-active");
  document.querySelector("#layers").append(node);
};

(() => {
  utils.loadSearchFunctionality();

  document.querySelector("#collapse").onclick = () => {
    utils.collapseLayerContent(state.id, state.data, "0");
  };

  document.querySelector("#expand").onclick = () => {
    utils.collapseLayerContent(state.id, state.data, "all");
  };

  document.querySelector("#copy").onclick = () => {
    utils.copyToClipboard(state.data);
  };
})();
