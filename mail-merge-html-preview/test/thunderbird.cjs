"use strict";
// End-to-end check in a real Thunderbird with a throwaway profile (your own profile is not used).
// It installs the built XPI, opens a compose window, clicks the Mail Merge button, loads a CSV file,
// checks the Message preview (light and dark), then runs a real merge into Local Folders/Drafts.
//
//   npm run build && npm run test:thunderbird [path/to/package.xpi]
//   THUNDERBIRD_PATH overrides the app location; --screenshots saves screenshots/thunderbird*.png.
//
// Thunderbird's WebDriver BiDi support only covers its own windows ("chrome" scope), so the add-on
// page is driven through a frame script. This relies on Thunderbird internals and may need updates.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");

const root = path.join(__dirname, "..");
const dist = path.join(root, "dist");
const xpi = path.resolve(process.argv.find(arg => arg.endsWith(".xpi")) ?? path.join(dist, fs.readdirSync(dist).filter(name => /^mail-merge-html-preview-.*\.xpi$/.test(name)).sort().pop()));
const screenshots = process.argv.includes("--screenshots");
const UUID = "7d1b0c2e-5a3f-4c8e-9b6d-2f4e8a1c3b5d";
const read = (name) => fs.readFileSync(path.join(root, "addon", name), "utf8");
const messages = (locale) => Object.fromEntries(Object.entries(JSON.parse(read("_locales/" + locale + "/messages.json"))).map(([key, value]) => [key, value.message]));
const locales = { en: messages("en"), tr: messages("tr") };

const csv = "Ad,Soyad,E-posta,Puan,No\nAyşe,Yılmaz,ayse@example.com,85,1001\nMehmet,,mehmet@example.com,,1002\nZeynep,Kaya,zeynep@example.com,42,1003\n";

function body(origin) {
	return `<html><head><style>.score { border-collapse: collapse; background: #edf3fb; } .score td { border: 1px solid #999; padding: 6px 10px; }</style></head>
<body bgcolor="#FFFFCC"><p><b>Sayın {{Ad}} {{Soyad}},</b></p><p>Ödevinizin değerlendirmesi tamamlanmıştır.</p>
<table class="score"><tr><td>Puan</td><td id="score">{{Puan}}</td></tr><tr><td>Durum</td><td id="state">{{Puan|&gt;=|50|Geçti|Kaldı}}</td></tr></table>
<p>Ayrıntılar: <a id="link" href="https://obs.example.edu/odev?no={{No}}">öğrenci sayfası</a></p><p id="red" style="color: #c00000;">Son teslim: 10 Ekim</p>
<p><img id="remote" src="${origin}/image/logo.svg" width="64" height="32" alt="logo"></p><p id="done">Son</p></body></html>`;
}

class Thunderbird {

