"use strict";
// console.log("background.js");

messenger.compose.onBeforeSend.addListener(async (tab, details) => {
	
	// console.log("messenger.compose.onBeforeSend()");
	
	let { options } = await messenger.storage.local.get("options");
	
	if ((options?.["mailmerge-options-recipientsreminder-checkbox"] ?? true)) {
		
		if (
			details.to.length > Number((options?.["mailmerge-options-recipientsreminder"] ?? "1"))
		) {
			
			let title = await messenger.i18n.getMessage("mailmerge.recipientsreminder.title");
			let message = await messenger.i18n.getMessage("mailmerge.recipientsreminder.message");
			
			let rv = await messenger.mailmerge.confirm(title, message);
			if (rv === false) {
				return { cancel : true };
			}
			
		}
		
	}
	
	if ((options?.["mailmerge-options-variablesreminder-checkbox"] ?? true)) {
		
		if (
			details.from.includes("{{") && details.from.includes("}}") ||
			details.to.join(", ").includes("{{") && details.to.join(", ").includes("}}") ||
			details.cc.join(", ").includes("{{") && details.cc.join(", ").includes("}}") ||
			details.bcc.join(", ").includes("{{") && details.bcc.join(", ").includes("}}") ||
			details.replyTo.join(", ").includes("{{") && details.replyTo.join(", ").includes("}}") ||
			details.subject.includes("{{") && details.subject.includes("}}") ||
			details.body.includes("{{") && details.body.includes("}}")
		) {
			
			let title = await messenger.i18n.getMessage("mailmerge.variablesreminder.title");
			let message = await messenger.i18n.getMessage("mailmerge.variablesreminder.message");
			
			let rv = await messenger.mailmerge.confirm(title, message);
			if (rv === false) {
				return { cancel : true };
			}
			
		}
		
	}
	
});

messenger.menus.create({
	
	id: "mailmerge",
	title: "Mail Merge",
	contexts: ["tools_menu"],
	
});

messenger.menus.onShown.addListener(async (info, tab) => {
	
	// console.log("messenger.menus.onShown()");
	
	if (tab.type === "messageCompose") {
		await messenger.menus.update("mailmerge", { visible: true });
	} else {
		await messenger.menus.update("mailmerge", { visible: false });
	}
	
	await messenger.menus.refresh();
	
});

messenger.menus.onClicked.addListener(async (info, tab) => {
	
	// console.log("messenger.menus.onClicked()");
	
	await openDialog(tab);
	
});

messenger.composeAction.onClicked.addListener(async (tab) => {
	
	// console.log("messenger.composeAction.onClicked()");
	
	await openDialog(tab);
	
});

async function openDialog(tab) {
	
	let { options } = await messenger.storage.local.get("options");
	
	await messenger.composeAction.disable(); await messenger.menus.update("mailmerge", { enabled: false });
	
	let rv = await messenger.mailmerge.compose.init(tab.id);
	if (rv === true) {
		
		if ((options?.["mailmerge-options-saveastemplate-checkbox"] ?? true)) { await messenger.compose.saveMessage(tab.id, { mode: "template" }); }
		
		await messenger.mailmerge.compose.expand(tab.id);
		
		await messenger.mailmerge.compose.lock(tab.id);
		
		await openWindow(tab);
		
		await messenger.mailmerge.compose.unlock(tab.id);
		
	}
	
	await messenger.composeAction.enable(); await messenger.menus.update("mailmerge", { enabled: true });
	
}

async function openWindow(tab) {
	
	return new Promise(async (resolve, reject) => {
		
		let popup = await messenger.windows.create({
			
			type: "popup",
			url: "/content/dialog.html" + "?" + tab.id,
			width: Math.min(800, Math.round(window.screen.availWidth * 85 / 100)),
			height: Math.min(864, Math.round(window.screen.availHeight * 85 / 100)),
			
		});
		
		await messenger.windows.update(popup.id, { focused: true });
		
		function tabListener(tabId, { windowId }) {
			
			if (windowId === popup.id) {
				messenger.tabs.onRemoved.removeListener(tabListener);
				resolve();
			}
			
			if (windowId === tab.windowId) {
				messenger.windows.remove(popup.id);
			}
			
		}
		
		messenger.tabs.onRemoved.addListener(tabListener);
		
	});
	
}

async function openTab(tab) {
	
	return new Promise(async (resolve, reject) => {
		
		let popup = await messenger.tabs.create({
			
			url: "/content/dialog.html" + "?" + tab.id,
			
		});
		
		await messenger.windows.update(popup.windowId, { focused: true });
		
		function tabListener(tabId, { windowId }) {
			
			if (tabId === popup.id) {
				messenger.tabs.onRemoved.removeListener(tabListener);
				resolve();
			}
			
			if (tabId === tab.id) {
				messenger.tabs.remove(popup.id);
			}
			
		}
		
		messenger.tabs.onRemoved.addListener(tabListener);
		
	});
	
}

messenger.runtime.onUpdateAvailable.addListener(async () => {
	
	// console.log("messenger.runtime.onUpdateAvailable()");
	
	if (await isSafeToReload()) {
		messenger.runtime.reload();
	} else {
		messenger.windows.onRemoved.addListener(async () => {
			if (await isSafeToReload()) {
				messenger.runtime.reload();
			}
		});
	}
	
});

async function isSafeToReload() {
	
	let windows = await messenger.windows.getAll({
		windowTypes: ["messageCompose"]
	});
	
	return (windows.length == 0);
	
}
