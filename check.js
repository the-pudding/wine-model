// Internet Explorer check and note.
if (window.document.documentMode) {
  const div = document.createElement('div');
  div.id = 'ie-note';
  div.innerHTML =
    "It seems you're using Internet Explorer... <br/> <br/>This site regrettably doesn't work on Internet Explorer, but on all other major modern browsers (for example <a href='https://www.microsoft.com/en-us/edge'>Microsoft Edge</a>) <br/>  <br/> Alternativley you can read it on your mobile phone or tablet - that'll work too!";
  document.body.appendChild(div);
}
