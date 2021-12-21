/**
 * Main
 */

const search = {
  result: 0,
  keyword: null,
  content: null,
  matches: null,
  timer: null,
  updateResult(result) {
    this.result = result;
    scrollResultIntoView();
    displayResultInfo();
  },
  updateKeyword(keyword) {
    this.resetVisuals();
    this.keyword = keyword;
    getSearchResults();
  },
  updateContent(content) {
    this.content = content;
  },
  updateMatches(matches) {
    this.matches = matches;
    addResultHighlighting();
    scrollResultIntoView();
    displayResultInfo();
  },
  resetVisuals() {
    this.result = 0;
    removeResultHighlighting();
    removeResultInfo();
  },
  resetData() {
    this.resetVisuals();
    this.keyword = null;
    this.content = null;
    this.matches = null;
    scrollToLocation({
      top: 0,
      left: 0,
    });
    resetSearchInput();
  },
};

/**
 * Functions
 */

const searchInCurrentContent = (keyword) => {
  if (!keyword) {
    search.resetData();
  } else {
    getCurrentTabsContent();
    checkSearchKeyword(keyword);
  }
};

const getCurrentTabsContent = () => {
  const content = document.querySelectorAll(
    ` 
      pre.is-active span.key, 
      pre.is-active span.string, 
      pre.is-active span.number, 
      pre.is-active span.boolean, 
      pre.is-active span.keyword
    `
  );
  search.updateContent(content);
};

const checkSearchKeyword = (keyword) => {
  if (search.keyword !== keyword) {
    search.updateKeyword(keyword);
  } else {
    increaseResultIndex();
  }
};

const increaseResultIndex = () => {
  if (!search.matches) return;
  if (search.result + 1 === search.matches.length) {
    search.updateResult(0);
  } else {
    search.updateResult(++search.result);
  }
};

const getSearchResults = () => {
  const matches = [];
  search.content.forEach((span) => {
    if (span.innerHTML.indexOf(search.keyword) != -1) {
      matches.push(span);
    }
  });
  if (matches.length) search.updateMatches(matches);
};

const addResultHighlighting = () => {
  search.matches.forEach((span) => {
    span.innerHTML = span.innerHTML.replace(
      search.keyword,
      `<mark>${search.keyword}</mark>`
    );
  });
};

const removeResultHighlighting = () => {
  if (search.matches) {
    search.matches.forEach((span) => {
      span.innerHTML = span.innerHTML.replace(
        `<mark>${search.keyword}</mark>`,
        search.keyword
      );
    });
  }
};

const scrollResultIntoView = () => {
  const span = search.matches[search.result];
  const y = getCalculatedYPosition(span.getBoundingClientRect());
  scrollToLocation({
    top: y,
    left: 0,
    behavior: "smooth",
  });
};

const scrollToLocation = (object) => {
  document.querySelector("#layers").scrollTo(object);
};

const getCalculatedYPosition = (spanBounds) => {
  const preBounds = document
    .querySelector("pre.is-active")
    .getBoundingClientRect();
  return spanBounds.y - preBounds.y - 20;
};

const displayResultInfo = () => {
  document.querySelector("#results").innerHTML = `
    ${search.result + 1} of ${search.matches.length}
  `;
};

const removeResultInfo = () => {
  document.querySelector("#results").innerHTML = "";
};

const resetSearchInput = () => {
  document.querySelector("input.search").value = "";
};

/**
 * Event Listeners
 */

const loadSearchEventListeners = () => {
  document.querySelectorAll(".tabs li, #expand, #collapse").forEach((li) => {
    li.onmouseup = () => {
      search.resetData();
    };
  });

  document.querySelector("#search").onclick = () => {
    increaseResultIndex();
  };

  document.querySelector("input.search").onkeyup = (event) => {
    if (event.keyCode === 13) {
      increaseResultIndex();
    } else {
      clearTimeout(search.timer);
      search.timer = setTimeout(() => {
        searchInCurrentContent(event.target.value);
      }, 250);
    }
  };
};
