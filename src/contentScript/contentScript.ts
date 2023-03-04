document.getElementsByTagName("body")[0].style.cursor = 'url(\"' + chrome.runtime.getURL("gold-blue-diamond-custom-cursor.png") + '\"), auto';
addEventListener("pointerover", (event) => {
    document.getElementsByTagName("body")[0].style.cursor = 'url(\"' + chrome.runtime.getURL("gold-blue-diamond-custom-cursor2.png") + '\"), pointer !important';
});