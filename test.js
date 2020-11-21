

/**
* Habilitar o no el input de envio de mensaje.
* @function
* @param {Boolean} enable Habilitar o no.
*/
function setEnableInputText(enable) {
  if (enable) {
    document.querySelector('.wc-console').classList.remove('disable');
    document.querySelector('.wc-shellinput').disabled = false;
  } else {
    document.querySelector('.wc-console').classList.add('disable');
    document.querySelector('.wc-shellinput').disabled = true;
  }
}

document.querySelector('.wc-message-group-content')
    .addEventListener('DOMNodeInserted', function() {
      const query = '.wc-message-wrapper .wc-message .wc-message-content .format-markdown p';
      const messages = document.querySelectorAll(query);
      const lastText = messages[messages.length -1].innerText;
      const keyWords = ['¿Deseas también dejar un comentario? 🗨🗨'];
      if (keyWords.includes(lastText)) {
        setEnableInputText(false);
      } else {
        setEnableInputText(true);
      }
    }, false);
