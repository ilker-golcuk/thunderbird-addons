"use strict";
// Checks that Thunderbird updates this add-on by itself from its own update_url, with a throwaway profile.
//
//   npm run test:update          two builds (current version and the next one) served from a local server:
//                                Thunderbird finds the newer one through updates.json, waits while a compose
//                                window is open, then installs it.
//   npm run test:update -- --live   the real channel: installs this add-on as version 0.1 with the real
//                                update_url and expects the newest version listed in updates.json on GitHub,
//                                downloaded from its GitHub release with Thunderbird's normal security checks.
//
// THUNDERBIRD_PATH overrides the app location.

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { Thunderbird, sleep, watchdog } = require("./thunderbird-app.cjs");

const root = path.join(__dirname, "..");
const ID = "mailmerge@example.net";
const live = process.argv.includes("--live");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "addon", "manifest.json"), "utf8"));
const build = (...args) => execFileSync("python3", [path.join(root, "build.py"), ...args], { stdio: "pipe" });
const next = (version) => version.split(".").map((part, i, parts) => (i === parts.length - 1) ? String(Number(part) + 1) : part).join(".");

async function addon(thunderbird) {
	return JSON.parse(await thunderbird.chrome(thunderbird.main, `(async () => {
		let { AddonManager } = ChromeUtils.importESModule("resource://gre/modules/AddonManager.sys.mjs");
		let addon = await AddonManager.getAddonByID(${JSON.stringify(ID)});
		return JSON.stringify(addon && { version: addon.version, active: addon.isActive, updateURL: addon.updateURL });
	})()`));
}

async function waitFor(fn, label, ms = 60000) {
	let last;
	for (let start = Date.now(); Date.now() - start < ms; await sleep(500)) {
		last = await fn();
		if (last) { return last; }
	}
	throw new Error("Timed out: " + label);
}

(async () => {

	let work = fs.mkdtempSync(path.join(os.tmpdir(), "mailmerge-update-"));
	let hits = [];
	let server;
	let prefs = {
		"extensions.update.enabled": true,
		"extensions.update.autoUpdateDefault": true,
		// Keep the check to this add-on's update_url; nothing is fetched from addons.thunderbird.net.
		"extensions.getAddons.cache.enabled": false,
	};
	let oldXpi = path.join(work, "old.xpi");
	let expected;

	if (live) {
		build("--version", "0.1", "--out", oldXpi);
		let response = await fetch(manifest.applications.gecko.update_url);
		assert.equal(response.status, 200, "updates.json on GitHub");
		let updates = (await response.json()).addons[ID].updates;
		expected = updates.map(update => update.version).sort((a, b) => a.localeCompare(b, undefined, { numeric: true })).pop();
	} else {
		server = http.createServer((request, response) => {
			hits.push(request.url);
			let file = path.join(work, path.basename(request.url));
			if (!fs.existsSync(file)) { response.writeHead(404); response.end(); return; }
			response.writeHead(200, { "Content-Type": request.url.endsWith(".json") ? "application/json" : "application/x-xpinstall" });
			response.end(fs.readFileSync(file));
		});
		await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
		let origin = "http://127.0.0.1:" + server.address().port;
		let updateURL = origin + "/updates.json";
		expected = next(manifest.version);
		build("--version", manifest.version, "--update-url", updateURL, "--out", oldXpi);
		build("--version", expected, "--update-url", updateURL, "--out", path.join(work, "new.xpi"), "--updates-json", path.join(work, "updates.json"), "--update-link", origin + "/new.xpi");
		// The local server is plain http; the real channel is https (see --live).
		prefs["extensions.checkUpdateSecurity"] = false;
	}

	let thunderbird;
	watchdog(15 * 60000, () => thunderbird);
	thunderbird = await Thunderbird.start(prefs);

	try {

		let { contexts } = await thunderbird.send("browsingContext.getTree", { "moz:scope": "chrome" });
		for (let context of contexts.filter(context => context.url.includes("systemIntegrationDialog"))) {
			await thunderbird.chrome(context.context, "window.close()");
		}
		thunderbird.main = await thunderbird.window("messenger.xhtml");
		let appVersion = await thunderbird.chrome(thunderbird.main, "Services.appinfo.version");

		/* Installed from a file, as a user does it (not as a temporary add-on) */
		await thunderbird.chrome(thunderbird.main, `(async () => {
			let { AddonManager } = ChromeUtils.importESModule("resource://gre/modules/AddonManager.sys.mjs");
			let file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsIFile);
			file.initWithPath(${JSON.stringify(oldXpi)});
			let install = await AddonManager.getInstallForFile(file);
			await install.install();
		})()`);
		let before = await waitFor(async () => { let a = await addon(thunderbird); return a?.active && a; }, "installed add-on is active");
		assert.equal(before.updateURL, live ? manifest.applications.gecko.update_url : before.updateURL);

		let check = () => thunderbird.chrome(thunderbird.main, `(() => {
			let { AddonManagerPrivate } = ChromeUtils.importESModule("resource://gre/modules/AddonManager.sys.mjs");
			AddonManagerPrivate.backgroundUpdateCheck();
		})()`);

		if (!live) {
			/* While a compose window is open, Mail Merge keeps the old version (a merge may be running) */
			await thunderbird.chrome(thunderbird.main, `(() => {
				let { MailServices } = ChromeUtils.importESModule("resource:///modules/MailServices.sys.mjs");
				let params = Cc["@mozilla.org/messengercompose/composeparams;1"].createInstance(Ci.nsIMsgComposeParams);
				params.type = Ci.nsIMsgCompType.New;
				params.format = Ci.nsIMsgCompFormat.HTML;
				params.composeFields = Cc["@mozilla.org/messengercompose/composefields;1"].createInstance(Ci.nsIMsgCompFields);
				params.identity = MailServices.accounts.getIdentity("id1");
				MailServices.compose.OpenComposeWindowWithParams(null, params);
			})()`);
			let composer = await thunderbird.window("messengercompose.xhtml");
			await waitFor(() => thunderbird.chrome(composer, "document.readyState === 'complete' && !!window.gMsgCompose?.editor"), "compose window");
			await sleep(1000);

			await check();
			await waitFor(() => hits.includes("/new.xpi"), "new version downloaded");
			await sleep(3000);
			assert.equal((await addon(thunderbird)).version, manifest.version, "no update while a compose window is open");

			await thunderbird.chrome(composer, "window.close()");
		} else {
			await check();
		}

		let after = await waitFor(async () => { let a = await addon(thunderbird); return a?.version === expected && a.active && a; }, "updated to " + expected, 120000);

		if (live) {
			console.log(`PASS Thunderbird ${appVersion}: installed as 0.1 with update_url ${manifest.applications.gecko.update_url}, updated by itself to ${after.version} from the GitHub release.`);
		} else {
			assert.deepEqual(hits.filter(hit => hit === "/updates.json" || hit === "/new.xpi"), ["/updates.json", "/new.xpi"]);
			console.log(`PASS Thunderbird ${appVersion}: found ${expected} through updates.json, waited while a compose window was open, then updated ${manifest.version} → ${after.version} by itself and kept it active.`);
		}

	} catch (error) {
		await thunderbird.diagnose();
		throw error;
	} finally {
		await thunderbird.close();
		server?.close();
		fs.rmSync(work, { recursive: true, force: true });
	}

})().catch(error => {
	console.error(error);
	process.exit(1);
});