	static async start() {

		let home = fs.mkdtempSync(path.join(os.tmpdir(), "mailmerge-thunderbird-"));
		let profile = path.join(home, "profile");
		fs.mkdirSync(profile);
		let prefs = {
			"extensions.webextensions.uuids": JSON.stringify({ "mailmerge@example.net": UUID }),
			"mail.provider.suppress_dialog_on_startup": true,
			"mailnews.start_page.enabled": false,
			"mail.shell.checkDefaultClient": false,
			"datareporting.policy.dataSubmissionEnabled": false,
			// Add-on windows follow the system theme; start light, switch to dark later.
			"ui.systemUsesDarkTheme": 0,
			"layout.css.prefers-color-scheme.content-override": 1,
			// A Local Folders account with an identity is enough to compose and save drafts.
			"mail.accountmanager.accounts": "account1",
			"mail.accountmanager.defaultaccount": "account1",
			"mail.accountmanager.localfoldersserver": "server1",
			"mail.account.account1.identities": "id1",
			"mail.account.account1.server": "server1",
			"mail.identity.id1.fullName": "Ders",
			"mail.identity.id1.useremail": "ders@example.edu",
			"mail.identity.id1.compose_html": true,
			"mail.identity.id1.draft_folder": "mailbox://nobody@Local%20Folders/Drafts",
			"mail.identity.id1.stationery_folder": "mailbox://nobody@Local%20Folders/Templates",
			"mail.server.server1.type": "none",
			"mail.server.server1.hostname": "Local Folders",
			"mail.server.server1.userName": "nobody",
			"mail.server.server1.name": "Local Folders",
		};
		fs.writeFileSync(path.join(profile, "user.js"), Object.entries(prefs).map(([key, value]) => `user_pref(${JSON.stringify(key)}, ${JSON.stringify(value)});`).join("\n"));

		let process_ = spawn(process.env.THUNDERBIRD_PATH || "/Applications/Thunderbird.app/Contents/MacOS/thunderbird",
			["--headless", "--no-remote", "--profile", profile, "--remote-debugging-port", "0", "--remote-allow-system-access"],
			{ env: { ...process.env, HOME: home, CFFIXED_USER_HOME: home } });
		let endpoint = await new Promise((resolve, reject) => {
			let output = "";
			let listen = (data) => {
				output += data;
				let match = output.match(/WebDriver BiDi listening on (ws:\/\/\S+)/);
				if (match) { resolve(match[1]); }
			};
			process_.stdout.on("data", listen);
			process_.stderr.on("data", listen);
			setTimeout(() => reject(new Error("Thunderbird did not start: " + output)), 60000);
		});

		let thunderbird = new Thunderbird(process_, new WebSocket(endpoint + "/session"));
		thunderbird.home = home;
		await new Promise(resolve => thunderbird.socket.addEventListener("open", resolve));
		await thunderbird.send("session.new", { capabilities: {} });
		return thunderbird;

	}

	constructor(process_, socket) {
		this.process = process_;
		this.socket = socket;
		this.id = 0;
		this.pending = new Map();
		socket.addEventListener("message", event => {
			let message = JSON.parse(event.data);
			this.pending.get(message.id)?.(message);
			this.pending.delete(message.id);
		});
	}

	send(method, params = {}) {
		return new Promise((resolve, reject) => {
			let id = ++this.id;
			this.pending.set(id, message => (message.type === "error") ? reject(new Error(method + ": " + message.error + " " + message.message)) : resolve(message.result));
			this.socket.send(JSON.stringify({ id, method, params }));
		});
	}

	async window(url) {
		for (let start = Date.now(); Date.now() - start < 20000; await sleep(200)) {
			let { contexts } = await this.send("browsingContext.getTree", { "moz:scope": "chrome" });
			let context = contexts.find(context => context.url.includes(url));
			if (context) { return context.context; }
		}
		throw new Error("No window " + url);
	}

	async chrome(context, expression) {
		let result = await this.send("script.evaluate", { target: { context }, expression, awaitPromise: true });
		if (result.type === "exception") { throw new Error(result.exceptionDetails.text + "\n" + expression.slice(0, 300)); }
		return result.result.value;
	}

	// Runs fn(page, xray) in the add-on page: page is the page's own window, xray the privileged view.
	async page(fn, ...args) {
		let id = "r" + (++this.id);
		let script = `(async () => { try { let value = await (${fn})(content.wrappedJSObject, content, ...${JSON.stringify(args)}); sendAsyncMessage("mailmerge-test", { id: ${JSON.stringify(id)}, value: JSON.stringify(value ?? null) }); } catch (e) { sendAsyncMessage("mailmerge-test", { id: ${JSON.stringify(id)}, error: String(e) + "\\n" + e.stack }); } })();`;
		let result = JSON.parse(await this.chrome(this.popup, `(async () => {
			let browser = document.getElementById("requestFrame");
			let result = new Promise(resolve => {
				let listener = (message) => {
					if (message.data.id !== ${JSON.stringify(id)}) { return; }
					browser.messageManager.removeMessageListener("mailmerge-test", listener);
					resolve(message.data);
				};
				browser.messageManager.addMessageListener("mailmerge-test", listener);
			});
			browser.messageManager.loadFrameScript("data:application/javascript;charset=utf-8," + encodeURIComponent(${JSON.stringify(script)}), false);
			return JSON.stringify(await result);
		})()`));
		if (result.error) { throw new Error(result.error); }
		return JSON.parse(result.value);
	}

