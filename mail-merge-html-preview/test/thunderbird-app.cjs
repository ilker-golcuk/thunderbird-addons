"use strict";
// Starts Thunderbird with a throwaway profile (your own profile is not used) and drives it over WebDriver BiDi.
// Shared by test/thunderbird.cjs and test/update.cjs.

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");

const UUID = "7d1b0c2e-5a3f-4c8e-9b6d-2f4e8a1c3b5d";
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class Thunderbird {

	static async start(extraPrefs = {}) {

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
			...extraPrefs,
		};
		fs.writeFileSync(path.join(profile, "user.js"), Object.entries(prefs).map(([key, value]) => `user_pref(${JSON.stringify(key)}, ${JSON.stringify(value)});`).join("\n"));

		let process_ = spawn(process.env.THUNDERBIRD_PATH || "/Applications/Thunderbird.app/Contents/MacOS/thunderbird",
			["--headless", "--no-remote", "--profile", profile, "--remote-debugging-port", "0", "--remote-allow-system-access"],
			// Newer Thunderbird (seen on 161) also needs this variable before BiDi reaches chrome windows.
			{ env: { ...process.env, HOME: home, CFFIXED_USER_HOME: home, MOZ_REMOTE_ALLOW_SYSTEM_ACCESS: "1" } });
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

module.exports = { Thunderbird, sleep };
