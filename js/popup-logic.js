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
    data.length ? loadTabsContent() : loadFailureContent();
  },
  updateSize(size) {
    this.size = size;
    updateTabsTextSize();
  },
  updateError(error) {
    this.error = error;
    loadFailureContent();
  },
};

chrome.storage.sync.get(
  ["windowWidth", "textSize"],
  ({ windowWidth, textSize }) => {
    if (chrome.runtime.lastError) {
      state.updateError(chrome.runtime.lastError);
    } else {
      state.width = windowWidth;
      state.size = textSize;
    }
  }
);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "found-data-layers" && sender.tab.id === state.tab) {
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
        state.updateError(chrome.runtime.lastError);
      }
    }
  );
});

/**
 * Functions
 */

const loadTabsContent = () => {
  insertContainer();
  insertTabsHeader();
  insertTabsContent();
  insertTabsFooter();
};

const loadFailureContent = () => {
  insertContainer();
  insertFailureContent();
};

const insertContainer = () => {
  document.querySelector("html").style.width = getTransformedWindowWith();
  document.querySelector("#container").innerHTML = createContainer();
  loadContainerEventListeners();
};

const insertTabsHeader = () => {
  document.querySelector("#tabs").innerHTML = createTabsHeader(state.data);
  loadTabsHeaderEventListeners();
};

const insertTabsContent = () => {
  state.data.map((data, index) => {
    const node = createTabContentNode(data.layer, index);
    document.querySelector("#layers").appendChild(node);
  });
  updateTabsTextSize();
  handleTabsClasses();
};

const createTabContentNode = (layer, index, scope = "all") => {
  const node = renderjson.set_icons("▼ ", "▲ ").set_show_to_level(scope)(
    JSON.parse(layer)
  );
  node.dataset.id = index;
  return node;
};

const handleTabsClasses = () => {
  document.querySelectorAll(`[data-id]`).forEach((element) => {
    if (parseInt(element.dataset.id) === state.index) {
      element.classList.add("is-active");
    } else {
      element.classList.remove("is-active");
    }
  });
};

const insertTabsFooter = () => {
  document.querySelector("#footer").innerHTML = createFooter();
  loadTabsFooterEventListeners();
};

const updateTabsTextSize = () => {
  document.querySelectorAll("pre").forEach((pre) => {
    pre.style.fontSize = getTransformedTextSize();
  });
};

const insertFailureContent = () => {
  document.querySelector("div.card-content").innerHTML = createError(
    state.error
  );
};

const getTransformedWindowWith = () => {
  if (!state.width) {
    return `auto`;
  } else {
    return `${state.width}px`;
  }
};

const getTransformedTextSize = () => {
  return `${state.size / 10}em`;
};

/**
 * Event Listeners
 */

const loadContainerEventListeners = () => {
  document.querySelector("#options").onclick = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL("options.html"));
    }
  };
};

const loadTabsHeaderEventListeners = () => {
  document.querySelectorAll(".tabs li").forEach((li) => {
    li.onclick = (element) => {
      state.index = parseInt(element.target.parentElement.dataset.id);
      handleTabsClasses(state.index);
    };
  });
};

const loadTabsFooterEventListeners = () => {
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