	async until(fn, label, ...args) {
		let last;
		for (let start = Date.now(); Date.now() - start < 15000; await sleep(200)) {
			try {
				last = await this.page(fn, ...args);
				if (last) { return last; }
			} catch(e) { last = e.message; }
		}
		throw new Error("Timed out: " + label + " (" + JSON.stringify(last) + ")");
	}

	// Draws the add-on window with Thunderbird's own renderer; returns [r, g, b] at (x, y) when asked.
	async snapshot(file, x = 0, y = 0) {
		let [data, pixel] = JSON.parse(await this.chrome(this.popup, `(async () => {
			let browser = document.getElementById("requestFrame");
			let bitmap = await browser.browsingContext.currentWindowGlobal.drawSnapshot(null, 1, "white");
			let canvas = document.createElementNS("http://www.w3.org/1999/xhtml", "canvas");
			canvas.width = bitmap.width;
			canvas.height = bitmap.height;
			let context = canvas.getContext("2d");
			context.drawImage(bitmap, 0, 0);
			return JSON.stringify([canvas.toDataURL("image/png").split(",")[1], [...context.getImageData(${x}, ${y}, 1, 1).data].slice(0, 3)]);
		})()`));
		if (file) { fs.writeFileSync(file, Buffer.from(data, "base64")); }
		return pixel;
	}
	
	pixel(x, y) {
		return this.snapshot(null, x, y);
	}
	
	async close() {
		this.socket.close();
		let exited = new Promise(resolve => this.process.once("exit", resolve));
		this.process.kill();
		await exited;
		try { fs.rmSync(this.home, { recursive: true, force: true }); } catch(e) {}
	}

}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const near = (actual, expected, label) => assert.ok(actual.every((value, i) => Math.abs(value - expected[i]) <= 3), label + ": " + actual + " ≠ " + expected);

