const state = {
  url: null,
  index: null,
  data: {},
  updateData() {
    setTitle();
    setURL();
    setLayerContent();
  },
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "expand-data-layer") {
    const { data, url } = request.data;
    state.url = url;
    state.index = data.name;
    state.data = data.layer;
    state.updateData();
  }
});

const setTitle = () => {
  document.title = `${state.index} - Snapshot`;
};

const setURL = () => {
  document.querySelector("#url").innerHTML = state.url;
};

const setLayerContent = () => {
  const node = createTabContentNode(state.index, state.data, "all");
  node.classList.add("is-active");
  document.querySelector("#layers").append(node);
};

const createTabContentNode = (name, data, scope = "all") => {
  const node = renderjson.set_icons("▼ ", "▲ ").set_show_to_level(scope)(
    JSON.parse(data)
  );
  node.dataset.name = name;
  node.dataset.scope = scope;
  return node;
};

(() => {
  utils.loadSearchFunctionality();

  const collapseTabsContent = (collapse) => {
    const currentNode = document.querySelector("pre.is-active");
    const newNode = createTabContentNode(state.index, state.data, collapse);
    newNode.classList.add("is-active");
    document.querySelector("#layers").replaceChild(newNode, currentNode);
  };

  document.querySelector("#collapse").onclick = () => {
    collapseTabsContent(0);
  };

  document.querySelector("#expand").onclick = () => {
    collapseTabsContent("all");
  };

  document.querySelector("#copy").onclick = () => {
    utils.copyToClipboard(state.data);
  };
})();
