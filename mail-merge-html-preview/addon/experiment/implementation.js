"use strict";
// console.log("implementation.js");

var mailmerge = class extends ExtensionCommon.ExtensionAPI {
	
	/*
	constructor(extension) {
		super(extension);
	}
	*/
	
	onStartup() {
		
		// console.log("onStartup()");
		
		let { ExtensionSupport } = ChromeUtils.importESModule("resource:///modules/ExtensionSupport.sys.mjs");
		
		ExtensionSupport.registerWindowListener("mailmerge@example.net", {
			
			chromeURLs: [
				"chrome://messenger/content/messengercompose/messengercompose.xhtml",
			],
			
			onLoadWindow: loadWindow,
			onUnloadWindow: unloadWindow,
			
		});
		
	}
	
	onShutdown() {
		
		// console.log("onShutdown()");
		
		let { ExtensionSupport } = ChromeUtils.importESModule("resource:///modules/ExtensionSupport.sys.mjs");
		
		ExtensionSupport.unregisterWindowListener("mailmerge@example.net");
		
		for (let win of ExtensionSupport.openWindows) {
			unloadWindow(win);
		}
		
		Services.obs.notifyObservers(null, "startupcache-invalidate", null);
		
	}
	
	getAPI(context) {
		
		return {
			
			mailmerge: {
				
				async alert(title, message) {
					
					// console.log("messenger.mailmerge.alert()");
					
					return Services.prompt.alert(null, title, message);
					
				},
				
				async confirm(title, message) {
					
					// console.log("messenger.mailmerge.confirm()");
					
					return Services.prompt.confirm(null, title, message);
					
				},
				
				compose: {
					
					async init(tab) {
						
						// console.log("messenger.mailmerge.compose.init()");
						
						let tabObject = context.extension.tabManager.get(tab);
						
						/* pillifyrecipients start */
						try {
							
							await tabObject.window.pillifyRecipients();
							
						} catch(e) { console.warn(e); }
						/* pillifyrecipients end */
						
						/* addressinvalid begin */
						try {
							
							tabObject.window.Recipients2CompFields(tabObject.window.gMsgCompose.compFields);
							if (tabObject.window.gMsgCompose.compFields.to === "") {
								
								let bundle = tabObject.window.document.getElementById("bundle_composeMsgs");
								if (bundle) {
									
									Services.prompt.alert(
										tabObject.window,
										bundle.getString("addressInvalidTitle"),
										bundle.getString("noRecipients")
									);
									
								} else {
									
									Services.prompt.alert(
										tabObject.window,
										await tabObject.window.document.l10n.formatValue("compose-invalid-address-title"),
										await tabObject.window.document.l10n.formatValue("compose-no-recipients")
									);
									
								}
								
								return false;
								
							}
							
						} catch(e) { console.warn(e); }
						/* addressinvalid end */
						
						/* subjectempty begin */
						try {
							
							let subject = tabObject.window.document.getElementById("msgSubject").value;
							if (subject === "") {
								
								let bundle = tabObject.window.document.getElementById("bundle_composeMsgs");
								if (bundle) {
									
									if (Services.prompt.confirmEx(
										tabObject.window,
										bundle.getString("subjectEmptyTitle"),
										bundle.getString("subjectEmptyMessage"),
										(Services.prompt.BUTTON_TITLE_IS_STRING * Services.prompt.BUTTON_POS_0) + (Services.prompt.BUTTON_TITLE_IS_STRING * Services.prompt.BUTTON_POS_1),
										bundle.getString("sendWithEmptySubjectButton"),
										bundle.getString("cancelSendingButton"),
										null,
										null,
										{ value: 0 }
									) === 1) {
										return false;
									}
									
								} else {
									
									if (Services.prompt.confirmEx(
										tabObject.window,
										await tabObject.window.document.l10n.formatValue("compose-empty-subject-title"),
										await tabObject.window.document.l10n.formatValue("compose-empty-subject-prompt"),
										(Services.prompt.BUTTON_TITLE_IS_STRING * Services.prompt.BUTTON_POS_0) + (Services.prompt.BUTTON_TITLE_IS_STRING * Services.prompt.BUTTON_POS_1),
										await tabObject.window.document.l10n.formatValue("compose-empty-subject-send-button"),
										await tabObject.window.document.l10n.formatValue("compose-empty-subject-cancel-button"),
										null,
										null,
										{ value: 0 }
									) === 1) {
										return false;
									}
									
								}
								
							}
							
						} catch(e) { console.warn(e); }
						/* subjectempty end */
						
						/* attachmentreminder begin */
						try {
							
							if (tabObject.window.gManualAttachmentReminder || (Services.prefs.getBoolPref("mail.compose.attachment_reminder_aggressive") && tabObject.window.gComposeNotification.getNotificationWithValue("attachmentReminder"))) {
								
								let bundle = tabObject.window.document.getElementById("bundle_composeMsgs");
								if (bundle) {
									
									if (Services.prompt.confirmEx(
										tabObject.window,
										bundle.getString("attachmentReminderTitle"),
										bundle.getString("attachmentReminderMsg"),
										(Services.prompt.BUTTON_TITLE_IS_STRING * Services.prompt.BUTTON_POS_0) + (Services.prompt.BUTTON_TITLE_IS_STRING * Services.prompt.BUTTON_POS_1),
										bundle.getString("attachmentReminderFalseAlarm"),
										bundle.getString("attachmentReminderYesIForgot"),
										null,
										null,
										{ value: 0 }
									) === 1) {
										return false;
									}
									
								} else {
									
									if (Services.prompt.confirmEx(
										tabObject.window,
										await tabObject.window.document.l10n.formatValue("compose-attachment-reminder-title"),
										await tabObject.window.document.l10n.formatValue("compose-attachment-reminder-prompt"),
										(Services.prompt.BUTTON_TITLE_IS_STRING * Services.prompt.BUTTON_POS_0) + (Services.prompt.BUTTON_TITLE_IS_STRING * Services.prompt.BUTTON_POS_1),
										await tabObject.window.document.l10n.formatValue("compose-attachment-reminder-send-button"),
										await tabObject.window.document.l10n.formatValue("compose-attachment-reminder-add-button"),
										null,
										null,
										{ value: 0 }
									) === 1) {
										return false;
									}
									
								}
								
							}
							
						} catch(e) { console.warn(e); }
						/* attachmentreminder end */
						
						/* spellcheck begin */
						try {
							
							if (Services.prefs.getBoolPref("mail.SpellCheckBeforeSend")) {
								
								// tabObject.window.SetMsgBodyFrameFocus();
								
								tabObject.window.cancelSendMessage = false;
								tabObject.window.openDialog("chrome://messenger/content/messengercompose/EdSpellCheck.xhtml", "_blank", "dialog,close,titlebar,modal,resizable", true, true, false);
								if (tabObject.window.cancelSendMessage) { return false; }
								
							}
							
						} catch(e) { console.warn(e); }
						/* spellcheck end */
						
						return true;
						
					},
					
					async expand(tab) {
						
						// console.log("messenger.mailmerge.compose.expand()");
						
						try {
							
							let tabObject = context.extension.tabManager.get(tab);
							
							tabObject.window.Recipients2CompFields(tabObject.window.gMsgCompose.compFields);
							tabObject.window.expandRecipients();
							tabObject.window.CompFields2Recipients(tabObject.window.gMsgCompose.compFields);
							
							return new Promise((resolve, reject) => { tabObject.window.setTimeout(() => { resolve(); }, 50) });
							
						} catch(e) { /* console.warn(e); */ }
						
					},
					
					async lock(tab) {
						
						// console.log("messenger.mailmerge.compose.lock()");
						
						try {
							
							let tabObject = context.extension.tabManager.get(tab);
							
							tabObject.window.ToggleWindowLock(true);
							tabObject.window.document.querySelector("body").inert = true;
							
						} catch(e) { /* console.warn(e); */ }
						
					},
					
					async headers(tab) {
						
						// console.log("messenger.mailmerge.compose.headers()");
						
						try {
							
							let tabObject = context.extension.tabManager.get(tab);
							
							let listHeaders = [...tabObject.window.gMsgCompose.compFields.headerNames]
								.map(h => h.toLowerCase())
								.filter(h => h.startsWith("list-"))
								.map(h => {
									return {
										name: h.replace(/(^|-)[a-z]/g, function (match) { return match.toUpperCase(); }),
										value: tabObject.window.gMsgCompose.compFields.getHeader(h),
									};
								});
							
							return { listHeaders };
							
						} catch(e) { /* console.warn(e); */ }
						
					},
					
					async unlock(tab) {
						
						// console.log("messenger.mailmerge.compose.unlock()");
						
						try {
							
							let tabObject = context.extension.tabManager.get(tab);
							
							tabObject.window.document.querySelector("body").inert = false;
							tabObject.window.ToggleWindowLock(false);
							
						} catch(e) { /* console.warn(e); */ }
						
					},
					
					async send(tab, details, extras) {
						
						// console.log("messenger.mailmerge.compose.send()");
						
						Cu.forceGC();
						
						return new Promise(async (resolve, reject) => {
							
							let tabObject = context.extension.tabManager.get(tab);
							
							let { MailServices } = ChromeUtils.importESModule("resource:///modules/MailServices.sys.mjs");
							
							/* compfields begin */
							let compFields = Cc["@mozilla.org/messengercompose/composefields;1"].createInstance(Ci.nsIMsgCompFields);
							/* compfields end */
							
							/* composeparams begin */
							let composeParams = Cc["@mozilla.org/messengercompose/composeparams;1"].createInstance(Ci.nsIMsgComposeParams);
							composeParams.type = Ci.nsIMsgCompType.New;
							composeParams.format = (tabObject.window.gMsgCompose.composeHTML) ? Ci.nsIMsgCompFormat.HTML : Ci.nsIMsgCompFormat.PlainText;
							composeParams.identity = tabObject.window.gMsgCompose.identity;
							composeParams.composeFields = compFields;
							/* composeparams end */
							
							/* compose begin */
							let compose = tabObject.window.mailmerge.compose = Cc["@mozilla.org/messengercompose/compose;1"].createInstance(Ci.nsIMsgCompose);
							compose.initialize(composeParams);
							compose.initEditor(tabObject.window.gMsgCompose.editor, tabObject.window.content);
							/* compose end */
							
							/* compfields begin */
							compFields.attachVCard = tabObject.window.gMsgCompose.compFields.attachVCard;
							compFields.contentLanguage = tabObject.window.gMsgCompose.compFields.contentLanguage;
							compFields.deliveryFormat = tabObject.window.gMsgCompose.compFields.deliveryFormat;
							compFields.DSN = tabObject.window.gMsgCompose.compFields.DSN;
							compFields.organization = tabObject.window.gMsgCompose.compFields.organization;
							compFields.priority = tabObject.window.gMsgCompose.compFields.priority;
							compFields.returnReceipt = tabObject.window.gMsgCompose.compFields.returnReceipt;
							/* compfields end */
							
							/* from begin */
							try {
								
								let from = details.from;
								from = MailServices.headerParser.makeFromDisplayAddress(from);
								from = MailServices.headerParser.makeMimeHeader(from, from.length);
								compFields.from = from;
								
							} catch(e) { console.warn(e); }
							/* from end */
							
							/* to begin */
							try {
								
								let to = details.to;
								to = MailServices.headerParser.makeFromDisplayAddress(to);
								to = MailServices.headerParser.makeMimeHeader(to, to.length);
								compFields.to = to;
								
							} catch(e) { console.warn(e); }
							/* to end */
							
							/* cc begin */
							try {
								
								let cc = details.cc;
								cc = MailServices.headerParser.makeFromDisplayAddress(cc);
								cc = MailServices.headerParser.makeMimeHeader(cc, cc.length);
								compFields.cc = cc;
								
							} catch(e) { console.warn(e); }
							/* cc end */
							
							/* bcc begin */
							try {
								
								let bcc = details.bcc;
								bcc = MailServices.headerParser.makeFromDisplayAddress(bcc);
								bcc = MailServices.headerParser.makeMimeHeader(bcc, bcc.length);
								compFields.bcc = bcc;
								
							} catch(e) { console.warn(e); }
							/* bcc end */
							
							/* replyTo begin */
							try {
								
								let replyTo = details.replyTo;
								replyTo = MailServices.headerParser.makeFromDisplayAddress(replyTo);
								replyTo = MailServices.headerParser.makeMimeHeader(replyTo, replyTo.length);
								compFields.replyTo = replyTo;
								
							} catch(e) { console.warn(e); }
							/* replyTo end */
							
							/* subject begin */
							try {
								
								let subject = details.subject;
								compFields.subject = subject;
								
							} catch(e) { console.warn(e); }
							/* subject end */
							
							/* body begin */
							try {
								
								let body = details.body;
								compFields.body = body;
								
							} catch(e) { console.warn(e); }
							/* body end */
							
							/* attachments begin */
							for (let attachment of details.attachments) {
								
								try {
									
									let file = Cc["@mozilla.org/messengercompose/attachment;1"].createInstance(Ci.nsIMsgAttachment);
									
									file.url = tabObject.window.URL.createObjectURL(attachment.file);
									file.name = attachment.name;
									
									compFields.addAttachment(file);
									
								} catch(e) { console.warn(e); }
								
							}
							/* attachments end */
							
							/* customheaders begin */
							for (let header of details.customHeaders) {
								
								try {
									
									compFields.setHeader(header.name, header.value);
									
								} catch(e) { console.warn(e); }
								
							}
							/* customheaders end */
							
							/* listheaders begin */
							for (let header of extras.listHeaders) {
								
								try {
									
									compFields.setHeader(header.name, header.value);
									
								} catch(e) { console.warn(e); }
								
							}
							/* listheaders end */
							
							/* editor begin */
							try {
								
								let editor = tabObject.window.gMsgCompose.editor;
								editor.document.documentElement.innerHTML = details.body;
								editor.beginningOfDocument();
								editor.clearUndoRedo();
								
							} catch(e) { console.warn(e); }
							/* editor end */
							
							/* delivermode begin */
							let delivermode = extras.delivermode;
							switch (delivermode) {
								
								case "SaveAsDraft":
									
									delivermode = Ci.nsIMsgCompDeliverMode.SaveAsDraft;
									break;
									
								case "SendLater":
									
									delivermode = Ci.nsIMsgCompDeliverMode.Later;
									break;
									
								case "SendNow":
									
									delivermode = Ci.nsIMsgCompDeliverMode.Now;
									break;
									
								default:
								
							}
							/* delivermode end */
							
							/* sendformat begin */
							let sendformat = (delivermode !== Ci.nsIMsgCompDeliverMode.SaveAsDraft) ? tabObject.window.determineSendFormat() : null;
							switch (sendformat) {
								
								case Ci.nsIMsgCompSendFormat.PlainText:
									
									compFields.forcePlainText = true;
									compFields.useMultipartAlternative = false;
									break;
									
								case Ci.nsIMsgCompSendFormat.HTML:
									
									compFields.forcePlainText = false;
									compFields.useMultipartAlternative = false;
									break;
									
								case Ci.nsIMsgCompSendFormat.Both:
									
									compFields.forcePlainText = false;
									compFields.useMultipartAlternative = true;
									break;
									
								default:
								
							}
							/* sendformat end */
							
							/* progressListener begin */
							let progressListener = tabObject.window.mailmerge.progressListener = {
								
								onStateChange: function(aWebProgress, aRequest, aStateFlags, aStatus) {
									
									// console.log("onStateChange", aWebProgress, aRequest, aStateFlags, aStatus);
									
									if (aStateFlags & Ci.nsIWebProgressListener.STATE_STOP) {
										(aStatus === Cr.NS_OK) ? resolve() : reject();
									}
									
								},
								
								onProgressChange: function(aWebProgress, aRequest, aCurSelfProgress, aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress) {
									
									// console.log("onProgressChange", aWebProgress, aRequest, aCurSelfProgress, aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress);
									
								},
								
								onLocationChange: function(aWebProgress, aRequest, aLocation, aFlags) {
									
									// console.log("onLocationChange", aWebProgress, aRequest, aLocation, aFlags);
									
								},
								
								onStatusChange: function(aWebProgress, aRequest, aStatus, aMessage) {
									
									// console.log("onStatusChange", aWebProgress, aRequest, aStatus, aMessage);
									
									let bundle = tabObject.window.document.getElementById("bundle_composeMsgs");
									if (bundle) {
										
										if (aMessage === bundle.getString("copyMessageComplete")) { resolve(); }
										if (aMessage === bundle.getString("copyMessageFailed")) { reject(); }
										
									}
									
								},
								
								onSecurityChange: function(aWebProgress, aRequest, aState) {
									
									// console.log("onSecurityChange", aWebProgress, aRequest, aState);
									
								},
								
								onContentBlockingEvent: function(aWebProgress, aRequest, aEvent) {
									
									// console.log("onContentBlockingEvent", aWebProgress, aRequest, aEvent);
									
								},
								
								QueryInterface: ChromeUtils.generateQI(["nsIWebProgressListener", "nsISupportsWeakReference"])
								
							}
							/* progressListener end */
							
							/* progress begin */
							let progress = tabObject.window.mailmerge.progress = Cc["@mozilla.org/messenger/progress;1"].createInstance(Ci.nsIMsgProgress);
							progress.registerListener(progressListener);
							/* progress end */
							
							if (compose.sendMsg.length === 5) {
								await compose.sendMsg(delivermode, tabObject.window.gCurrentIdentity, tabObject.window.getCurrentAccountKey(), null, progress);
							}
							if (compose.sendMsg.length === 4) {
								await compose.sendMsg(delivermode, tabObject.window.gCurrentIdentity, tabObject.window.getCurrentAccountKey(), progress);
							}
							
							/* editor begin */
							try {
								
								let editor = tabObject.window.gMsgCompose.editor;
								editor.document.documentElement.innerHTML = extras.body;
								editor.beginningOfDocument();
								editor.clearUndoRedo();
								
							} catch(e) { console.warn(e); }
							/* editor end */
							
						});
						
					},
					
				},
				
			},
			
		};
		
	}
	
};

function loadWindow(win) {
	
	// console.log("loadWindow()");
	
	if (win.location.href === "chrome://messenger/content/messengercompose/messengercompose.xhtml") {
		
		try {
			
			win.mailmerge = {};
			
			win.mailmerge.isValidAddress = win.customElements.get("mail-address-pill").prototype.isValidAddress;
			
			if (win.mailmerge.isValidAddress) {
				
				function isValidAddress(address) {
					return (win.mailmerge.isValidAddress(address) || (this.fullAddress.includes("{{") && this.fullAddress.includes("}}")));
				}
				
				win.customElements.get("mail-address-pill").prototype.isValidAddress = isValidAddress;
				
			}
			
		} catch(e) { console.warn(e); }
		
	}
	
}

function unloadWindow(win) {
	
	// console.log("unloadWindow()");
	
	if (win.location.href === "chrome://messenger/content/messengercompose/messengercompose.xhtml") {
		
		try {
			
			if (win.mailmerge.isValidAddress) {
				
				win.customElements.get("mail-address-pill").prototype.isValidAddress = win.mailmerge.isValidAddress;
				
			}
			
			delete win.mailmerge;
			
		} catch(e) { console.warn(e); }
		
	}
	
}
