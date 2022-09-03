const state = {
  init: false,
  refresh: true,
  tab: null,
  id: null,
  data: {},
  error: null,
  updateId(id) {
    this.id = id;
    setTabsClass();
  },
  updateData(data) {
    if (this.init) {
      this.data = Object.assign(this.data, data);
      this.refresh && updateLayerContent(data);
    } else {
      this.data = data;
      this.id = Object.keys(data)[0];
      this.refresh && initialLayerContent();
    }
  },
  updateError(error) {
    this.error = error;
    insertErrorContent();
  },
};

chrome.storage.sync.get(["textSize"], ({ textSize }) => {
  if (chrome.runtime.lastError) {
    state.updateError(chrome.runtime.lastError);
  } else {
    createStyling(textSize);
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "update-data-layers" && sender.tab.id === state.tab) {
    console.log("----- panel", request);
    state.updateData(request.data);
  }
});

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const [tab] = tabs;
  state.tab = tab.id;
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      files: ["/js/panel/content_script.js"],
    },
    () => {
      if (chrome.runtime.lastError) {
        state.updateError(chrome.runtime.lastError);
      }
    }
  );
});

chrome.devtools.network.onNavigated.addListener(() => {
  location.reload();
});

const createStyling = (textSize) => {
  const size = !textSize ? `0.9em` : `${textSize / 10}em`;
  const style = document.createElement("style");
  style.innerHTML = `
        #layers pre {
          font-size: ${size} !important;
        }`;
  document.head.appendChild(style);
};

const initialLayerContent = () => {
  insertRefreshButtons();
  insertTabsContainer();
  insertTabsHeader();
  insertTabsContent();
  insertTabsFooter();
  state.init = true;
};

const updateLayerContent = (data = state.data) => {
  for (let [id, layer] of Object.entries(data)) {
    const current = document.querySelector(`pre[data-id='${id}']`);
    if (!current) return createSpecificLayerContent(id, layer);
    const scope = current.dataset.scope === "0" ? 0 : "all";
    const updated = utils.createLayerNode(id, layer, scope);
    updated.classList = current.classList;
    document.querySelector("#layers").replaceChild(updated, current);
    const circle = document.querySelector(`a[data-id="${id}"] span`);
    circle.classList.add("updated");
    setTimeout(() => {
      circle.classList.remove("updated");
    }, 250);
  }
};

const createSpecificLayerContent = (id, layer) => {
  insertTabHeader(id);
  insertTabContent(id, layer);
  loadTabsHeaderEventListeners();
};

const insertRefreshButtons = () => {
  document.querySelector("#refresh").innerHTML = createRefreshButtons();
  loadAutoRefreshEventListeners();
};

const insertTabsContainer = () => {
  document.querySelector("#main").innerHTML = createTabsContainer();
};

const insertTabsHeader = () => {
  for (let id of Object.keys(state.data)) {
    insertTabHeader(id);
  }
  loadTabsHeaderEventListeners();
};

const insertTabHeader = (id) => {
  const node = createTabHeaderNode(id);
  document.querySelector("#tabs").appendChild(node);
};

const createTabHeaderNode = (id) => {
  const node = document.createElement("li");
  node.innerHTML = `<a data-id="${id}">${id}<span class="is-circle"></span></a>`;
  node.dataset.id = id;
  return node;
};

const insertTabsContent = () => {
  for (let [id, data] of Object.entries(state.data)) {
    insertTabContent(id, data);
  }
  setTabsClass();
};

const insertTabContent = (id, data) => {
  const node = utils.createLayerNode(id, data);
  document.querySelector("#layers").appendChild(node);
};

const setTabsClass = () => {
  document.querySelectorAll(`li[data-id],pre[data-id]`).forEach((tab) => {
    if (tab.dataset.id === state.id) {
      tab.classList.add("is-active");
    } else {
      tab.classList.remove("is-active");
    }
  });
};

const insertTabsFooter = () => {
  document.querySelector("#footer").innerHTML = createFooter();
  loadTabsFooterEventListeners();
};

const insertErrorContent = () => {
  document.querySelector("#main").innerHTML = createError(state.error.message);
};

const loadAutoRefreshEventListeners = () => {
  const pause = document.querySelector("#pause");
  const resume = document.querySelector("#resume");
  pause.onclick = () => {
    state.refresh = false;
    pause.classList.add("is-hidden");
    resume.classList.remove("is-hidden");
  };
  resume.onclick = () => {
    state.refresh = true;
    updateLayerContent();
    resume.classList.add("is-hidden");
    pause.classList.remove("is-hidden");
  };
};

const loadTabsHeaderEventListeners = () => {
  document.querySelectorAll(".tabs li").forEach((li) => {
    li.onclick = (element) => {
      const id = element.target.parentNode.dataset.id;
      state.updateId(id);
    };
  });
};

const loadTabsFooterEventListeners = () => {
  utils.loadSearchFunctionality();

  document.querySelector("#collapse").onclick = () => {
    utils.collapseLayerContent(state.id, state.data[state.id], "0");
  };

  document.querySelector("#expand").onclick = () => {
    utils.collapseLayerContent(state.id, state.data[state.id], "all");
  };

  document.querySelector("#copy").onclick = () => {
    utils.copyToClipboard(state.data[state.id]);
  };
};
