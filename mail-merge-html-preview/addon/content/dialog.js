"use strict";
// console.log("dialog.js");

document.addEventListener("DOMContentLoaded", async (e) => {
	
	// console.log("DOMContentLoaded");
	
	if (await cardbook.active()) { document.getElementById("mailmerge-dialog-source").add(await mailmerge.dialog.option(await messenger.i18n.getMessage("mailmerge.dialog.source.cardbook"), "CardBook")); }
	document.getElementById("mailmerge-dialog-source").add(await mailmerge.dialog.option(await messenger.i18n.getMessage("mailmerge.dialog.source.addressbook"), "AddressBook"));
	document.getElementById("mailmerge-dialog-source").add(await mailmerge.dialog.option(await messenger.i18n.getMessage("mailmerge.dialog.source.csv"), "CSV"));
	document.getElementById("mailmerge-dialog-source").add(await mailmerge.dialog.option(await messenger.i18n.getMessage("mailmerge.dialog.source.json"), "JSON"));
	document.getElementById("mailmerge-dialog-source").add(await mailmerge.dialog.option(await messenger.i18n.getMessage("mailmerge.dialog.source.xlsx"), "XLSX"));
	
	document.getElementById("mailmerge-dialog-cardbook-addressbook").add(await mailmerge.dialog.option(await messenger.i18n.getMessage("mailmerge.dialog.cardbook.addressbook.addressbooks"), ""));
	if (await cardbook.active()) { await mailmerge.dialog.cardbook(); }
	
	document.getElementById("mailmerge-dialog-addressbook-addressbook").add(await mailmerge.dialog.option(await messenger.i18n.getMessage("mailmerge.dialog.addressbook.addressbook.addressbooks"), ""));
	await mailmerge.dialog.addressbook();
	
	document.getElementById("mailmerge-dialog-csv-characterset").add(await mailmerge.dialog.option("utf-8", "utf-8"));
	document.getElementById("mailmerge-dialog-csv-characterset").add(await mailmerge.dialog.option("utf-16be", "utf-16be"));
	document.getElementById("mailmerge-dialog-csv-characterset").add(await mailmerge.dialog.option("utf-16le", "utf-16le"));
	document.getElementById("mailmerge-dialog-csv-characterset").add(await mailmerge.dialog.option("iso-8859-1", "iso-8859-1"));
	document.getElementById("mailmerge-dialog-csv-characterset").add(await mailmerge.dialog.option("iso-8859-2", "iso-8859-2"));
	document.getElementById("mailmerge-dialog-csv-characterset").add(await mailmerge.dialog.option("iso-8859-3", "iso-8859-3"));
	document.getElementById("mailmerge-dialog-csv-characterset").add(await mailmerge.dialog.option("iso-8859-4", "iso-8859-4"));
	document.getElementById("mailmerge-dialog-csv-characterset").add(await mailmerge.dialog.option("iso-8859-5", "iso-8859-5"));
	document.getElementById("mailmerge-dialog-csv-characterset").add(await mailmerge.dialog.option("iso-8859-6", "iso-8859-6"));
	document.getElementById("mailmerge-dialog-csv-characterset").add(await mailmerge.dialog.option("iso-8859-7", "iso-8859-7"));
	document.getElementById("mailmerge-dialog-csv-characterset").add(await mailmerge.dialog.option("iso-8859-8", "iso-8859-8"));
	document.getElementById("mailmerge-dialog-csv-characterset").add(await mailmerge.dialog.option("iso-8859-9", "iso-8859-9"));
	document.getElementById("mailmerge-dialog-csv-characterset").add(await mailmerge.dialog.option("iso-8859-10", "iso-8859-10"));
	document.getElementById("mailmerge-dialog-csv-characterset").add(await mailmerge.dialog.option("iso-8859-11", "iso-8859-11"));
	document.getElementById("mailmerge-dialog-csv-characterset").add(await mailmerge.dialog.option("iso-8859-12", "iso-8859-12"));
	document.getElementById("mailmerge-dialog-csv-characterset").add(await mailmerge.dialog.option("iso-8859-13", "iso-8859-13"));
	document.getElementById("mailmerge-dialog-csv-characterset").add(await mailmerge.dialog.option("iso-8859-14", "iso-8859-14"));
	document.getElementById("mailmerge-dialog-csv-characterset").add(await mailmerge.dialog.option("iso-8859-15", "iso-8859-15"));
	document.getElementById("mailmerge-dialog-csv-characterset").add(await mailmerge.dialog.option("iso-8859-16", "iso-8859-16"));
	document.getElementById("mailmerge-dialog-csv-characterset").add(await mailmerge.dialog.option("windows-1250", "windows-1250"));
	document.getElementById("mailmerge-dialog-csv-characterset").add(await mailmerge.dialog.option("windows-1251", "windows-1251"));
	document.getElementById("mailmerge-dialog-csv-characterset").add(await mailmerge.dialog.option("windows-1252", "windows-1252"));
	document.getElementById("mailmerge-dialog-csv-characterset").add(await mailmerge.dialog.option("windows-1253", "windows-1253"));
	document.getElementById("mailmerge-dialog-csv-characterset").add(await mailmerge.dialog.option("windows-1254", "windows-1254"));
	document.getElementById("mailmerge-dialog-csv-characterset").add(await mailmerge.dialog.option("windows-1255", "windows-1255"));
	document.getElementById("mailmerge-dialog-csv-characterset").add(await mailmerge.dialog.option("windows-1256", "windows-1256"));
	document.getElementById("mailmerge-dialog-csv-characterset").add(await mailmerge.dialog.option("windows-1257", "windows-1257"));
	document.getElementById("mailmerge-dialog-csv-characterset").add(await mailmerge.dialog.option("windows-1258", "windows-1258"));
	document.getElementById("mailmerge-dialog-csv-characterset").add(await mailmerge.dialog.option("macintosh", "macintosh"));
	
	document.getElementById("mailmerge-dialog-csv-fielddelimiter").add(await mailmerge.dialog.option(await messenger.i18n.getMessage("mailmerge.dialog.csv.fielddelimiter.automatic"), ""));
	document.getElementById("mailmerge-dialog-csv-fielddelimiter").add(await mailmerge.dialog.option(",", ","));
	document.getElementById("mailmerge-dialog-csv-fielddelimiter").add(await mailmerge.dialog.option(";", ";"));
	document.getElementById("mailmerge-dialog-csv-fielddelimiter").add(await mailmerge.dialog.option(":", ":"));
	document.getElementById("mailmerge-dialog-csv-fielddelimiter").add(await mailmerge.dialog.option("Tab", "\t"));
	
	document.getElementById("mailmerge-dialog-delivermode").add(await mailmerge.dialog.option(await messenger.i18n.getMessage("mailmerge.dialog.delivermode.saveasdraft"), "SaveAsDraft"));
	document.getElementById("mailmerge-dialog-delivermode").add(await mailmerge.dialog.option(await messenger.i18n.getMessage("mailmerge.dialog.delivermode.sendlater"), "SendLater"));
	document.getElementById("mailmerge-dialog-delivermode").add(await mailmerge.dialog.option(await messenger.i18n.getMessage("mailmerge.dialog.delivermode.sendnow"), "SendNow"));
	
	document.getElementById("mailmerge-dialog-sendlater-recur").add(await mailmerge.dialog.option(await messenger.i18n.getMessage("mailmerge.dialog.sendlater.recur.none"), ""));
	document.getElementById("mailmerge-dialog-sendlater-recur").add(await mailmerge.dialog.option(await messenger.i18n.getMessage("mailmerge.dialog.sendlater.recur.minutely"), "minutely"));
	document.getElementById("mailmerge-dialog-sendlater-recur").add(await mailmerge.dialog.option(await messenger.i18n.getMessage("mailmerge.dialog.sendlater.recur.daily"), "daily"));
	document.getElementById("mailmerge-dialog-sendlater-recur").add(await mailmerge.dialog.option(await messenger.i18n.getMessage("mailmerge.dialog.sendlater.recur.weekly"), "weekly"));
	document.getElementById("mailmerge-dialog-sendlater-recur").add(await mailmerge.dialog.option(await messenger.i18n.getMessage("mailmerge.dialog.sendlater.recur.monthly"), "monthly"));
	document.getElementById("mailmerge-dialog-sendlater-recur").add(await mailmerge.dialog.option(await messenger.i18n.getMessage("mailmerge.dialog.sendlater.recur.yearly"), "yearly"));
	
	document.getElementById("mailmerge-dialog-sendlater-only").add(await mailmerge.dialog.option(await messenger.i18n.getMessage("mailmerge.dialog.sendlater.only.sunday"), "0"));
	document.getElementById("mailmerge-dialog-sendlater-only").add(await mailmerge.dialog.option(await messenger.i18n.getMessage("mailmerge.dialog.sendlater.only.monday"), "1"));
	document.getElementById("mailmerge-dialog-sendlater-only").add(await mailmerge.dialog.option(await messenger.i18n.getMessage("mailmerge.dialog.sendlater.only.tuesday"), "2"));
	document.getElementById("mailmerge-dialog-sendlater-only").add(await mailmerge.dialog.option(await messenger.i18n.getMessage("mailmerge.dialog.sendlater.only.wednesday"), "3"));
	document.getElementById("mailmerge-dialog-sendlater-only").add(await mailmerge.dialog.option(await messenger.i18n.getMessage("mailmerge.dialog.sendlater.only.thursday"), "4"));
	document.getElementById("mailmerge-dialog-sendlater-only").add(await mailmerge.dialog.option(await messenger.i18n.getMessage("mailmerge.dialog.sendlater.only.friday"), "5"));
	document.getElementById("mailmerge-dialog-sendlater-only").add(await mailmerge.dialog.option(await messenger.i18n.getMessage("mailmerge.dialog.sendlater.only.saturday"), "6"));
	
	document.getElementById("mailmerge-dialog-load").addEventListener("click", mailmerge.dialog.load);
	document.getElementById("mailmerge-dialog-reset").addEventListener("click", mailmerge.dialog.reset);
	document.getElementById("mailmerge-dialog-save").addEventListener("click", mailmerge.dialog.save);
	
	document.getElementById("mailmerge-message-index").addEventListener("change", mailmerge.message.index);
	document.getElementById("mailmerge-message-begin").addEventListener("click", mailmerge.message.begin);
	document.getElementById("mailmerge-message-previous").addEventListener("click", mailmerge.message.previous);
	document.getElementById("mailmerge-message-next").addEventListener("click", mailmerge.message.next);
	document.getElementById("mailmerge-message-end").addEventListener("click", mailmerge.message.end);
	
	document.getElementById("mailmerge-send-start").addEventListener("click", mailmerge.send.start);
	
	document.getElementById("mailmerge-dialog-about").addEventListener("click", mailmerge.about.init);
	document.getElementById("mailmerge-dialog-file").addEventListener("click", mailmerge.file.init);
	document.getElementById("mailmerge-dialog-message").addEventListener("click", mailmerge.message.init);
	document.getElementById("mailmerge-dialog-send").addEventListener("click", mailmerge.send.init);
	
	document.getElementById("mailmerge-about-accept").addEventListener("click", mailmerge.about.accept);
	document.getElementById("mailmerge-file-accept").addEventListener("click", mailmerge.file.accept);
	document.getElementById("mailmerge-message-accept").addEventListener("click", mailmerge.message.accept);
	document.getElementById("mailmerge-send-accept").addEventListener("click", mailmerge.send.accept);
	
	let elements = document.querySelectorAll("[data-i18n]");
	for (let element of elements) {
		
		let attributes = element.dataset.i18n.split(";");
		for (let attribute of attributes) {
			
			if (attribute.includes("=")) {
				element.setAttribute(attribute.split("=")[0], await messenger.i18n.getMessage(attribute.split("=")[1]));
			} else {
				element.textContent = await messenger.i18n.getMessage(attribute);
			}
			
		}
		
	}
	
	elements = document.querySelector("#mailmerge-dialog .content").querySelectorAll("input[type='number']");
	for (let element of elements) {
		
		document.getElementById(element.id + "-minus").addEventListener("click", () => {
			element.stepDown();
			element.dispatchEvent(new Event("change"));
		});
		
		document.getElementById(element.id + "-plus").addEventListener("click", () => {
			element.stepUp();
			element.dispatchEvent(new Event("change"));
		});
		
	}
	
	elements = document.querySelector("#mailmerge-dialog .content").querySelectorAll("input , select , textarea");
	for (let element of elements) {
		
		element.addEventListener("change", mailmerge.dialog.change);
		
	}
	
	elements = document.querySelector("#mailmerge-about .content").querySelectorAll("a");
	for (let element of elements) {
		
		element.addEventListener("click", mailmerge.about.click);
		
	}
	
	await mailmerge.dialog.init();
	
	await compose.init();
	
});

