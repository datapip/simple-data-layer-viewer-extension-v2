const createHeader = () => {
  return `
    <header class="card-header has-background-info is-radiusless">
      <p class="card-header-title has-text-light">
        Simple Data Layer Viewer
      </p>
      <a id="options" role="button" class="navbar-burger has-text-light">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </header>
  `;
};

const createFooter = () => {
  return `
    <div class="field has-addons m-0">
      <div class="control">
        <input class="input search is-radiusless is-borderless pr-0" type="text" placeholder="Search key or value" autofocus>
        <span id="results" class="has-text-grey"></span>
      </div>
      <div class="control">
        <button id="search" class="button is-outlined is-radiusless has-text-info">▼</button>
      </div>
    </div>
    <button id="collapse" class="button is-info is-radiusless">Collapse</button>
    <button id="expand" class="button is-info is-radiusless">Expand</button>
    <button id="copy" class="button is-info is-radiusless">Copy</button>
    <div class="buttons is-flex-direction-column m-0">
      <button id="increase" class="button resize is-small is-info is-radiusless p-0 m-0"">+</button>
      <button id="decrease" class="button resize is-small is-info is-radiusless p-0 m-0">-</button>
    </div>
  `;
};

const createTabsHeader = (tabs) => {
  return tabs
    .map(
      (tab, index) =>
        `<li data-id="${index}">
          <a>${tab.name}</a>
        </li>`
    )
    .join("");
};

const createContainer = () => {
  return `
    <div class="card">
      ${createHeader()}
      <div class="card-content pt-4 pb-0 px-4">
        <div class="tabs is-boxed mb-0">
          <ul id="tabs">
          </ul>
        </div>
        <div class="content">
          <div class="blur blur-top"></div>
          <div id="layers">
          </div>
          <div class="blur blur-bottom"></div>
        </div>       
      </div>
      <footer id="footer" class="card-footer">
      </footer>
    </div>
  `;
};

const createError = (error) => {
  const message = error
    ? error.message
    : `Sorry, none of the <strong>declared</strong> data layers could be found on this <strong>website</strong>!`;
  return `
    <div class="content mb-4">
      <blockquote>${message}</blockquote>
    </div>
  `;
};