(async () => {

	let hits = [];
	let server = http.createServer((request, response) => {
		hits.push(request.url);
		response.writeHead(200, { "Content-Type": "image/svg+xml" });
		response.end('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="32"><rect width="64" height="32" fill="#3973c1"/></svg>');
	});
	await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
	let origin = "http://127.0.0.1:" + server.address().port;

	let thunderbird = await Thunderbird.start();

	try {

		let { extension } = await thunderbird.send("webExtension.install", { extensionData: { type: "archivePath", path: xpi } });
		assert.equal(extension, "mailmerge@example.net");

		let { contexts } = await thunderbird.send("browsingContext.getTree", { "moz:scope": "chrome" });
		for (let context of contexts.filter(context => context.url.includes("systemIntegrationDialog"))) {
			await thunderbird.chrome(context.context, "window.close()");
		}
		thunderbird.main = await thunderbird.window("messenger.xhtml");
		let version = await thunderbird.chrome(thunderbird.main, "Services.appinfo.version");

		/* A real compose window with an HTML template */
		await thunderbird.chrome(thunderbird.main, `(() => {
			let { MailServices } = ChromeUtils.importESModule("resource:///modules/MailServices.sys.mjs");
			let params = Cc["@mozilla.org/messengercompose/composeparams;1"].createInstance(Ci.nsIMsgComposeParams);
			let fields = Cc["@mozilla.org/messengercompose/composefields;1"].createInstance(Ci.nsIMsgCompFields);
			fields.to = "{{E-posta}}";
			fields.subject = "Ödev sonucu: {{Ad}}";
			fields.body = ${JSON.stringify(body(origin))};
			params.type = Ci.nsIMsgCompType.New;
			params.format = Ci.nsIMsgCompFormat.HTML;
			params.composeFields = fields;
			params.identity = MailServices.accounts.getIdentity("id1");
			MailServices.compose.OpenComposeWindowWithParams(null, params);
		})()`);
		let composer = await thunderbird.window("messengercompose.xhtml");
		for (let start = Date.now(); !(await thunderbird.chrome(composer, "document.readyState === 'complete' && !!window.gMsgCompose?.editor && !!document.getElementById('mailmerge_example_net-composeAction-toolbarbutton')")); await sleep(200)) {
			if (Date.now() - start > 20000) { throw new Error("compose window not ready"); }
		}
		await sleep(1000);

		/* The Mail Merge button opens the add-on window for this compose window */
		await thunderbird.chrome(composer, "document.getElementById('mailmerge_example_net-composeAction-toolbarbutton').click()");
		thunderbird.popup = await thunderbird.window("extensionPopup.xhtml");
		await thunderbird.until(page => page.compose?.details != null && page.document.getElementById("mailmerge-dialog-source").options.length > 0, "dialog ready");
		let lang = await thunderbird.page(page => page.document.getElementById("mailmerge-preview-wide").textContent === "Bilgisayar" ? "tr" : "en");
		let t = (key, ...values) => locales[lang]["mailmerge.preview." + key].replace(/[$](\d)/g, (match, n) => values[n - 1]);

		/* CSV data source */
		await thunderbird.page((page, xray, csv) => {
			let source = xray.document.getElementById("mailmerge-dialog-source");
			source.value = "CSV";
			source.dispatchEvent(new xray.Event("change"));
			let file = xray.document.getElementById("mailmerge-dialog-csv-file");
			file.mozSetFileArray([new xray.File([csv], "ogrenciler.csv", { type: "text/csv" })]);
			file.dispatchEvent(new xray.Event("change"));
			let delimiter = xray.document.getElementById("mailmerge-dialog-csv-fielddelimiter");
			delimiter.value = ",";
			delimiter.dispatchEvent(new xray.Event("change"));
			xray.document.getElementById("mailmerge-dialog-message").click();
		}, csv);

		/* Message preview */
		await thunderbird.until((page, xray) => xray.document.getElementById("mailmerge-message-body").contentDocument?.getElementById("score")?.textContent === "85", "preview of the first recipient");
		let first = await thunderbird.page((page, xray) => {
			let frame = xray.document.getElementById("mailmerge-message-body");
			let doc = frame.contentDocument;
			let view = doc.defaultView;
			return {
				dark: page.matchMedia("(prefers-color-scheme: dark)").matches,
				body: page.compose.details.body,
				to: page.document.getElementById("mailmerge-message-to").textContent,
				subject: page.document.getElementById("mailmerge-message-subject").textContent,
				total: page.document.getElementById("mailmerge-message-total").textContent,
				background: view.getComputedStyle(doc.body).backgroundColor,
				table: view.getComputedStyle(doc.querySelector(".score")).backgroundColor,
				state: doc.getElementById("state").textContent,
				link: [doc.getElementById("link").getAttribute("href"), doc.getElementById("link").title, view.getComputedStyle(doc.getElementById("link")).textDecorationLine],
				remote: doc.getElementById("remote").src.slice(0, 19),
				notices: [...page.document.querySelectorAll("#mailmerge-preview-notice p")].map(line => line.textContent),
				sandbox: frame.getAttribute("sandbox"),
				scroll: page.document.documentElement.scrollHeight - page.document.documentElement.clientHeight,
				frame: frame.getBoundingClientRect().toJSON(),
			};
		});
		assert.equal(first.dark, false);
		assert.equal(first.to, "ayse@example.com");
		assert.equal(first.subject, "Ödev sonucu: Ayşe");
		assert.equal(first.total, "/ 3");
		assert.equal(first.background, "rgb(255, 255, 204)", "body bgcolor kept by Thunderbird's compose body");
		assert.equal(first.table, "rgb(237, 243, 251)");
		assert.equal(first.state, "Geçti");
		assert.deepEqual(first.link, ["#mailmerge-preview-link", "https://obs.example.edu/odev?no=1001", "underline"]);
		assert.equal(first.remote, "data:image/svg+xml,");
		assert.equal(first.sandbox, "");
		assert.equal(first.scroll, 0, "no page scrolling, even in a small add-on window");
		assert.deepEqual(first.notices, [t("summary", 1, 3) + " " + t("summary.next"), t("remote", 1) + " " + t("remote.load")]);
		near(await thunderbird.pixel(Math.round(first.frame.right - 20), Math.round(first.frame.bottom - 20)), [255, 255, 204], "preview colors");
		if (screenshots) { await thunderbird.snapshot(path.join(root, "screenshots", "thunderbird.png")); }

		/* Field check and navigation */
		await thunderbird.page(page => page.document.querySelector("#mailmerge-preview-notice button").click());
		await thunderbird.until(page => page.document.getElementById("mailmerge-message-to").textContent === "mehmet@example.com", "second recipient");
		let second = await thunderbird.page(page => [...page.document.querySelectorAll("#mailmerge-preview-notice p")].map(line => line.textContent));
		assert.equal(second[0], t("empty", "{{Soyad}}, {{Puan}}"));

		/* A link click stays inside the preview */
		await thunderbird.page((page, xray) => xray.document.getElementById("mailmerge-message-body").contentDocument.getElementById("link").click());
		await sleep(1000);
		assert.equal(await thunderbird.page((page, xray) => xray.document.getElementById("mailmerge-message-body").contentDocument?.getElementById("done") != null), true, "a link click stays in the preview");
		assert.deepEqual(hits, [], "nothing loaded before asking");

		/* Remote images after asking */
		await thunderbird.page((page, xray, label) => [...page.document.querySelectorAll("#mailmerge-preview-notice button")].find(button => button.textContent === label).click(), t("remote.load"));
		await thunderbird.until((page, xray) => { let image = xray.document.getElementById("mailmerge-message-body").contentDocument?.getElementById("remote"); return image?.src.startsWith("http:") && image.complete && image.naturalWidth === 64; }, "remote image in Thunderbird");
		assert.deepEqual(hits, ["/image/logo.svg"]);

		/* Dark mode */
		await thunderbird.chrome(thunderbird.main, `Services.prefs.setIntPref("ui.systemUsesDarkTheme", 1); Services.prefs.setIntPref("layout.css.prefers-color-scheme.content-override", 0)`);
		await thunderbird.until(page => page.matchMedia("(prefers-color-scheme: dark)").matches, "dark mode");
		await sleep(500);
		near(await thunderbird.pixel(Math.round(first.frame.right - 20), Math.round(first.frame.bottom - 20)), [255, 255, 204], "dark mode keeps the message colors");
		let header = await thunderbird.page(page => page.document.querySelector("#mailmerge-message .header").getBoundingClientRect().toJSON());
		near(await thunderbird.pixel(400, Math.round(header.top + 5)), [39, 39, 39], "dialog stays dark");
		if (screenshots) { await thunderbird.snapshot(path.join(root, "screenshots", "thunderbird-dark.png")); }
		await thunderbird.chrome(thunderbird.main, `Services.prefs.setIntPref("ui.systemUsesDarkTheme", 0); Services.prefs.setIntPref("layout.css.prefers-color-scheme.content-override", 1)`);

		/* A real merge into Local Folders/Drafts still works */
		await thunderbird.page(page => {
			page.document.getElementById("mailmerge-message-accept").click();
			page.document.getElementById("mailmerge-dialog-delivermode").value = "SaveAsDraft";
			page.document.getElementById("mailmerge-dialog-send").click();
		});
		await thunderbird.until(page => page.document.getElementById("mailmerge-send").classList.contains("active"), "send tab");
		await thunderbird.page(page => page.document.getElementById("mailmerge-send-start").click());
		let drafts;
		for (let start = Date.now(); Date.now() - start < 60000; await sleep(500)) {
			drafts = JSON.parse(await thunderbird.chrome(thunderbird.main, `(() => {
				let { MailServices } = ChromeUtils.importESModule("resource:///modules/MailServices.sys.mjs");
				let folder = MailServices.folderLookup.getFolderForURL("mailbox://nobody@Local%20Folders/Drafts");
				return JSON.stringify(folder ? [...folder.messages].map(header => [header.mime2DecodedSubject, header.mime2DecodedRecipients]) : []);
			})()`));
			if (drafts.length >= 3) { break; }
		}
		assert.deepEqual(drafts.map(([subject]) => subject).sort(), ["Ödev sonucu: Ayşe", "Ödev sonucu: Mehmet", "Ödev sonucu: Zeynep"]);

		console.log("PASS Thunderbird " + version + ": installs, opens from the compose window, previews CSV data with styles and body colors, field check, links, remote images on request, dark mode, and saves 3 merged drafts.");

	} finally {
		await thunderbird.close();
		server.close();
	}

})().catch(e => { console.error(e); process.exit(1); });
