/* https://stackoverflow.com/q/67806779 */
function tabsGetById(id, callback) {
	const cb = tab => (chrome.runtime.lastError) ? setTimeout(e => chrome.tabs.get(id, cb)) : callback(tab);
	chrome.tabs.get(id, cb);
}

var selectedIndexes = {};

// Move all new tabs to the end, assuming you have fewer than 9,999 tabs open.
chrome.tabs.onCreated.addListener(function (tab) {
	chrome.tabs.move(tab.id, { "index": 9999 });
});

// Store the currently selected tab index for each window.
chrome.tabs.onSelectionChanged.addListener(function (tabId, selectInfo) {
	tabsGetById(tabId, function(tab) {
		selectedIndexes[selectInfo.windowId] = tab.index;
	});
});

// When a tab is removed, select the next tab (based on the selectedIndex for that window)
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
	if (removeInfo.isWindowClosing) return;

	chrome.tabs.query({ windowId: removeInfo.windowId }, function(tabs) {
		var selectedIndex = 0;
		if (removeInfo.windowId in selectedIndexes)
			selectedIndex = selectedIndexes[removeInfo.windowId];

		if (tabs.length <= selectedIndex) {
			if (typeof tabs[tabs.length-1] !== 'undefined') {
				chrome.tabs.update(tabs[tabs.length-1].id, { selected: true });
			}
		}
		else {
			chrome.tabs.update(tabs[selectedIndex].id, { selected: true });
		}
	});
});
