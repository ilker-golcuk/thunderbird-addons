"use strict";
// Rendered message preview for the "Message" tab.
// Local customization of Mail Merge 11.6.1 (Alexander Bergmann), GPL-3.0 like Mail Merge.

var mailmergePreview = {
	
	request: 0,
	number: 0,
	details: null,
	remote: false,
	survey: null,
	
	init() {
		
		for (let mode of ["wide", "mobile"]) {
			document.getElementById("mailmerge-preview-" + mode).addEventListener("click", () => mailmergePreview.viewport(mode));
		}
		
	},
	
	text(key, ...substitutions) {
		return messenger.i18n.getMessage("mailmerge.preview." + key, substitutions.map(String));
	},
	
	/* Every preview request gets a number, so a slow earlier request cannot overwrite a newer one. */
	begin() {
		return ++mailmergePreview.request;
	},
	
	current(request) {
		return request === mailmergePreview.request;
	},
	
	update(number, details) {
		
		mailmergePreview.number = number;
		mailmergePreview.details = details ?? null;
		mailmergePreview.navigation(number, window.messages.length);
		mailmergePreview.render();
		
	},
	
	clear() {
		
		mailmergePreview.request++;
		mailmergePreview.number = 0;
		mailmergePreview.details = null;
		mailmergePreview.remote = false;
		mailmergePreview.survey = null;
		mailmergePreview.render();
		
	},
	
	viewport(mode) {
		
		document.getElementById("mailmerge-message-body").dataset.viewport = mode;
		for (let candidate of ["wide", "mobile"]) {
			document.getElementById("mailmerge-preview-" + candidate).setAttribute("aria-pressed", String(candidate === mode));
		}
		mailmergePreview.render();
		
	},
	
	navigation(current, total) {
		
		document.getElementById("mailmerge-message-total").textContent = "/ " + total;
		document.getElementById("mailmerge-message-begin").disabled = !(current > 1);
		document.getElementById("mailmerge-message-previous").disabled = !(current > 1);
		document.getElementById("mailmerge-message-next").disabled = !(current < total);
		document.getElementById("mailmerge-message-end").disabled = !(current < total);
		
		for (let name of ["cc", "bcc", "reply", "attachments", "customheaders"]) {
			let field = document.getElementById("mailmerge-message-" + name);
			field.parentElement.hidden = (field.textContent.trim() === "");
		}
		
	},
	
	render() {
		
		let frame = document.getElementById("mailmerge-message-body");
		let details = mailmergePreview.details;
		
		if (details == null) {
			frame.srcdoc = "";
			mailmergePreview.notice([]);
			return;
		}
		
		let { html, remote, unavailable } = mailmergePreview.build(details, frame.dataset.viewport);
		frame.srcdoc = html;
		
		let notes = mailmergePreview.check(details);
		if (remote > 0) {
			notes.push({ text: mailmergePreview.text("remote", remote), action: [mailmergePreview.text("remote.load"), () => {
				mailmergePreview.remote = true;
				mailmergePreview.render();
			}] });
		}
		if (unavailable > 0) {
			notes.push({ text: mailmergePreview.text("unavailable", unavailable) });
		}
		mailmergePreview.notice(notes);
		
	},
	
	notice(notes) {
		
		let notice = document.getElementById("mailmerge-preview-notice");
		notice.replaceChildren(...notes.map(note => {
			
			let line = document.createElement("p");
			line.className = (note.warning) ? "warning" : "info";
			line.textContent = note.text;
			
			if (note.action != null) {
				let button = document.createElement("button");
				button.type = "button";
				button.textContent = note.action[0];
				button.addEventListener("click", note.action[1]);
				line.append(" ", button);
			}
			
			return line;
			
		}));
		notice.hidden = (notes.length === 0);
		
	},
	
	build(details, viewport) {
		
		// DOMParser documents are inert: nothing in them runs or loads while they are cleaned.
		let parser = new DOMParser();
		let doc;
		
		if (details.isPlainText) {
			doc = parser.parseFromString("", "text/html");
			let pre = doc.createElement("pre");
			pre.style.cssText = "margin: 0; white-space: pre-wrap; overflow-wrap: anywhere;";
			pre.textContent = String(details.plainTextBody ?? "");
			doc.body.append(pre);
		} else {
			doc = parser.parseFromString(String(details.body ?? ""), "text/html");
		}
		
		let { remote, unavailable } = mailmergePreview.sanitize(doc);
		
		// The frame is also sandboxed without scripts; this policy blocks every network load
		// except remote images, and those only after the user asked for them.
		let csp = doc.createElement("meta");
		csp.setAttribute("http-equiv", "Content-Security-Policy");
		csp.setAttribute("content", "default-src 'none'; style-src 'unsafe-inline'; font-src data:; img-src data:" + ((mailmergePreview.remote) ? " https: http:" : "") + "; form-action 'none'");
		
		let referrer = doc.createElement("meta");
		referrer.setAttribute("name", "referrer");
		referrer.setAttribute("content", "no-referrer");
		
		// A srcdoc document resolves "#name" against the dialog's address, so clicking such a link
		// would load the dialog into the frame. With this base, it stays a jump inside the message.
		let base = doc.createElement("base");
		base.setAttribute("href", "about:srcdoc");
		
		// Zero-specificity defaults, so the message's own styles and body attributes still win.
		let style = doc.createElement("style");
		style.textContent = ":root { color-scheme: light; } :where(button, input, select, textarea) { pointer-events: none; }" + ((viewport === "mobile") ? " :where(img) { max-width: 100%; height: auto; }" : "");
		
		doc.head.prepend(csp, referrer, base, style);
		
		return { html: "<!DOCTYPE html>\n" + doc.documentElement.outerHTML, remote, unavailable };
		
	},
	
	sanitize(doc) {
		
		doc.querySelectorAll("script, iframe, frame, frameset, object, embed, applet, portal, meta, link, base").forEach(element => element.remove());
		doc.querySelectorAll("form").forEach(form => form.replaceWith(...form.childNodes));
		
		for (let element of doc.querySelectorAll("*")) {
			
			for (let attribute of [...element.attributes]) {
				
				let name = attribute.name.toLowerCase();
				
				if (name.startsWith("on") || ["action", "formaction", "ping", "srcset", "target"].includes(name)) {
					element.removeAttribute(attribute.name);
					continue;
				}
				
				if (name === "href" || name === "xlink:href") {
					
					let value = attribute.value.trim();
					if (value.startsWith("#")) { continue; }
					
					if (element.localName === "a" || element.localName === "area") {
						// Keep the link look and show the personalized address on hover, but never leave the preview.
						element.setAttribute(attribute.name, "#mailmerge-preview-link");
						if (!element.hasAttribute("title")) { element.setAttribute("title", value); }
					} else if (!/^data:/i.test(value)) {
						element.removeAttribute(attribute.name);
					}
					
				}
				
			}
			
		}
		
		let remote = 0;
		let unavailable = 0;
		
		for (let image of doc.querySelectorAll("img")) {
			
			let source = (image.getAttribute("src") ?? "").trim();
			if (source === "" || /^data:/i.test(source)) { continue; }
			
			if (/^https?:/i.test(source)) {
				if (mailmergePreview.remote) { continue; }
				remote++;
			} else {
				// cid:, file:, mailbox:, imap: ... are not reachable from an extension page.
				unavailable++;
			}
			
			image.setAttribute("src", mailmergePreview.placeholder(image));
			image.setAttribute("title", mailmergePreview.text("image", mailmergePreview.label(source)));
			
		}
		
		return { remote, unavailable };
		
	},
	
	placeholder(image) {
		
		let size = (name) => {
			let value = (image.getAttribute(name) ?? "").trim();
			return (/^\d+(\.\d+)?(px)?$/i.test(value)) ? Math.min(Math.max(Math.round(parseFloat(value)), 1), 2000) : 0;
		};
		
		let width = size("width");
		let height = size("height");
		if (width === 0 && height === 0) {
			width = 160;
			height = 100;
		}
		width = width || height * 2;
		height = height || Math.max(Math.round(width / 2), 1);
		
		let icon = (width >= 32 && height >= 32) ? '<g transform="translate(' + (width / 2 - 12) + ' ' + (height / 2 - 12) + ')" fill="none" stroke="#80868b" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="8" cy="10" r="2"/><path d="M3 18l6-6 4 4 3-3 5 5"/></g>' : "";
		let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '"><rect x="0.5" y="0.5" width="' + Math.max(width - 1, 0) + '" height="' + Math.max(height - 1, 0) + '" fill="#f1f3f4" stroke="#9aa0a6" stroke-dasharray="4 3"/>' + icon + '</svg>';
		
		return "data:image/svg+xml," + encodeURIComponent(svg);
		
	},
	
	label(source) {
		
		let name = source.split(/[?#]/)[0].split(/[\\/]/).pop() || source;
		try {
			name = decodeURIComponent(name);
		} catch(e) {}
		
		return (name.length > 80) ? name.slice(0, 77) + "…" : name;
		
	},
	
	check(details) {
		
		let notes = [];
		
		if (details.deliveryFormat === "plaintext" && !details.isPlainText) {
			notes.push({ text: mailmergePreview.text("plaintext") });
		}
		
		let survey = mailmergePreview.scan();
		
		if (survey.unknown.length > 0) {
			let names = survey.unknown.map(name => {
				let wanted = mailmergePreview.normalize(mailmergePreview.key(name));
				let match = (wanted === "") ? null : survey.keys.find(key => mailmergePreview.normalize(key) === wanted);
				return "{{" + name.trim() + "}}" + ((match != null) ? " → {{" + match + "}}" : "");
			});
			let formatted = survey.unknown.some(name => /[<&]/.test(name));
			notes.push({ warning: true, text: mailmergePreview.text("unknown", names.join(", ")) + ((formatted) ? " " + mailmergePreview.text("formatting") : "") });
		}
		
		let message = window.messages[mailmergePreview.number - 1];
		let empty = mailmergePreview.empty(survey, message?.object);
		if (empty.length > 0) {
			notes.push({ warning: true, text: mailmergePreview.text("empty", empty.map(name => "{{" + name.trim() + "}}").join(", ")) });
		}
		
		let rendered = String(details.subject ?? "") + "\n" + String(((details.isPlainText) ? details.plainTextBody : details.body) ?? "");
		let unresolved = [...new Set(rendered.match(/[{][{][^{}]*[}][}]/g) ?? [])].map(text => (text.length > 60) ? text.slice(0, 57) + "…" : text);
		if (unresolved.length > 0) {
			notes.push({ warning: true, text: mailmergePreview.text("unresolved", unresolved.join(", ")) });
		}
		
		if (survey.problems.length > 0) {
			let others = survey.problems.some(number => number !== mailmergePreview.number);
			notes.push({ text: mailmergePreview.text("summary", survey.problems.length, window.messages.length), action: (others) ? [mailmergePreview.text("summary.next"), mailmergePreview.next] : null });
		}
		
		return notes;
		
	},
	
	/* Merge fields of the template, checked once per recipient list. */
	scan() {
		
		if (mailmergePreview.survey?.messages === window.messages) { return mailmergePreview.survey; }
		
		let { simple, all } = mailmergePreview.fields();
		
		// Only spreadsheet-like sources have a fixed set of columns; address book cards vary.
		let tabular = ["CSV", "JSON", "XLSX"].includes(document.getElementById("mailmerge-dialog-source").value);
		let keys = [...new Set(window.messages.flatMap(message => Object.keys(message.object ?? {})))];
		let unknown = (tabular && window.messages.length > 0) ? all.filter(name => !keys.includes(mailmergePreview.key(name))) : [];
		
		let survey = { messages: window.messages, keys, unknown, simple: simple.filter(name => !unknown.includes(name)), problems: [] };
		window.messages.forEach((message, i) => {
			if (mailmergePreview.empty(survey, message.object).length > 0) { survey.problems.push(i + 1); }
		});
		
		return mailmergePreview.survey = survey;
		
	},
	
	fields() {
		
		let details = compose.details;
		let templates = [details.from, ...(details.to ?? []), ...(details.cc ?? []), ...(details.bcc ?? []), ...(details.replyTo ?? []), details.subject, (details.isPlainText) ? details.plainTextBody : details.body, ...(details.customHeaders ?? []).map(header => header.value)];
		
		let simple = new Set();
		let all = new Set();
		
		for (let template of templates) {
			
			// Innermost fields first, like mailmerge.utils.substitute().
			let text = String(template ?? "");
			let previous;
			do {
				previous = text;
				text = text.replace(/[{][{]([^{}]*)[}][}]/g, (match, inner) => {
					let parts = inner.split("|");
					all.add(parts[0]);
					if (parts.length === 1) { simple.add(parts[0]); }
					return "";
				});
			} while (text !== previous);
			
		}
		
		return { simple: [...simple], all: [...all] };
		
	},
	
	key(name) {
		return name.split("#")[0].trim();
	},
	
	normalize(name) {
		return (new DOMParser().parseFromString(String(name), "text/html").body.textContent ?? "").replace(/\s+/g, " ").trim().toLowerCase();
	},
	
	empty(survey, object) {
		
		return survey.simple.filter(name => {
			try {
				return String(mailmerge.utils.replace(name, object) ?? "").trim() === "";
			} catch(e) {
				return true;
			}
		});
		
	},
	
	next() {
		
		let problems = mailmergePreview.scan().problems;
		let index = document.getElementById("mailmerge-message-index");
		index.value = problems.find(number => number > mailmergePreview.number) ?? problems[0];
		index.dispatchEvent(new Event("change"));
		
	},
	
};

document.addEventListener("DOMContentLoaded", () => mailmergePreview.init());