var compose = {
	
	async init() {
		
		// console.log("compose.init()");
		
		compose.tab = Number(window.location.href.split("?")[1]);
		
		compose.details = await messenger.compose.getComposeDetails(compose.tab);
		
		compose.details.from = compose.details.from.replace(" <>","");
		
		compose.details.to = compose.details.to.map(e => e.replace('<"', '<').replace('">', '>')).map(e => e.replace(" <>",""));
		compose.details.cc = compose.details.cc.map(e => e.replace('<"', '<').replace('">', '>')).map(e => e.replace(" <>",""));
		compose.details.bcc = compose.details.bcc.map(e => e.replace('<"', '<').replace('">', '>')).map(e => e.replace(" <>",""));
		compose.details.replyTo = compose.details.replyTo.map(e => e.replace('<"', '<').replace('">', '>')).map(e => e.replace(" <>",""));
		
		compose.details.body = compose.details.body.replace(/[{][{][\s\S]*?[}][}]/g, (match) => { return match.replace(/\n(  )*/g, " "); });
		compose.details.plainTextBody = compose.details.plainTextBody.replace(/[{][{][\s\S]*?[}][}]/g, (match) => { return match.replace(/\n(  )*/g, ""); });
		
		compose.details.attachments = await messenger.compose.listAttachments(compose.tab);
		
		compose.extras = await messenger.mailmerge.compose.headers(compose.tab);
		
	},
	
};

