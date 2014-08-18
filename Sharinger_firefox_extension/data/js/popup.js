self.on('message', function onMessage(activeTab) {
	var message = document.querySelector('#message');
	message.textContent = activeTab.url+" "+activeTab.title;

	var button = document.querySelector('#copy-button');
	button.setAttribute("data-clipboard-text", activeTab.url+" "+activeTab.title);

} );
