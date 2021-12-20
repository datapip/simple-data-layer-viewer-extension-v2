const createInputs = (inputs) => {
  return inputs
    .map(
      (input) =>
        `<div class="control my-1">
          <input class="input is-radiusless" type="text" pattern="^[^\\[\\]\\d]+$" value="${input}" />
        </div>`
    )
    .join("");
};

const createModal = (error) => {
  return `
    <div class="content mb-4">
      <blockquote>
        <button id="close" class="delete is-pulled-right" aria-label="delete"></button>
        <strong>Error</strong></br>
        ${error}
      </blockquote>
    </div>
  `;
};
