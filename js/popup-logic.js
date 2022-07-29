const state = {
  tab: null,
  index: 0,
  data: null,
  error: null,
  url: null,
  updateIndex(index) {
    this.index = index;
    setTabsClass();
    setSearchFocus();
  },
  updateData(data) {
    this.data = data;
    loadContent();
  },
  updateError(error) {
    this.error = error;
    loadError();
  },
};

chrome.storage.sync.get(
  ["windowWidth", "windowHeight", "textSize", "isNotified"],
  ({ windowWidth, windowHeight, textSize, isNotified }) => {
    if (chrome.runtime.lastError) {
      state.updateError(chrome.runtime.lastError);
    } else {
      createStyling(windowWidth, windowHeight, textSize);
      !isNotified && notifyUser();
    }
  }
);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "found-data-layers" && sender.tab.id === state.tab) {
    state.url = request.url;
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

const notifyUser = () => {
  const main = document.querySelector("#main");
  const notification = document.querySelector("#notification");
  notification.innerHTML = createNotification();
  main.style.minHeight = `${
    document.querySelector("#notification .message").offsetHeight + 120
  }px`;
  document.querySelectorAll(".notification-close").forEach((element) => {
    element.onclick = () => {
      notification.remove();
      chrome.storage.sync.set({
        isNotified: true,
      });
      main.style.minHeight = "unset";
    };
  });
};

const createStyling = (windowWidth, windowHeight, textSize) => {
  const width = !windowWidth ? `auto` : `${windowWidth}px`;
  const height = !windowHeight ? `auto` : `${windowHeight - 150}px`;
  const size = !textSize ? `0.9em` : `${textSize / 10}em`;
  const style = document.createElement("style");
  style.innerHTML = `
    html {
      width: ${width} !important;
    }
    #layers {
      height: ${height} !important;
    }
    #layers pre {
      font-size: ${size} !important;
    }`;
  document.head.appendChild(style);
};

const loadContent = () => {
  if (state.data.length) {
    loadLayerContent();
  } else {
    insertFailureContent();
  }
};

const loadError = () => {
  insertErrorContent();
};

const loadLayerContent = () => {
  insertTabsContainer();
  insertTabsHeader();
  insertTabsContent();
  insertTabsFooter();
};

const insertTabsContainer = () => {
  document.querySelector("#main").innerHTML = createTabsContainer();
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
  setTabsClass();
};

const createTabContentNode = (layer, index, scope = "all") => {
  const node = renderjson.set_icons("▼ ", "▲ ").set_show_to_level(scope)(
    JSON.parse(layer)
  );
  node.dataset.id = index;
  return node;
};

const setTabsClass = () => {
  document.querySelectorAll(`[data-id]`).forEach((element) => {
    if (parseInt(element.dataset.id) === state.index) {
      element.classList.add("is-active");
    } else {
      element.classList.remove("is-active");
    }
  });
};

const setSearchFocus = () => {
  document.querySelector("input.search").focus();
};

const insertTabsFooter = () => {
  document.querySelector("#footer").innerHTML = createFooter();
  loadTabsFooterEventListeners();
};

const insertFailureContent = () => {
  document.querySelector("#main").innerHTML = createFailure();
};

const insertErrorContent = () => {
  document.querySelector("#main").innerHTML = createError(state.error.message);
};

const collapseTabsContent = (collapse) => {
  const currentNode = document.querySelector("pre.is-active");
  const newNode = createTabContentNode(
    state.data[state.index].layer,
    currentNode.dataset.id,
    collapse
  );
  newNode.classList.add("is-active");
  document.querySelector("#layers").replaceChild(newNode, currentNode);
};

const loadTabsHeaderEventListeners = () => {
  document.querySelectorAll(".tabs li").forEach((li) => {
    li.onclick = (element) => {
      const index = parseInt(element.target.parentElement.dataset.id);
      state.updateIndex(index);
    };
  });
};

const loadTabsFooterEventListeners = () => {
  loadSearchEventListeners();

  document.querySelector("#collapse").onclick = () => {
    collapseTabsContent(0);
  };

  document.querySelector("#expand").onclick = () => {
    collapseTabsContent("all");
  };

  document.querySelector("#copy").onclick = () => {
    navigator.clipboard.writeText(state.data[state.index].layer);
  };

  document.querySelector("#tab").onclick = async () => {
    console.log(state.url);
    let tabId;
    await chrome.tabs.create(
      {
        active: false,
        url: "expand.html",
      },
      (tab) => {
        tabId = tab.id;
      }
    );
    const awaitTab = setInterval(async () => {
      const tab = await chrome.tabs.get(tabId);
      if (tab.status === "complete") {
        chrome.tabs.sendMessage(
          tabId,
          JSON.stringify({ data: state.data[state.index], url: state.url })
        );
        clearInterval(awaitTab);
        chrome.tabs.update(tabId, {
          active: true,
        });
      }
    }, 100);
  };
};

(() => {
  document.querySelector("#options").onclick = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL("options.html"));
    }
  };
})();