var mailmerge = {
	
	dialog: {
		
		async init(prefs) {
			
			// console.log("mailmerge.dialog.init()");
			
			for (let i = 0; i < 7; i++) {
				document.getElementById("mailmerge-dialog-sendlater-only").options[i].selected = (prefs?.["mailmerge-dialog-sendlater-only"].split(",").includes(i.toString()) ?? false);
			}
			
			document.getElementById("mailmerge-dialog-source").value = (prefs?.["mailmerge-dialog-source"] ?? "AddressBook");
			document.getElementById("mailmerge-dialog-cardbook-addressbook").value = (prefs?.["mailmerge-dialog-cardbook-addressbook"] ?? "");
			document.getElementById("mailmerge-dialog-addressbook-addressbook").value = (prefs?.["mailmerge-dialog-addressbook-addressbook"] ?? "");
			document.getElementById("mailmerge-dialog-csv-file").value = (prefs?.["mailmerge-dialog-csv-file"] ?? "");
			document.getElementById("mailmerge-dialog-csv-characterset").value = (prefs?.["mailmerge-dialog-csv-characterset"] ?? "utf-8");
			document.getElementById("mailmerge-dialog-csv-fielddelimiter").value = (prefs?.["mailmerge-dialog-csv-fielddelimiter"] ?? "");
			document.getElementById("mailmerge-dialog-json-file").value = (prefs?.["mailmerge-dialog-json-file"] ?? "");
			document.getElementById("mailmerge-dialog-xlsx-file").value = (prefs?.["mailmerge-dialog-xlsx-file"] ?? "");
			document.getElementById("mailmerge-dialog-xlsx-sheetname").value = (prefs?.["mailmerge-dialog-xlsx-sheetname"] ?? "");
			document.getElementById("mailmerge-dialog-attachments-file").value = (prefs?.["mailmerge-dialog-attachments-file"] ?? "");
			document.getElementById("mailmerge-dialog-attachments-attachments").value = (prefs?.["mailmerge-dialog-attachments-attachments"] ?? "");
			document.getElementById("mailmerge-dialog-batch-pause").value = (prefs?.["mailmerge-dialog-batch-pause"] ?? "");
			document.getElementById("mailmerge-dialog-batch-start").value = (prefs?.["mailmerge-dialog-batch-start"] ?? "");
			document.getElementById("mailmerge-dialog-batch-stop").value = (prefs?.["mailmerge-dialog-batch-stop"] ?? "");
			document.getElementById("mailmerge-dialog-delivermode").value = (prefs?.["mailmerge-dialog-delivermode"] ?? "SendLater");
			document.getElementById("mailmerge-dialog-sendlater-at").value = (prefs?.["mailmerge-dialog-sendlater-at"] ?? "");
			document.getElementById("mailmerge-dialog-sendlater-recur").value = (prefs?.["mailmerge-dialog-sendlater-recur"] ?? "");
			document.getElementById("mailmerge-dialog-sendlater-every").value = (prefs?.["mailmerge-dialog-sendlater-every"] ?? "");
			document.getElementById("mailmerge-dialog-sendlater-between").value = (prefs?.["mailmerge-dialog-sendlater-between"] ?? "");
			// document.getElementById("mailmerge-dialog-sendlater-only").value = (prefs?.["mailmerge-dialog-sendlater-only"] ?? "");
			document.getElementById("mailmerge-dialog-sendlater-until").value = (prefs?.["mailmerge-dialog-sendlater-until"] ?? "");
			
			document.getElementById("mailmerge-dialog-xlsx-sheetname-checkbox").checked = (prefs?.["mailmerge-dialog-xlsx-sheetname-checkbox"] ?? false);
			document.getElementById("mailmerge-dialog-attachments-checkbox").checked = (prefs?.["mailmerge-dialog-attachments-checkbox"] ?? false);
			document.getElementById("mailmerge-dialog-batch-pause-checkbox").checked = (prefs?.["mailmerge-dialog-batch-pause-checkbox"] ?? false);
			document.getElementById("mailmerge-dialog-batch-start-checkbox").checked = (prefs?.["mailmerge-dialog-batch-start-checkbox"] ?? false);
			document.getElementById("mailmerge-dialog-batch-stop-checkbox").checked = (prefs?.["mailmerge-dialog-batch-stop-checkbox"] ?? false);
			document.getElementById("mailmerge-dialog-sendlater-at-checkbox").checked = (prefs?.["mailmerge-dialog-sendlater-at-checkbox"] ?? false);
			document.getElementById("mailmerge-dialog-sendlater-recur-checkbox").checked = (prefs?.["mailmerge-dialog-sendlater-recur-checkbox"] ?? false);
			document.getElementById("mailmerge-dialog-sendlater-every-checkbox").checked = (prefs?.["mailmerge-dialog-sendlater-every-checkbox"] ?? false);
			document.getElementById("mailmerge-dialog-sendlater-between-checkbox").checked = (prefs?.["mailmerge-dialog-sendlater-between-checkbox"] ?? false);
			document.getElementById("mailmerge-dialog-sendlater-only-checkbox").checked = (prefs?.["mailmerge-dialog-sendlater-only-checkbox"] ?? false);
			document.getElementById("mailmerge-dialog-sendlater-until-checkbox").checked = (prefs?.["mailmerge-dialog-sendlater-until-checkbox"] ?? false);
			
			document.getElementById("mailmerge-dialog-batch-pause-random").checked = (prefs?.["mailmerge-dialog-batch-pause-random"] ?? false);
			
			await mailmerge.dialog.change();
			
		},
		
		async prefs() {
			
			// console.log("mailmerge.dialog.prefs()");
			
			let prefs = {};
			
			prefs.version = 1;
			
			prefs["mailmerge-dialog-source"] = document.getElementById("mailmerge-dialog-source").value;
			prefs["mailmerge-dialog-cardbook-addressbook"] = document.getElementById("mailmerge-dialog-cardbook-addressbook").value;
			prefs["mailmerge-dialog-addressbook-addressbook"] = document.getElementById("mailmerge-dialog-addressbook-addressbook").value;
			prefs["mailmerge-dialog-csv-file"] = ""; // document.getElementById("mailmerge-dialog-csv-file").value
			prefs["mailmerge-dialog-csv-characterset"] = document.getElementById("mailmerge-dialog-csv-characterset").value;
			prefs["mailmerge-dialog-csv-fielddelimiter"] = document.getElementById("mailmerge-dialog-csv-fielddelimiter").value;
			prefs["mailmerge-dialog-json-file"] = ""; // document.getElementById("mailmerge-dialog-json-file").value
			prefs["mailmerge-dialog-xlsx-file"] = ""; // document.getElementById("mailmerge-dialog-xlsx-file").value
			prefs["mailmerge-dialog-xlsx-sheetname"] = document.getElementById("mailmerge-dialog-xlsx-sheetname").value;
			prefs["mailmerge-dialog-attachments-file"] = ""; // document.getElementById("mailmerge-dialog-attachments-file").value
			prefs["mailmerge-dialog-attachments-attachments"] = document.getElementById("mailmerge-dialog-attachments-attachments").value;
			prefs["mailmerge-dialog-batch-pause"] = document.getElementById("mailmerge-dialog-batch-pause").value;
			prefs["mailmerge-dialog-batch-start"] = document.getElementById("mailmerge-dialog-batch-start").value;
			prefs["mailmerge-dialog-batch-stop"] = document.getElementById("mailmerge-dialog-batch-stop").value;
			prefs["mailmerge-dialog-delivermode"] = document.getElementById("mailmerge-dialog-delivermode").value;
			prefs["mailmerge-dialog-sendlater-at"] = document.getElementById("mailmerge-dialog-sendlater-at").value;
			prefs["mailmerge-dialog-sendlater-recur"] = document.getElementById("mailmerge-dialog-sendlater-recur").value;
			prefs["mailmerge-dialog-sendlater-every"] = document.getElementById("mailmerge-dialog-sendlater-every").value;
			prefs["mailmerge-dialog-sendlater-between"] = document.getElementById("mailmerge-dialog-sendlater-between").value;
			prefs["mailmerge-dialog-sendlater-only"] = document.getElementById("mailmerge-dialog-sendlater-only").dataset.value; // document.getElementById("mailmerge-dialog-sendlater-only").value
			prefs["mailmerge-dialog-sendlater-until"] = document.getElementById("mailmerge-dialog-sendlater-until").value;
			
			prefs["mailmerge-dialog-xlsx-sheetname-checkbox"] = document.getElementById("mailmerge-dialog-xlsx-sheetname-checkbox").checked;
			prefs["mailmerge-dialog-attachments-checkbox"] = document.getElementById("mailmerge-dialog-attachments-checkbox").checked;
			prefs["mailmerge-dialog-batch-pause-checkbox"] = document.getElementById("mailmerge-dialog-batch-pause-checkbox").checked;
			prefs["mailmerge-dialog-batch-start-checkbox"] = document.getElementById("mailmerge-dialog-batch-start-checkbox").checked;
			prefs["mailmerge-dialog-batch-stop-checkbox"] = document.getElementById("mailmerge-dialog-batch-stop-checkbox").checked;
			prefs["mailmerge-dialog-sendlater-at-checkbox"] = document.getElementById("mailmerge-dialog-sendlater-at-checkbox").checked;
			prefs["mailmerge-dialog-sendlater-recur-checkbox"] = document.getElementById("mailmerge-dialog-sendlater-recur-checkbox").checked;
			prefs["mailmerge-dialog-sendlater-every-checkbox"] = document.getElementById("mailmerge-dialog-sendlater-every-checkbox").checked;
			prefs["mailmerge-dialog-sendlater-between-checkbox"] = document.getElementById("mailmerge-dialog-sendlater-between-checkbox").checked;
			prefs["mailmerge-dialog-sendlater-only-checkbox"] = document.getElementById("mailmerge-dialog-sendlater-only-checkbox").checked;
			prefs["mailmerge-dialog-sendlater-until-checkbox"] = document.getElementById("mailmerge-dialog-sendlater-until-checkbox").checked;
			
			prefs["mailmerge-dialog-batch-pause-random"] = document.getElementById("mailmerge-dialog-batch-pause-random").checked;
			
			return { prefs };
			
		},
		
		async check() {
			
			// console.log("mailmerge.dialog.check()");
			
			let elements = document.querySelector("#mailmerge-dialog .content").querySelectorAll("input , select , textarea");
			for (let element of elements) {
				
				if (element.checkValidity()) { continue; }
				
				await mailmerge.error.alert("Error", element.validationMessage);
				element.focus();
				return false;
				
			}
			
			if (document.getElementById("mailmerge-dialog-source").selectedIndex === -1) {
				
				await mailmerge.error.alert("Error", "Check the Source");
				document.getElementById("mailmerge-dialog-source").focus();
				return false;
				
			}
			
			if (document.getElementById("mailmerge-dialog-source").value === "CardBook" && document.getElementById("mailmerge-dialog-cardbook-addressbook").selectedIndex === -1) {
				
				await mailmerge.error.alert("Error", "Check the Address Book");
				document.getElementById("mailmerge-dialog-cardbook-addressbook").focus();
				return false;
				
			}
			
			if (document.getElementById("mailmerge-dialog-source").value === "AddressBook" && document.getElementById("mailmerge-dialog-addressbook-addressbook").selectedIndex === -1) {
				
				await mailmerge.error.alert("Error", "Check the Address Book");
				document.getElementById("mailmerge-dialog-addressbook-addressbook").focus();
				return false;
				
			}
			
			if (document.getElementById("mailmerge-dialog-source").value === "CSV" && document.getElementById("mailmerge-dialog-csv-file").value === "") {
				
				await mailmerge.error.alert("Error", "Check the File");
				document.getElementById("mailmerge-dialog-csv-file").focus();
				return false;
				
			}
			
			if (document.getElementById("mailmerge-dialog-source").value === "JSON" && document.getElementById("mailmerge-dialog-json-file").value === "") {
				
				await mailmerge.error.alert("Error", "Check the File");
				document.getElementById("mailmerge-dialog-json-file").focus();
				return false;
				
			}
			
			if (document.getElementById("mailmerge-dialog-source").value === "XLSX" && document.getElementById("mailmerge-dialog-xlsx-file").value === "") {
				
				await mailmerge.error.alert("Error", "Check the File");
				document.getElementById("mailmerge-dialog-xlsx-file").focus();
				return false;
				
			}
			
			if (document.getElementById("mailmerge-dialog-attachments-checkbox").checked && document.getElementById("mailmerge-dialog-attachments-file").value === "") {
				
				await mailmerge.error.alert("Error", "Check the Attachments");
				document.getElementById("mailmerge-dialog-attachments-file").focus();
				return false;
				
			}
			
			if (document.getElementById("mailmerge-dialog-attachments-checkbox").checked && document.getElementById("mailmerge-dialog-attachments-attachments").value === "") {
				
				await mailmerge.error.alert("Error", "Check the Attachments");
				document.getElementById("mailmerge-dialog-attachments-attachments").focus();
				return false;
				
			}
			
			return true;
			
		},
		
		async load() {
			
			// console.log("mailmerge.dialog.load()");
			
			let { dialog } = await messenger.storage.local.get("dialog");
			await mailmerge.dialog.init(dialog);
			
		},
		
		async reset() {
			
			// console.log("mailmerge.dialog.reset()");
			
			await mailmerge.dialog.init();
			
		},
		
		async save() {
			
			// console.log("mailmerge.dialog.save()");
			
			if (await mailmerge.dialog.check() === false) { return; }
			
			let { prefs } = await mailmerge.dialog.prefs();
			await messenger.storage.local.set({ dialog: prefs });
			
		},
		
		async cardbook() {
			
			// console.log("mailmerge.dialog.cardbook()");
			
			let addressbooks = await cardbook.addressbooks();
			for (let addressbook of addressbooks) {
				document.getElementById("mailmerge-dialog-cardbook-addressbook").add(await mailmerge.dialog.option(addressbook.name, addressbook.id));
			}
			
		},
		
		async addressbook() {
			
			// console.log("mailmerge.dialog.addressbook()");
			
			let addressbooks = await messenger.addressBooks.list();
			for (let addressbook of addressbooks) {
				document.getElementById("mailmerge-dialog-addressbook-addressbook").add(await mailmerge.dialog.option(addressbook.name, addressbook.id));
			}
			
		},
		
		async change() {
			
			// console.log("mailmerge.dialog.change()");
			
			document.getElementById("mailmerge-dialog-cardbook-container").hidden = !(document.getElementById("mailmerge-dialog-source").value === "CardBook");
			document.getElementById("mailmerge-dialog-addressbook-container").hidden = !(document.getElementById("mailmerge-dialog-source").value === "AddressBook");
			document.getElementById("mailmerge-dialog-csv-container").hidden = !(document.getElementById("mailmerge-dialog-source").value === "CSV");
			document.getElementById("mailmerge-dialog-json-container").hidden = !(document.getElementById("mailmerge-dialog-source").value === "JSON");
			document.getElementById("mailmerge-dialog-xlsx-container").hidden = !(document.getElementById("mailmerge-dialog-source").value === "XLSX");
			
			document.getElementById("mailmerge-dialog-sendlater-container").hidden = !(document.getElementById("mailmerge-dialog-delivermode").value === "SaveAsDraft" && await sendlater.active());
			
			document.getElementById("mailmerge-dialog-sendlater-only").dataset.value = [...document.getElementById("mailmerge-dialog-sendlater-only").options].filter(e => e.selected).map(e => e.value).join(",");
			
			document.getElementById("mailmerge-dialog-file").style.visibility = (document.getElementById("mailmerge-dialog-source").value === "CSV" || document.getElementById("mailmerge-dialog-source").value === "JSON" || document.getElementById("mailmerge-dialog-source").value === "XLSX") ? "visible" : "hidden";
			
			document.getElementById("mailmerge-dialog-xlsx-sheetname").disabled = !(document.getElementById("mailmerge-dialog-xlsx-sheetname-checkbox").checked);
			document.getElementById("mailmerge-dialog-attachments-file").disabled = document.getElementById("mailmerge-dialog-attachments-attachments").disabled = !(document.getElementById("mailmerge-dialog-attachments-checkbox").checked);
			document.getElementById("mailmerge-dialog-batch-pause-minus").disabled = document.getElementById("mailmerge-dialog-batch-pause").disabled = document.getElementById("mailmerge-dialog-batch-pause-plus").disabled = document.getElementById("mailmerge-dialog-batch-pause-random").disabled = !(document.getElementById("mailmerge-dialog-batch-pause-checkbox").checked);
			document.getElementById("mailmerge-dialog-batch-start-minus").disabled = document.getElementById("mailmerge-dialog-batch-start").disabled = document.getElementById("mailmerge-dialog-batch-start-plus").disabled = !(document.getElementById("mailmerge-dialog-batch-start-checkbox").checked);
			document.getElementById("mailmerge-dialog-batch-stop-minus").disabled = document.getElementById("mailmerge-dialog-batch-stop").disabled = document.getElementById("mailmerge-dialog-batch-stop-plus").disabled = !(document.getElementById("mailmerge-dialog-batch-stop-checkbox").checked);
			document.getElementById("mailmerge-dialog-sendlater-at").disabled = !(document.getElementById("mailmerge-dialog-sendlater-at-checkbox").checked);
			document.getElementById("mailmerge-dialog-sendlater-recur").disabled = !(document.getElementById("mailmerge-dialog-sendlater-recur-checkbox").checked);
			document.getElementById("mailmerge-dialog-sendlater-every-minus").disabled = document.getElementById("mailmerge-dialog-sendlater-every").disabled = document.getElementById("mailmerge-dialog-sendlater-every-plus").disabled = !(document.getElementById("mailmerge-dialog-sendlater-every-checkbox").checked);
			document.getElementById("mailmerge-dialog-sendlater-between").disabled = !(document.getElementById("mailmerge-dialog-sendlater-between-checkbox").checked);
			document.getElementById("mailmerge-dialog-sendlater-only").disabled = !(document.getElementById("mailmerge-dialog-sendlater-only-checkbox").checked);
			document.getElementById("mailmerge-dialog-sendlater-until").disabled = !(document.getElementById("mailmerge-dialog-sendlater-until-checkbox").checked);
			
		},
		
		async option(text, value) {
			
			// console.log("mailmerge.dialog.option()");
			
			let option = document.createElement("option");
			option.text = text;
			option.value = value;
			
			return option;
			
		},
		
	},
	
	about: {
		
		async init() {
			
			// console.log("mailmerge.about.init()");
			
			document.getElementById("mailmerge-dialog").classList.toggle("active");
			
			document.getElementById("mailmerge-about-version").textContent = await browser.runtime.getManifest().version;
			
			document.getElementById("mailmerge-about").classList.toggle("active");
			
		},
		
		async accept() {
			
			// console.log("mailmerge.about.accept()");
			
			document.getElementById("mailmerge-about").classList.toggle("active");
			
			document.getElementById("mailmerge-dialog").classList.toggle("active");
			
		},
		
		async click(e) {
			
			// console.log("mailmerge.about.click()");
			
			e.preventDefault(); await messenger.windows.openDefaultBrowser(e.target.href);
			
		},
		
	},
	
	file: {
		
		async init() {
			
			// console.log("mailmerge.file.init()");
			
			if (await mailmerge.dialog.check() === false) { return; }
			
			document.getElementById("mailmerge-dialog").classList.toggle("active");
			
			let file;
			
			if (document.getElementById("mailmerge-dialog-source").value === "CSV") {
				file = await mailmerge.utils.csv();
			}
			
			if (document.getElementById("mailmerge-dialog-source").value === "JSON") {
				file = await mailmerge.utils.json();
			}
			
			if (document.getElementById("mailmerge-dialog-source").value === "XLSX") {
				file = await mailmerge.utils.xlsx();
			}
			
			if (file != null) {
				
				document.getElementById("mailmerge-file-name").textContent = file.name;
				
				let table = document.getElementById("mailmerge-file-table");
				for (let i = 0; i < file.json.length; i++) {
					
					let row = table.insertRow(i);
					for (let j = 0; j < file.json[i].length; j++) {
						
						let cell = row.insertCell(j);
						cell.textContent = (file.json[i][j] ?? "");
						
					}
					
				}
				
			}
			
			document.getElementById("mailmerge-file").classList.toggle("active");
			
		},
		
		async accept() {
			
			// console.log("mailmerge.file.accept()");
			
			document.getElementById("mailmerge-file").classList.toggle("active");
			
			let table = document.getElementById("mailmerge-file-table");
			while (table.hasChildNodes()) {
				table.lastChild.remove();
			}
			
			document.getElementById("mailmerge-dialog").classList.toggle("active");
			
		},
		
	},
	
	message: {
		
		async init() {
			
			// console.log("mailmerge.message.init()");
			
			if (await mailmerge.dialog.check() === false) { return; }
			
			document.getElementById("mailmerge-dialog").classList.toggle("active");
			
			await mailmerge.utils.init();
			
			let index = document.getElementById("mailmerge-message-index");
			index.value = (window.messages.length === 0) ? 0 : 1;
			index.min = (window.messages.length === 0) ? 0 : 1;
			index.max = (window.messages.length === 0) ? 0 : window.messages.length;
			index.dispatchEvent(new Event("change"));
			
			document.getElementById("mailmerge-message").classList.toggle("active");
			
		},
		
		async accept() {
			
			// console.log("mailmerge.message.accept()");
			
			document.getElementById("mailmerge-message").classList.toggle("active");
			
			document.getElementById("mailmerge-message-from").textContent = "";
			document.getElementById("mailmerge-message-to").textContent = "";
			document.getElementById("mailmerge-message-cc").textContent = "";
			document.getElementById("mailmerge-message-bcc").textContent = "";
			document.getElementById("mailmerge-message-reply").textContent = "";
			document.getElementById("mailmerge-message-subject").textContent = "";
			document.getElementById("mailmerge-message-attachments").textContent = "";
			document.getElementById("mailmerge-message-customheaders").textContent = "";
			mailmergePreview.clear();
			
			document.getElementById("mailmerge-dialog").classList.toggle("active");
			
		},
		
		async index() {
			
			// console.log("mailmerge.message.index()");
			
			let index = document.getElementById("mailmerge-message-index");
			
			if (index.checkValidity()) {
				index.dataset.value = index.value;
			} else {
				index.value = index.dataset.value;
			}
			
			let request = mailmergePreview.begin();
			
			let { details, extras } = await mailmerge.utils.compose(index.valueAsNumber);
			
			if (!mailmergePreview.current(request)) { return; }
			
			if (details != null && extras != null) {
				
				document.getElementById("mailmerge-message-from").textContent = details.from;
				document.getElementById("mailmerge-message-to").textContent = details.to;
				document.getElementById("mailmerge-message-cc").textContent = details.cc;
				document.getElementById("mailmerge-message-bcc").textContent = details.bcc;
				document.getElementById("mailmerge-message-reply").textContent = details.replyTo;
				document.getElementById("mailmerge-message-subject").textContent = details.subject;
				
				document.getElementById("mailmerge-message-attachments").textContent = "";
				
				for (let attachment of details.attachments) {
					document.getElementById("mailmerge-message-attachments").textContent += attachment.name + " : " + attachment.file.size + "\n";
				}
				
				document.getElementById("mailmerge-message-customheaders").textContent = "";
				
				for (let header of details.customHeaders) {
					document.getElementById("mailmerge-message-customheaders").textContent += header.name + " : " + header.value + "\n";
				}
				
				for (let header of extras.listHeaders) {
					document.getElementById("mailmerge-message-customheaders").textContent += header.name + " : " + header.value + "\n";
				}
				
			} else {
				
				for (let name of ["from", "to", "cc", "bcc", "reply", "subject", "attachments", "customheaders"]) {
					document.getElementById("mailmerge-message-" + name).textContent = "";
				}
				
			}
			
			mailmergePreview.update(index.valueAsNumber, details);
			
		},
		
		async begin() {
			
			// console.log("mailmerge.message.begin()");
			
			let index = document.getElementById("mailmerge-message-index");
			index.value = index.min;
			index.dispatchEvent(new Event("change"));
			
		},
		
		async previous() {
			
			// console.log("mailmerge.message.previous()");
			
			let index = document.getElementById("mailmerge-message-index");
			index.stepDown();
			index.dispatchEvent(new Event("change"));
			
		},
		
		async next() {
			
			// console.log("mailmerge.message.next()");
			
			let index = document.getElementById("mailmerge-message-index");
			index.stepUp();
			index.dispatchEvent(new Event("change"));
			
		},
		
		async end() {
			
			// console.log("mailmerge.message.end()");
			
			let index = document.getElementById("mailmerge-message-index");
			index.value = index.max;
			index.dispatchEvent(new Event("change"));
			
		},
		
	},
	
	send: {
		
		async init() {
			
			// console.log("mailmerge.send.init()");
			
			if (await mailmerge.dialog.check() === false) { return; }
			
			document.getElementById("mailmerge-dialog").classList.toggle("active");
			
			await mailmerge.utils.init();
			
			document.getElementById("mailmerge-send-current").textContent = "0";
			document.getElementById("mailmerge-send-total").textContent = window.messages.length;
			document.getElementById("mailmerge-send-time").textContent = "00 : 00 : 00";
			
			let { options } = await messenger.storage.local.get("options");
			
			document.getElementById("mailmerge-send-betawarning").style.display = (
				(options?.["mailmerge-options-beta-checkbox"] ?? false)
			) ? "block" : "none";
			
			document.getElementById("mailmerge-send-encryptionwarning").style.display = (
				(compose.details.selectedEncryptionTechnology?.encryptBody ?? false) || (compose.details.selectedEncryptionTechnology?.signMessage ?? false)
			) ? "block" : "none";
			
			document.getElementById("mailmerge-send-delivermodewarning").style.display = (
				(document.getElementById("mailmerge-dialog-delivermode").value === "SendNow")
			) ? "block" : "none";
			
			document.getElementById("mailmerge-send-start").disabled = (window.messages.length === 0);
			
			document.getElementById("mailmerge-send").classList.toggle("active");
			
		},
		
		async accept() {
			
			// console.log("mailmerge.send.accept()");
			
			document.getElementById("mailmerge-send").classList.toggle("active");
			
			document.getElementById("mailmerge-send-current").textContent = "0";
			document.getElementById("mailmerge-send-total").textContent = "0";
			document.getElementById("mailmerge-send-time").textContent = "00 : 00 : 00";
			
			document.getElementById("mailmerge-dialog").classList.toggle("active");
			
		},
		
		async start() {
			
			// console.log("mailmerge.send.start()");
			
			document.getElementById("mailmerge-send-accept").disabled = document.getElementById("mailmerge-send-start").disabled = true;
			
			/* interval begin */
			let time = new Date();
			let interval = window.setInterval(() => { mailmerge.send.time(time, new Date()); }, 1000);
			/* interval end */
			
			let { options } = await messenger.storage.local.get("options");
			
			for (let i = 1; i <= window.messages.length; i++) {
				
				document.getElementById("mailmerge-send-current").textContent = i;
				
				let { details, extras } = await mailmerge.utils.compose(i);
				
				if (details != null && extras != null) {
					
					let pause = (document.getElementById("mailmerge-dialog-batch-pause-checkbox").checked) ? document.getElementById("mailmerge-dialog-batch-pause").valueAsNumber : 0;
					if (pause !== 0) {
						
						pause = (document.getElementById("mailmerge-dialog-batch-pause-random").checked) ? Math.round(Math.random() * pause) : pause;
						
						function sleep(ms) {
							return new Promise((resolve, reject) => { window.setTimeout(() => { resolve(); }, ms) });
						}
						
						await sleep(pause * 1000);
						
					}
					
					if ((options?.["mailmerge-options-beta-checkbox"] ?? false)) {
						
						let popup = await messenger.compose.beginNew(details);
						
						switch (document.getElementById("mailmerge-dialog-delivermode").value) {
							
							case "SaveAsDraft":
								
								await messenger.compose.saveMessage(popup.id, { mode: "draft" });
								await messenger.windows.remove(popup.windowId);
								break;
								
							case "SendLater":
								
								await messenger.compose.sendMessage(popup.id, { mode: "sendLater" });
								// await messenger.windows.remove(popup.windowId);
								break;
								
							case "SendNow":
								
								await messenger.compose.sendMessage(popup.id, { mode: "sendNow" });
								// await messenger.windows.remove(popup.windowId);
								break;
								
							default:
							
						}
						
					} else {
						
						try {
							
							await messenger.mailmerge.compose.send(compose.tab, details, extras);
							
						} catch(e) {
							
							await mailmerge.error.alert(e.name, e.message);
							window.close();
							
						}
						
					}
					
				}
				
			}
			
			/* interval begin */
			window.clearInterval(interval);
			/* interval end */
			
			document.getElementById("mailmerge-send-accept").disabled = document.getElementById("mailmerge-send-start").disabled = false;
			
			await messenger.notifications.create({
				
				type: "basic",
				title: "Mail Merge",
				message: await messenger.i18n.getMessage("mailmerge.notifications.finished", [window.messages.length, document.getElementById("mailmerge-send-time").textContent]),
				
			});
			
			await messenger.tabs.remove(compose.tab);
			
		},
		
		time(start, stop) {
			
			// console.log("mailmerge.send.time()");
			
			let time = Math.round((stop - start) / 1000);
			
			let hours = Math.floor(time / 3600);
			if (hours < 10) { hours = "0" + hours; }
			
			let minutes = Math.floor(time % 3600 / 60);
			if (minutes < 10) { minutes = "0" + minutes; }
			
			let seconds = Math.floor(time % 3600 % 60);
			if (seconds < 10) { seconds = "0" + seconds; }
			
			document.getElementById("mailmerge-send-time").textContent = hours + " : " + minutes + " : " + seconds;
			
		},
		
	},
	
	utils: {
		
		async init() {
			
			// console.log("mailmerge.utils.init()");
			
			window.messages = [];
			
			if (
				document.getElementById("mailmerge-dialog-source").value === "CardBook"
			) {
				
				let addressbooks = await cardbook.addressbooks();
				
				label : for (let to of compose.details.to) {
					
					if (to.includes("{{") && to.includes("}}")) {
						
						for (let addressbook of addressbooks) {
							
							let id = document.getElementById("mailmerge-dialog-cardbook-addressbook").value;
							if ((id === "" && addressbook.type !== "SEARCH") || (id !== "" && id === addressbook.id)) {
								
								addressbook.contacts = (addressbook.contacts ?? await cardbook.contacts(addressbook.id));
								
								for (let contact of addressbook.contacts) {
									
									let object = {};
									
									for (let [ key , value ] of Object.entries(contact)) {
										object[(key ?? "")] = (value ?? "");
									}
									
									window.messages.push({ to: [ to ], object });
									
								}
								
							}
							
						}
						
						continue label;
						
					}
					
					if (to.includes("@")) {
						
						let objPattern = /\s*(?:(.*) <(.*)>|(.*))\s*/;
						let arrMatches = objPattern.exec(to);
						
						for (let addressbook of addressbooks) {
							
							let id = document.getElementById("mailmerge-dialog-cardbook-addressbook").value;
							if ((id === "" && addressbook.type !== "SEARCH") || (id !== "" && id === addressbook.id)) {
								
								addressbook.contacts = (addressbook.contacts ?? await cardbook.contacts(addressbook.id));
								
								for (let contact of addressbook.contacts) {
									
									for (let i = 0; i < contact.email.length; i++) {
										
										if ((contact.email[i][0][0] ?? "").toLowerCase().trim() === (arrMatches[2] ?? arrMatches[3] ?? "").toLowerCase().trim()) {
											
											let object = {};
											
											for (let [ key , value ] of Object.entries(contact)) {
												object[(key ?? "")] = (value ?? "");
											}
											
											window.messages.push({ to: [ to ], object });
											
											continue label;
											
										}
										
									}
									
								}
								
							}
							
						}
						
						window.messages.push({ to: [ to ], object: null });
						
						continue label;
						
					}
					
				}
				
			}
			
			if (
				document.getElementById("mailmerge-dialog-source").value === "AddressBook"
			) {
				
				let addressbooks = await messenger.addressBooks.list();
				
				label : for (let to of compose.details.to) {
					
					if (to.includes("{{") && to.includes("}}")) {
						
						for (let addressbook of addressbooks) {
							
							let id = document.getElementById("mailmerge-dialog-addressbook-addressbook").value;
							if (id === "" || id === addressbook.id) {
								
								addressbook.contacts = (addressbook.contacts ?? await messenger.contacts.list(addressbook.id));
								
								for (let contact of addressbook.contacts) {
									
									let object = {};
									
									for (let [ key , value ] of Object.entries(contact.properties)) {
										object[(key ?? "")] = (value ?? "");
									}
									
									window.messages.push({ to: [ to ], object });
									
								}
								
							}
							
						}
						
						continue label;
						
					}
					
					if (to.includes("@")) {
						
						let objPattern = /\s*(?:(.*) <(.*)>|(.*))\s*/;
						let arrMatches = objPattern.exec(to);
						
						for (let addressbook of addressbooks) {
							
							let id = document.getElementById("mailmerge-dialog-addressbook-addressbook").value;
							if (id === "" || id === addressbook.id) {
								
								addressbook.contacts = (addressbook.contacts ?? await messenger.contacts.list(addressbook.id));
								
								for (let contact of addressbook.contacts) {
									
									if ((contact.properties["PrimaryEmail"] ?? "").toLowerCase().trim() === (arrMatches[2] ?? arrMatches[3] ?? "").toLowerCase().trim()) {
										
										let object = {};
										
										for (let [ key , value ] of Object.entries(contact.properties)) {
											object[(key ?? "")] = (value ?? "");
										}
										
										window.messages.push({ to: [ to ], object });
										
										continue label;
										
									}
									
								}
								
							}
							
						}
						
						window.messages.push({ to: [ to ], object: null });
						
						continue label;
						
					}
					
				}
				
			}
			
			if (
				document.getElementById("mailmerge-dialog-source").value === "CSV" ||
				document.getElementById("mailmerge-dialog-source").value === "JSON" ||
				document.getElementById("mailmerge-dialog-source").value === "XLSX"
			) {
				
				let file;
				
				if (document.getElementById("mailmerge-dialog-source").value === "CSV") {
					file = await mailmerge.utils.csv();
				}
				
				if (document.getElementById("mailmerge-dialog-source").value === "JSON") {
					file = await mailmerge.utils.json();
				}
				
				if (document.getElementById("mailmerge-dialog-source").value === "XLSX") {
					file = await mailmerge.utils.xlsx();
				}
				
				if (file != null) {
					
					file.json[0] = file.json[0].map(e => e.replaceAll("{","").replaceAll("|","").replaceAll("}","").trim());
					
					for (let i = 1; i < file.json.length; i++) {
						
						let object = {};
						
						for (let j = 0; j < file.json[i].length; j++) {
							object[(file.json[0][j] ?? "")] = (file.json[i][j] ?? "");
						}
						
						window.messages.push({ to: compose.details.to, object });
						
					}
					
				}
				
			}
			
			/* filter begin */
			window.messages = window.messages.filter(array => array.to.some(subarray => mailmerge.utils.substitute(subarray, array.object).includes("@")));
			/* filter end */
			
			/* stop begin */
			let stop = (document.getElementById("mailmerge-dialog-batch-stop-checkbox").checked) ? document.getElementById("mailmerge-dialog-batch-stop").valueAsNumber : window.messages.length;
			window.messages.splice(stop);
			/* stop end */
			
			/* start begin */
			let start = (document.getElementById("mailmerge-dialog-batch-start-checkbox").checked) ? document.getElementById("mailmerge-dialog-batch-start").valueAsNumber : 1;
			window.messages.splice(0, start - 1);
			/* start end */
			
		},
		
		async compose(index) {
			
			// console.log("mailmerge.utils.compose()");
			
			let message = window.messages[index - 1];
			if (message != null) {
				
				let details = {};
				
				details.identityId = compose.details.identityId;
				
				details.attachVCard = compose.details.attachVCard;
				details.deliveryFormat = compose.details.deliveryFormat;
				details.deliveryStatusNotification = compose.details.deliveryStatusNotification;
				details.priority = compose.details.priority;
				details.returnReceipt = compose.details.returnReceipt;
				details.isPlainText = compose.details.isPlainText;
				
				details.from = mailmerge.utils.substitute(compose.details.from, message.object);
				details.to = message.to.map(e => mailmerge.utils.substitute(e, message.object)).filter(e => e.includes("@")).join(", ");
				details.cc = compose.details.cc.map(e => mailmerge.utils.substitute(e, message.object)).filter(e => e.includes("@")).join(", ");
				details.bcc = compose.details.bcc.map(e => mailmerge.utils.substitute(e, message.object)).filter(e => e.includes("@")).join(", ");
				details.replyTo = compose.details.replyTo.map(e => mailmerge.utils.substitute(e, message.object)).filter(e => e.includes("@")).join(", ");
				details.subject = mailmerge.utils.substitute(compose.details.subject, message.object);
				details.body = mailmerge.utils.substitute(compose.details.body, message.object);
				details.plainTextBody = mailmerge.utils.substitute(compose.details.plainTextBody, message.object);
				
				details.attachments = [];
				
				if (compose.details.attachments != null) {
					
					for (let attachment of compose.details.attachments) {
						
						let file = await messenger.compose.getAttachmentFile(attachment.id);
						if (file != null) {
							details.attachments.push({ name: attachment.name, file });
						}
						
					}
					
					let attachments = (document.getElementById("mailmerge-dialog-attachments-checkbox").checked) ? document.getElementById("mailmerge-dialog-attachments-attachments").value : "";
					attachments = mailmerge.utils.substitute(attachments, message.object);
					attachments = attachments.replaceAll("\r","\n").split("\n");
					
					for (let attachment of attachments) {
						
						if (attachment === "") { continue; }
						
						let files = document.getElementById("mailmerge-dialog-attachments-file").files;
						for (let file of files) {
							
							if (file.name === attachment) {
								details.attachments.push({ name: file.name, file });
							}
							
						}
						
					}
					
				}
				
				details.customHeaders = [];
				
				if (compose.details.customHeaders != null) {
					
					for (let header of compose.details.customHeaders) {
						details.customHeaders.push({ name: header.name, value: mailmerge.utils.substitute(header.value, message.object) });
					}
					
				}
				
				if (document.getElementById("mailmerge-dialog-delivermode").value === "SaveAsDraft" && await sendlater.active()) {
					
					let at = (document.getElementById("mailmerge-dialog-sendlater-at-checkbox").checked) ? document.getElementById("mailmerge-dialog-sendlater-at").value : "";
					at = mailmerge.utils.substitute(at, message.object);
					
					if (at !== "") {
						
						try {
							
							let date = new Date(await sendlater.date(at));
							
							if (date.toString() === "Invalid Date") { throw new Error("Invalid Date"); }
							
							let recur = (document.getElementById("mailmerge-dialog-sendlater-recur-checkbox").checked) ? document.getElementById("mailmerge-dialog-sendlater-recur").value : "";
							if (recur === "") {
								recur = "none";
							}
							if (recur === "monthly") {
								recur = "monthly" + " " + date.getDate();
							}
							if (recur === "yearly") {
								recur = "yearly" + " " + date.getMonth() + " " + date.getDate();
							}
							
							let every = (document.getElementById("mailmerge-dialog-sendlater-every-checkbox").checked) ? document.getElementById("mailmerge-dialog-sendlater-every").value : "";
							if (every !== "") {
								every = " " + "/" + " " + Number(every);
							}
							
							let between = (document.getElementById("mailmerge-dialog-sendlater-between-checkbox").checked) ? document.getElementById("mailmerge-dialog-sendlater-between").value : "";
							if (between !== "") {
								between = " " + "between" + " " + between.replaceAll(":","").replaceAll("-"," ").replaceAll("  "," ");
							}
							
							let only = (document.getElementById("mailmerge-dialog-sendlater-only-checkbox").checked) ? document.getElementById("mailmerge-dialog-sendlater-only").dataset.value : "";
							if (only !== "") {
								only = " " + "on" + " " + only.replaceAll(","," ").trim();
							}
							
							let until = (document.getElementById("mailmerge-dialog-sendlater-until-checkbox").checked) ? document.getElementById("mailmerge-dialog-sendlater-until").value : "";
							if (until !== "") {
								until = new Date(until);
								until = " " + "until" + " " + until.toISOString();
							}
							
							details.customHeaders.push({ name: "X-Send-Later-Uuid", value: await sendlater.uuid() });
							details.customHeaders.push({ name: "X-Send-Later-At", value: date.toUTCString() });
							details.customHeaders.push({ name: "X-Send-Later-Recur", value: recur + every + between + only + until });
							
						} catch(e) { console.warn(e); }
						
					}
					
				}
				
				let extras = {};
				
				extras.body = compose.details.body;
				extras.delivermode = document.getElementById("mailmerge-dialog-delivermode").value;
				
				extras.listHeaders = [];
				
				if (compose.extras.listHeaders != null) {
					
					for (let header of compose.extras.listHeaders) {
						extras.listHeaders.push({ name: header.name, value: mailmerge.utils.substitute(header.value, message.object) });
					}
					
				}
				
				return { details, extras };
				
			} else {
				
				return {};
				
			}
			
		},
		
		async csv() {
			
			// console.log("mailmerge.utils.csv()");
			
			try {
				
				let params = {
					
					file: document.getElementById("mailmerge-dialog-csv-file").files[0],
					characterset: document.getElementById("mailmerge-dialog-csv-characterset").value,
					fielddelimiter: document.getElementById("mailmerge-dialog-csv-fielddelimiter").value,
					
				};
				
				if (params.file == null) { return; }
				
				function readAsText() {
					
					return new Promise((resolve, reject) => {
						
						let reader = new FileReader();
						
						reader.onload = function(e) {
							resolve(e.target.result);
						}
						
						reader.onerror = function(e) {
							reject(e.target.error);
						}
						
						reader.readAsText(params.file, params.characterset);
						
					});
					
				}
				
				let bytes = await readAsText();
				let workbook = XLSX.read(bytes, { type: "string", raw: true, FS: params.fielddelimiter });
				let sheet = workbook.Sheets[(workbook.SheetNames[0])];
				let json = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" });
				
				return { name: params.file.name, json };
				
			} catch(e) { console.warn(e); await mailmerge.error.alert(e.name, e.message); }
			
		},
		
		async json() {
			
			// console.log("mailmerge.utils.json()");
			
			try {
				
				let params = {
					
					file: document.getElementById("mailmerge-dialog-json-file").files[0],
					characterset: "utf-8",
					
				};
				
				if (params.file == null) { return; }
				
				function readAsText() {
					
					return new Promise((resolve, reject) => {
						
						let reader = new FileReader();
						
						reader.onload = function(e) {
							resolve(e.target.result);
						}
						
						reader.onerror = function(e) {
							reject(e.target.error);
						}
						
						reader.readAsText(params.file, params.characterset);
						
					});
					
				}
				
				let bytes = await readAsText();
				let json = JSON.parse(bytes);
				
				return { name: params.file.name, json };
				
			} catch(e) { console.warn(e); await mailmerge.error.alert(e.name, e.message); }
			
		},
		
		async xlsx() {
			
			// console.log("mailmerge.utils.xlsx()");
			
			try {
				
				let params = {
					
					file: document.getElementById("mailmerge-dialog-xlsx-file").files[0],
					sheetname: (document.getElementById("mailmerge-dialog-xlsx-sheetname-checkbox").checked) ? document.getElementById("mailmerge-dialog-xlsx-sheetname").value : "",
					
				};
				
				if (params.file == null) { return; }
				
				function readAsArrayBuffer() {
					
					return new Promise((resolve, reject) => {
						
						let reader = new FileReader();
						
						reader.onload = function(e) {
							resolve(e.target.result);
						}
						
						reader.onerror = function(e) {
							reject(e.target.error);
						}
						
						reader.readAsArrayBuffer(params.file);
						
					});
					
				}
				
				let bytes = await readAsArrayBuffer();
				let workbook = XLSX.read(bytes, { type: "array", raw: true });
				let sheet = workbook.Sheets[(params.sheetname || workbook.SheetNames[0])];
				let json = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" });
				
				return { name: params.file.name, json };
				
			} catch(e) { console.warn(e); await mailmerge.error.alert(e.name, e.message); }
			
		},
		
		substitute(string, object) {
			
			// console.log("mailmerge.utils.substitute()");
			
			if (string.includes("{{") && string.includes("}}")) {
				
				let objPattern, arrMatches;
				
				objPattern = /[{][{]([^|{}]*?)[}][}]/;
				arrMatches = objPattern.exec(string);
				
				if (arrMatches != null) {
					
					/* {{name}} */
					string = string.replaceAll(arrMatches[0], () => mailmerge.utils.replace(arrMatches[1], object));
					return mailmerge.utils.substitute(string, object);
					
				}
				
				objPattern = /[{][{]([^|{}]*?)[|]([^|{}]*?)[|]([^|{}]*?)[}][}]/;
				arrMatches = objPattern.exec(string);
				
				if (arrMatches != null) {
					
					/* {{name|if|then}} */
					string = (mailmerge.utils.replace(arrMatches[1], object) === arrMatches[2]) ? string.replaceAll(arrMatches[0], () => arrMatches[3]) : string.replaceAll(arrMatches[0], () => "");
					return mailmerge.utils.substitute(string, object);
					
				}
				
				objPattern = /[{][{]([^|{}]*?)[|]([^|{}]*?)[|]([^|{}]*?)[|]([^|{}]*?)[}][}]/;
				arrMatches = objPattern.exec(string);
				
				if (arrMatches != null) {
					
					/* {{name|if|then|else}} */
					string = (mailmerge.utils.replace(arrMatches[1], object) === arrMatches[2]) ? string.replaceAll(arrMatches[0], () => arrMatches[3]) : string.replaceAll(arrMatches[0], () => arrMatches[4]);
					return mailmerge.utils.substitute(string, object);
					
				}
				
				objPattern = /[{][{]([^|{}]*?)[|]([^|{}]*?)[|]([^|{}]*?)[|]([^|{}]*?)[|]([^|{}]*?)[}][}]/;
				arrMatches = objPattern.exec(string);
				
				if (arrMatches != null) {
					
					if (arrMatches[2] === "*") {
						
						/* {{name|*|if|then|else}} */
						string = (mailmerge.utils.replace(arrMatches[1], object).includes(arrMatches[3])) ? string.replaceAll(arrMatches[0], () => arrMatches[4]) : string.replaceAll(arrMatches[0], () => arrMatches[5]);
						return mailmerge.utils.substitute(string, object);
						
					}
					
					if (arrMatches[2] === "^") {
						
						/* {{name|^|if|then|else}} */
						string = (mailmerge.utils.replace(arrMatches[1], object).startsWith(arrMatches[3])) ? string.replaceAll(arrMatches[0], () => arrMatches[4]) : string.replaceAll(arrMatches[0], () => arrMatches[5]);
						return mailmerge.utils.substitute(string, object);
						
					}
					
					if (arrMatches[2] === "$") {
						
						/* {{name|$|if|then|else}} */
						string = (mailmerge.utils.replace(arrMatches[1], object).endsWith(arrMatches[3])) ? string.replaceAll(arrMatches[0], () => arrMatches[4]) : string.replaceAll(arrMatches[0], () => arrMatches[5]);
						return mailmerge.utils.substitute(string, object);
						
					}
					
				}
				
				if (arrMatches != null) {
					
					if (arrMatches[2] === "==") {
						
						/* {{name|==|if|then|else}} */
						string = (Number(mailmerge.utils.replace(arrMatches[1], object).replace(",",".")) == Number(arrMatches[3].replace(",","."))) ? string.replaceAll(arrMatches[0], () => arrMatches[4]) : string.replaceAll(arrMatches[0], () => arrMatches[5]);
						return mailmerge.utils.substitute(string, object);
						
					}
					
					if (arrMatches[2] === ">" || arrMatches[2] === "&gt;") {
						
						/* {{name|>|if|then|else}} */
						string = (Number(mailmerge.utils.replace(arrMatches[1], object).replace(",",".")) > Number(arrMatches[3].replace(",","."))) ? string.replaceAll(arrMatches[0], () => arrMatches[4]) : string.replaceAll(arrMatches[0], () => arrMatches[5]);
						return mailmerge.utils.substitute(string, object);
						
					}
					
					if (arrMatches[2] === ">=" || arrMatches[2] === "&gt;=") {
						
						/* {{name|>=|if|then|else}} */
						string = (Number(mailmerge.utils.replace(arrMatches[1], object).replace(",",".")) >= Number(arrMatches[3].replace(",","."))) ? string.replaceAll(arrMatches[0], () => arrMatches[4]) : string.replaceAll(arrMatches[0], () => arrMatches[5]);
						return mailmerge.utils.substitute(string, object);
						
					}
					
					if (arrMatches[2] === "<" || arrMatches[2] === "&lt;") {
						
						/* {{name|<|if|then|else}} */
						string = (Number(mailmerge.utils.replace(arrMatches[1], object).replace(",",".")) < Number(arrMatches[3].replace(",","."))) ? string.replaceAll(arrMatches[0], () => arrMatches[4]) : string.replaceAll(arrMatches[0], () => arrMatches[5]);
						return mailmerge.utils.substitute(string, object);
						
					}
					
					if (arrMatches[2] === "<=" || arrMatches[2] === "&lt;=") {
						
						/* {{name|<=|if|then|else}} */
						string = (Number(mailmerge.utils.replace(arrMatches[1], object).replace(",",".")) <= Number(arrMatches[3].replace(",","."))) ? string.replaceAll(arrMatches[0], () => arrMatches[4]) : string.replaceAll(arrMatches[0], () => arrMatches[5]);
						return mailmerge.utils.substitute(string, object);
						
					}
					
				}
				
			}
			
			return string;
			
		},
		
		replace(string, object) {
			
			// console.log("mailmerge.utils.replace()");
			
			if (string == null || object == null) { return ""; }
			
			string = string.split("#");
			
			string[0] = (string[0]?.trim() ?? "");
			string[1] = (string[1]?.trim() ?? "");
			string[2] = (string[2]?.trim() ?? "0");
			
			if (
				document.getElementById("mailmerge-dialog-source").value === "CardBook"
			) {
				
				switch (string[0]) {
					
					case "adr":
					case "email":
					case "impp":
					case "tel":
					case "url":
						
						object = object[string[0]];
						object = object.filter((e) => { return (string[1] !== "") ? (e[1].some((e) => { return (e.replace(/TYPE=/i,"").toUpperCase() === string[1].replace(/TYPE=/i,"").toUpperCase()); })) : true; });
						object = (object[string[2]] != null) ? object[string[2]][0] : "";
						return object.toString();
						
					case "adrpostoffice":
						
						object = object["adr"];
						object = object.filter((e) => { return (string[1] !== "") ? (e[1].some((e) => { return (e.replace(/TYPE=/i,"").toUpperCase() === string[1].replace(/TYPE=/i,"").toUpperCase()); })) : true; });
						object = (object[string[2]] != null) ? object[string[2]][0][0] : "";
						return object.toString();
						
					case "adrextended":
						
						object = object["adr"];
						object = object.filter((e) => { return (string[1] !== "") ? (e[1].some((e) => { return (e.replace(/TYPE=/i,"").toUpperCase() === string[1].replace(/TYPE=/i,"").toUpperCase()); })) : true; });
						object = (object[string[2]] != null) ? object[string[2]][0][1] : "";
						return object.toString();
						
					case "adrstreet":
						
						object = object["adr"];
						object = object.filter((e) => { return (string[1] !== "") ? (e[1].some((e) => { return (e.replace(/TYPE=/i,"").toUpperCase() === string[1].replace(/TYPE=/i,"").toUpperCase()); })) : true; });
						object = (object[string[2]] != null) ? object[string[2]][0][2] : "";
						return object.toString();
						
					case "adrlocality":
						
						object = object["adr"];
						object = object.filter((e) => { return (string[1] !== "") ? (e[1].some((e) => { return (e.replace(/TYPE=/i,"").toUpperCase() === string[1].replace(/TYPE=/i,"").toUpperCase()); })) : true; });
						object = (object[string[2]] != null) ? object[string[2]][0][3] : "";
						return object.toString();
						
					case "adrregion":
						
						object = object["adr"];
						object = object.filter((e) => { return (string[1] !== "") ? (e[1].some((e) => { return (e.replace(/TYPE=/i,"").toUpperCase() === string[1].replace(/TYPE=/i,"").toUpperCase()); })) : true; });
						object = (object[string[2]] != null) ? object[string[2]][0][4] : "";
						return object.toString();
						
					case "adrpostalcode":
						
						object = object["adr"];
						object = object.filter((e) => { return (string[1] !== "") ? (e[1].some((e) => { return (e.replace(/TYPE=/i,"").toUpperCase() === string[1].replace(/TYPE=/i,"").toUpperCase()); })) : true; });
						object = (object[string[2]] != null) ? object[string[2]][0][5] : "";
						return object.toString();
						
					case "adrcountry":
						
						object = object["adr"];
						object = object.filter((e) => { return (string[1] !== "") ? (e[1].some((e) => { return (e.replace(/TYPE=/i,"").toUpperCase() === string[1].replace(/TYPE=/i,"").toUpperCase()); })) : true; });
						object = (object[string[2]] != null) ? object[string[2]][0][6] : "";
						return object.toString();
						
					case "categories":
						
						object = object[string[0]];
						object = object.filter((e) => { return (string[1] !== "") ? (e.toUpperCase() === string[1].toUpperCase()) : true; });
						return object.toString();
						
					case "others":
						
						object = object[string[0]];
						object = object.filter((e) => { return (string[1] !== "") ? (e.split(":")[0].split(";")[0].toUpperCase() === string[1].toUpperCase()) : true; });
						object = object.map((e) => { return e.split(":")[1]; });
						return object.toString();
						
					default:
						return (object[string[0]] ?? "");
					
				}
				
			}
			
			if (
				document.getElementById("mailmerge-dialog-source").value === "AddressBook"
			) {
				return (object[string[0]] ?? "");
			}
			
			if (
				document.getElementById("mailmerge-dialog-source").value === "CSV" ||
				document.getElementById("mailmerge-dialog-source").value === "JSON" ||
				document.getElementById("mailmerge-dialog-source").value === "XLSX"
			) {
				return (object[string[0]] ?? "");
			}
			
		},
		
	},
	
	error: {
		
		async alert(title, message) {
			
			// console.log("mailmerge.error.alert()");
			
			document.querySelectorAll(".tab").forEach((e) => { e.inert = true });
			
			document.getElementById("mailmerge-error").classList.toggle("active");
			document.getElementById("mailmerge-error-alert").classList.toggle("active");
			
			document.getElementById("mailmerge-error-alert-title").textContent = title;
			document.getElementById("mailmerge-error-alert-message").textContent = message;
			
			await new Promise((resolve, reject) => {
				
				document.getElementById("mailmerge-error-alert-accept").addEventListener("click", () => resolve("accept"));
				
			});
			
			document.getElementById("mailmerge-error-alert").classList.toggle("active");
			document.getElementById("mailmerge-error").classList.toggle("active");
			
			document.querySelectorAll(".tab").forEach((e) => { e.inert = false });
			
		},
		
		async confirm(title, message) {
			
			// console.log("mailmerge.error.confirm()");
			
			document.querySelectorAll(".tab").forEach((e) => { e.inert = true });
			
			document.getElementById("mailmerge-error").classList.toggle("active");
			document.getElementById("mailmerge-error-confirm").classList.toggle("active");
			
			document.getElementById("mailmerge-error-confirm-title").textContent = title;
			document.getElementById("mailmerge-error-confirm-message").textContent = message;
			
			await new Promise((resolve, reject) => {
				
				document.getElementById("mailmerge-error-confirm-accept").addEventListener("click", () => resolve("accept"));
				document.getElementById("mailmerge-error-confirm-cancel").addEventListener("click", () => resolve("cancel"));
				
			});
			
			document.getElementById("mailmerge-error-confirm").classList.toggle("active");
			document.getElementById("mailmerge-error").classList.toggle("active");
			
			document.querySelectorAll(".tab").forEach((e) => { e.inert = false });
			
		},
		
	},
	
};

