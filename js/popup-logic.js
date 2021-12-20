/**
 * Main
 */

const state = {
  tab: null,
  index: 0,
  data: null,
  size: null,
  error: null,
  updateData(data) {
    this.data = data;
    data.length ? loadSuccessContent() : loadFailureContent();
  },
  updateSize(size) {
    this.size = size;
    updateSizeOfPreElements();
  },
  setError(error) {
    this.error = error;
    loadFailureContent();
  },
};

chrome.storage.sync.get(
  ["windowWidth", "textSize"],
  ({ windowWidth, textSize }) => {
    document.querySelector("html").style.width =
      getTransformedWindowWith(windowWidth);
    state.size = textSize;
  }
);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "found-data-layers" && sender.tab.id === state.tab) {
    console.log(request.data);
    state.updateData(request.data);
  }
});

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const [tab] = tabs;
  state.tab = tab.id;
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      files: ["/js/content.js"],
    },
    () => {
      if (chrome.runtime.lastError) {
        state.setError(chrome.runtime.lastError);
      }
    }
  );
});

/**
 * Functions
 */

const loadSuccessContent = () => {
  loadContainer();
  loadTabsHeader();
  loadTabsContent();
  updateSizeOfPreElements();
  loadTabFooter();
};

const loadFailureContent = () => {
  loadContainer();
  loadErrorContent();
};

const loadContainer = () => {
  document.querySelector("#container").innerHTML = createContainer();
  loadContainerEventListeners();
};

const loadContainerEventListeners = () => {
  document.querySelector("#options").onclick = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL("options.html"));
    }
  };
};

const loadTabsHeader = () => {
  document.querySelector("#tabs").innerHTML = createTabsHeader(state.data);
  loadTabsHeaderEventListeners();
};

const loadTabsHeaderEventListeners = () => {
  document.querySelectorAll(".tabs li").forEach((li) => {
    li.onclick = (element) => {
      state.index = parseInt(element.target.parentElement.dataset.id);
      loadTabVisibility(state.index);
    };
  });
};

const loadTabsContent = () => {
  state.data.map((data, index) => {
    const node = createTabContentNode(data.layer, index);
    document.querySelector("#layers").appendChild(node);
  });
  loadTabVisibility();
};

const createTabContentNode = (layer, index, scope = "all") => {
  const node = renderjson.set_icons("▼ ", "▲ ").set_show_to_level(scope)(
    JSON.parse(layer)
  );
  node.dataset.id = index;
  return node;
};

const loadTabVisibility = () => {
  document.querySelectorAll(`[data-id]`).forEach((element) => {
    if (parseInt(element.dataset.id) === state.index) {
      element.classList.add("is-active");
    } else {
      element.classList.remove("is-active");
    }
  });
};

const loadTabFooter = () => {
  document.querySelector("#footer").innerHTML = createFooter();
  loadTabFooterEventListeners();
};

const loadTabFooterEventListeners = () => {
  loadSearchEventListeners();

  document.querySelector("#collapse").onclick = () => {
    const currentNode = document.querySelector("pre.is-active");
    const tabContentContainer = document.querySelector("#layers");
    const newNode = createTabContentNode(
      state.data[state.index].layer,
      currentNode.dataset.id,
      0
    );
    newNode.classList.add("is-active");
    tabContentContainer.insertBefore(newNode, currentNode);
    currentNode.remove();
  };

  document.querySelector("#expand").onclick = () => {
    const currentNode = document.querySelector("pre.is-active");
    const tabContentContainer = document.querySelector("#layers");
    const newNode = createTabContentNode(
      state.data[state.index].layer,
      currentNode.dataset.id,
      "all"
    );
    newNode.classList.add("is-active");
    tabContentContainer.insertBefore(newNode, currentNode);
    currentNode.remove();
  };

  document.querySelector("#copy").onclick = () => {
    navigator.clipboard.writeText(state.data[state.index].layer);
  };

  document.querySelector("#increase").onclick = () => {
    if (state.size <= 14) state.updateSize(++state.size);
  };

  document.querySelector("#decrease").onclick = () => {
    if (state.size >= 2) state.updateSize(--state.size);
  };
};

const updateSizeOfPreElements = () => {
  document.querySelectorAll("pre").forEach((pre) => {
    pre.style.fontSize = getTransformedTextSize();
  });
};

const loadErrorContent = () => {
  document.querySelector("div.card-content").innerHTML = createError(
    state.error
  );
};

const getTransformedWindowWith = (width) => {
  if (!width) {
    return `auto`;
  } else {
    return `${width}px`;
  }
};

const getTransformedTextSize = () => {
  return `${state.size / 10}em`;
};
