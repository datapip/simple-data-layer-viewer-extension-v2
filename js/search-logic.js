/**
 * Main
 */

const search = {
  index: 0,
  keyword: null,
  content: null,
  matches: null,
  timer: null,
  setIndex(index) {
    this.index = index;
    scrollSpanIntoView();
    displayResultStats();
  },
  setKeyword(keyword) {
    this.resetVisual();
    this.keyword = keyword;
    setSearchResults();
  },
  setContent(content) {
    this.content = content;
  },
  setMatches(matches) {
    this.matches = matches;
    addHighlightingToResults();
    scrollSpanIntoView();
    displayResultStats();
  },
  resetVisual() {
    removeHighlightingFromResults();
    removeDisplayOfResultStats();
    this.index = 0;
  },
  resetAll() {
    this.resetVisual();
    this.keyword = null;
    this.content = null;
    this.matches = null;
    scrollToLocation({
      top: 0,
      left: 0,
    });
    document.querySelector("input.search").value = "";
  },
};

/**
 * Functions
 */

const searchInContent = (keyword) => {
  if (!keyword) {
    search.resetAll();
  } else {
    setContentToSearch();
    setKeywordForSearch(keyword);
  }
};

const setContentToSearch = () => {
  const content = getAllSpanNodes();
  search.setContent(content);
};

const getAllSpanNodes = () => {
  return document.querySelectorAll(
    ` 
    pre.is-active span.key, 
    pre.is-active span.string, 
    pre.is-active span.number, 
    pre.is-active span.boolean, 
    pre.is-active span.keyword
  `
  );
};

const setKeywordForSearch = (keyword) => {
  if (search.keyword !== keyword) {
    search.setKeyword(keyword);
  } else {
    updateIndexForSameSearch();
  }
};

const updateIndexForSameSearch = () => {
  if (!search.matches) return;
  if (search.index + 1 === search.matches.length) {
    search.setIndex(0);
  } else {
    search.setIndex(++search.index);
  }
};

const setSearchResults = () => {
  const matches = [];
  search.content.forEach((span) => {
    if (span.innerHTML.indexOf(search.keyword) != -1) {
      matches.push(span);
    }
  });
  if (matches.length) search.setMatches(matches);
};

const addHighlightingToResults = () => {
  search.matches.forEach((span) => {
    span.innerHTML = span.innerHTML.replace(
      search.keyword,
      `<mark>${search.keyword}</mark>`
    );
  });
};

const removeHighlightingFromResults = () => {
  if (search.matches) {
    search.matches.forEach((span) => {
      span.innerHTML = span.innerHTML.replace(
        `<mark>${search.keyword}</mark>`,
        search.keyword
      );
    });
  }
};

const scrollSpanIntoView = () => {
  const span = search.matches[search.index];
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

const displayResultStats = () => {
  document.querySelector("#results").innerHTML = `
    ${search.index + 1} of ${search.matches.length}
  `;
};

const removeDisplayOfResultStats = () => {
  document.querySelector("#results").innerHTML = "";
};

const loadSearchEventListeners = () => {
  document.querySelectorAll(".tabs li").forEach((li) => {
    li.onmouseup = () => {
      search.resetAll();
    };
  });

  document.querySelector("#search").onclick = () => {
    updateIndexForSameSearch();
  };

  document.querySelector("input.search").onkeyup = (event) => {
    if (event.keyCode === 13) {
      updateIndexForSameSearch();
    } else {
      clearTimeout(search.timer);
      search.timer = setTimeout(() => {
        searchInContent(event.target.value);
      }, 200);
    }
  };
};