var cardbook = {
	
	async active() {
		
		// console.log("cardbook.active()");
		
		let addons = await messenger.management.getAll();
		return (addons.find(e => e.id === "cardbook@vigneau.philippe")?.enabled ?? false);
		
	},
	
	async addressbooks(id) {
		
		// console.log("cardbook.addressbooks()");
		
		let addressbooks = await messenger.runtime.sendMessage("cardbook@vigneau.philippe", { query: "mailmerge.getAddressBooks", id });
		addressbooks = addressbooks.filter(e => e.enabled);
		return addressbooks;
		
	},
	
	async contacts(id) {
		
		// console.log("cardbook.contacts()");
		
		let contacts = await messenger.runtime.sendMessage("cardbook@vigneau.philippe", { query: "mailmerge.getContacts", id });
		return contacts;
		
	},
	
};

var sendlater = {
	
	async active() {
		
		// console.log("sendlater.active()");
		
		let addons = await messenger.management.getAll();
		return (addons.find(e => e.id === "sendlater3@kamens.us")?.enabled ?? false);
		
	},
	
	async uuid() {
		
		// console.log("sendlater.uuid()");
		
		let uuid = await messenger.runtime.sendMessage("sendlater3@kamens.us", { action: "getUUID" });
		return uuid;
		
	},
	
	async date(value) {
		
		// console.log("sendlater.date()");
		
		let date = await messenger.runtime.sendMessage("sendlater3@kamens.us", { action: "parseDate", value });
		return date;
		
	},
	
};
