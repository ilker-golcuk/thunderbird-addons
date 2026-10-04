"""Build dist/mail-merge-html-preview-<version>.xpi from addon/.

It also checks that the parts this add-on takes from Mail Merge 11.6.1 as they are
(permissions, experiment API, background, options, and all merge, data-source and
sending code) still match Mail Merge 11.6.1, using the SHA-256 fingerprints below.
"""
from pathlib import Path
import hashlib
import json
import zipfile

# SHA-256 of files in the Mail Merge 11.6.1 package (addons.thunderbird.net).
MAIL_MERGE_11_6_1 = {
    'background.js': 'b7f7860651aed650398aae7b875711a1e28130b7b5459549c8c52e9fbe1f7494',
    'experiment/implementation.js': 'fbb6e6a1b689a38d992eb426e75a79178aa6e0890f8499862818426ea13021e9',
    'experiment/schema.json': '3638ca388ed1ad5dc627bbde0604e70825ef957c2a119a2a159ed9a676bb9bd2',
    'content/options.html': 'ba8fd4aad1a517d7d0aa58cdfaf9e8dc6eb8bcb22b2585f3a55667890324adc5',
    'content/options.js': 'f993c2b7dde465dc9072905bfa165e6b569dc4fd4b42c390c9f443aa8a5920bd',
    'content/xlsx.core.min.js': '197255b0c278588117e45c14c1b25398562864cd9ffa9752c4b4d29f6d9bfd27',
    'license.txt': '8ceb4b9ee5adedde47b31e975c1d90c73ad27b6b165a1dcd80c7c545eb65b903',
}
# dialog.js from its send section to the end: sending, merging, substitution, data sources.
MAIL_MERGE_DIALOG_SEND_ONWARD = 'd62afe78487943de98220ce5bc6aa6f4bbbab678a2b3c4a0f9c0c8209000a389'
# manifest.json keys: applications, background, permissions, experiment_apis, compose_action, commands.
MAIL_MERGE_MANIFEST_KEYS = '247de27378decea5770d17f72e661e37e5574df605065a075096806b6bf72e1f'

sha256 = lambda data: hashlib.sha256(data).hexdigest()

root = Path(__file__).resolve().parent
addon = root / 'addon'
manifest = json.loads((addon / 'manifest.json').read_text(encoding='utf-8'))

for path, digest in MAIL_MERGE_11_6_1.items():
    assert sha256((addon / path).read_bytes()) == digest, path
dialog = (addon / 'content/dialog.js').read_bytes()
assert sha256(dialog[dialog.index(b'\n\tsend: {'):]) == MAIL_MERGE_DIALOG_SEND_ONWARD, 'dialog.js send section'
keys = ['applications', 'background', 'permissions', 'experiment_apis', 'compose_action', 'commands']
assert sha256(json.dumps({key: manifest[key] for key in keys}, sort_keys=True).encode()) == MAIL_MERGE_MANIFEST_KEYS, 'manifest.json'
print('Verified: permissions, experiment API, background, options and all merge/send code match Mail Merge 11.6.1.')

dist = root / 'dist'
dist.mkdir(exist_ok=True)
output = dist / f'mail-merge-html-preview-{manifest["version"]}.xpi'

files = sorted(path for path in addon.rglob('*') if path.is_file() and path.name != '.DS_Store')
with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as package:
    for path in files:
        package.write(path, path.relative_to(addon).as_posix())

with zipfile.ZipFile(output) as package:
    assert package.testzip() is None
    assert {'license.txt', 'THIRD-PARTY-NOTICES.txt'} <= set(package.namelist())
    for name in package.namelist():
        if name.endswith('.json'):
            json.loads(package.read(name).decode('utf-8-sig'))
    english = json.loads(package.read('_locales/en/messages.json'))
    for name in package.namelist():
        if name.startswith('_locales/') and name.endswith('messages.json'):
            preview = {key for key in json.loads(package.read(name)) if key.startswith('mailmerge.preview.')}
            assert preview <= set(english), name

print('Package:', output.relative_to(root))
print('SHA256:', sha256(output.read_bytes()))
