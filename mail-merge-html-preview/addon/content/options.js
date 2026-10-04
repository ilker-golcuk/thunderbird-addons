"use strict";
// console.log("options.js");

document.addEventListener("DOMContentLoaded", async (e) => {
	
	// console.log("DOMContentLoaded");
	
	document.getElementById("mailmerge-options-load").style.visibility = "hidden";
	document.getElementById("mailmerge-options-reset").addEventListener("click", mailmerge.options.reset);
	document.getElementById("mailmerge-options-save").style.visibility = "hidden";
	
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
	
	elements = document.querySelector("#mailmerge-options .content").querySelectorAll("input[type='number']");
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
	
	elements = document.querySelector("#mailmerge-options .content").querySelectorAll("input , select , textarea");
	for (let element of elements) {
		
		element.addEventListener("change", mailmerge.options.change);
		
	}
	
	await mailmerge.options.load();
	
});

var mailmerge = {
	
	options: {
		
		async init(prefs) {
			
			// console.log("mailmerge.options.init()");
			
			document.getElementById("mailmerge-options-recipientsreminder").value = (prefs?.["mailmerge-options-recipientsreminder"] ?? "1");
			
			document.getElementById("mailmerge-options-saveastemplate-checkbox").checked = (prefs?.["mailmerge-options-saveastemplate-checkbox"] ?? true);
			document.getElementById("mailmerge-options-recipientsreminder-checkbox").checked = (prefs?.["mailmerge-options-recipientsreminder-checkbox"] ?? true);
			document.getElementById("mailmerge-options-variablesreminder-checkbox").checked = (prefs?.["mailmerge-options-variablesreminder-checkbox"] ?? true);
			
			document.getElementById("mailmerge-options-beta-checkbox").checked = (prefs?.["mailmerge-options-beta-checkbox"] ?? false);
			
			await mailmerge.options.change();
			
		},
		
		async prefs() {
			
			// console.log("mailmerge.options.prefs()");
			
			let prefs = {};
			
			prefs.version = 1;
			
			prefs["mailmerge-options-recipientsreminder"] = document.getElementById("mailmerge-options-recipientsreminder").value;
			
			prefs["mailmerge-options-saveastemplate-checkbox"] = document.getElementById("mailmerge-options-saveastemplate-checkbox").checked;
			prefs["mailmerge-options-recipientsreminder-checkbox"] = document.getElementById("mailmerge-options-recipientsreminder-checkbox").checked;
			prefs["mailmerge-options-variablesreminder-checkbox"] = document.getElementById("mailmerge-options-variablesreminder-checkbox").checked;
			
			prefs["mailmerge-options-beta-checkbox"] = document.getElementById("mailmerge-options-beta-checkbox").checked;
			
			return { prefs };
			
		},
		
		async check() {
			
			// console.log("mailmerge.options.check()");
			
			let elements = document.querySelector("#mailmerge-options .content").querySelectorAll("input , select , textarea");
			for (let element of elements) {
				
				if (element.checkValidity()) { continue; }
				
				await mailmerge.error.alert("Error", element.validationMessage);
				element.focus();
				return false;
				
			}
			
			return true;
			
		},
		
		async load() {
			
			// console.log("mailmerge.options.load()");
			
			let { options } = await messenger.storage.local.get("options");
			await mailmerge.options.init(options);
			
		},
		
		async reset() {
			
			// console.log("mailmerge.options.reset()");
			
			await messenger.storage.local.remove("options");
			await mailmerge.options.init();
			
		},
		
		async save() {
			
			// console.log("mailmerge.options.save()");
			
			if (await mailmerge.options.check() === false) { return; }
			
			let { prefs } = await mailmerge.options.prefs();
			await messenger.storage.local.set({ options: prefs });
			
		},
		
		async change() {
			
			// console.log("mailmerge.options.change()");
			
			document.getElementById("mailmerge-options-recipientsreminder-minus").disabled = document.getElementById("mailmerge-options-recipientsreminder").disabled = document.getElementById("mailmerge-options-recipientsreminder-plus").disabled = !(document.getElementById("mailmerge-options-recipientsreminder-checkbox").checked);
			
			await mailmerge.options.save();
			
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
