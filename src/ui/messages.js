export const showMessage = (message, type) => {
  const messageBox = document.createElement("div");
  messageBox.textContent = message;
  messageBox.className = `message-box ${type}`;

  document.body.appendChild(messageBox);
  void messageBox.offsetWidth;
  messageBox.classList.add("show");

  setTimeout(() => {
    messageBox.classList.remove("show");
    messageBox.addEventListener(
      "transitionend",
      () => {
        messageBox.remove();
      },
      { once: true }
    );
  }, 3000);
};
