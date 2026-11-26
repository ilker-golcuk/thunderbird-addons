"""Build dist/mail-merge-html-preview-<version>.xpi from addon/.

It also checks that the parts this add-on takes from Mail Merge 11.6.1 as they are
(permissions, experiment API, background, options, and all merge, data-source and
sending code) still match Mail Merge 11.6.1, using the SHA-256 fingerprints below.

    python3 build.py                     build the package
    python3 build.py --update-manifest   also list this version in updates.json

The package is reproducible: the same addon/ files always give the same bytes, so the
hash in updates.json matches the file attached to the GitHub release.
"""
from pathlib import Path
import argparse
import hashlib
import json
import zipfile

# The Mail Merge release this add-on is built on.
MAIL_MERGE_VERSION = '11.6.1'
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
# Mail Merge 11.6.1 shipped with strict_max_version 158.*. addons.thunderbird.net later raised
# its supported range with no code change, and this build follows that range
# (tools/follow_mail_merge.py raises it). The fingerprint above is checked against the
# manifest with the shipped value put back and this build's update_url taken out.
MAIL_MERGE_SHIPPED_MAX_VERSION = '158.*'
MAIL_MERGE_MAX_VERSION = '162.*'

# Thunderbird checks this file for new versions (about once a day) instead of
# addons.thunderbird.net, so an official Mail Merge update does not replace this build.
REPOSITORY = 'https://github.com/ilker-golcuk/thunderbird-addons'
UPDATE_URL = 'https://raw.githubusercontent.com/ilker-golcuk/thunderbird-addons/main/mail-merge-html-preview/updates.json'
TAG = 'mail-merge-html-preview-v{version}'
PACKAGE = 'mail-merge-html-preview-{version}.xpi'
ADDON_ID = 'mailmerge@example.net'

sha256 = lambda data: hashlib.sha256(data).hexdigest()

root = Path(__file__).resolve().parent
addon = root / 'addon'


def verify(manifest):
    for path, digest in MAIL_MERGE_11_6_1.items():
        assert sha256((addon / path).read_bytes()) == digest, path
    dialog = (addon / 'content/dialog.js').read_bytes()
    assert sha256(dialog[dialog.index(b'\n\tsend: {'):]) == MAIL_MERGE_DIALOG_SEND_ONWARD, 'dialog.js send section'
    keys = ['applications', 'background', 'permissions', 'experiment_apis', 'compose_action', 'commands']
    shipped = json.loads(json.dumps({key: manifest[key] for key in keys}))
    gecko = shipped['applications']['gecko']
    assert gecko.pop('update_url') == UPDATE_URL, 'manifest.json update_url'
    assert gecko['strict_max_version'] == MAIL_MERGE_MAX_VERSION, 'manifest.json strict_max_version'
    gecko['strict_max_version'] = MAIL_MERGE_SHIPPED_MAX_VERSION
    assert sha256(json.dumps(shipped, sort_keys=True).encode()) == MAIL_MERGE_MANIFEST_KEYS, 'manifest.json'
    print('Verified: permissions, experiment API, background, options and all merge/send code match Mail Merge 11.6.1.')


def package(output, manifest_bytes):
    """Writes the .xpi with fixed timestamps and permissions, so the bytes depend only on the files."""
    files = sorted(path for path in addon.rglob('*') if path.is_file() and path.name != '.DS_Store')
    with zipfile.ZipFile(output, 'w') as xpi:
        for path in files:
            name = path.relative_to(addon).as_posix()
            info = zipfile.ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            xpi.writestr(info, manifest_bytes if name == 'manifest.json' else path.read_bytes())

    with zipfile.ZipFile(output) as xpi:
        assert xpi.testzip() is None
        assert {'license.txt', 'THIRD-PARTY-NOTICES.txt'} <= set(xpi.namelist())
        for name in xpi.namelist():
            if name.endswith('.json'):
                json.loads(xpi.read(name).decode('utf-8-sig'))
        english = json.loads(xpi.read('_locales/en/messages.json'))
        for name in xpi.namelist():
            if name.startswith('_locales/') and name.endswith('messages.json'):
                preview = {key for key in json.loads(xpi.read(name)) if key.startswith('mailmerge.preview.')}
                assert preview <= set(english), name


def update_entry(version, gecko, link, digest):
    return {
        'version': version,
        'update_link': link,
        'update_hash': 'sha256:' + digest,
        'applications': {'gecko': {
            'strict_min_version': gecko['strict_min_version'],
            'strict_max_version': gecko['strict_max_version'],
        }},
    }


def write_update_manifest(path, entry):
    """Adds this version to updates.json, replacing an entry with the same version."""
    data = json.loads(path.read_text(encoding='utf-8')) if path.exists() else {'addons': {ADDON_ID: {'updates': []}}}
    updates = [update for update in data['addons'][ADDON_ID]['updates'] if update['version'] != entry['version']]
    data['addons'][ADDON_ID]['updates'] = updates + [entry]
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--update-manifest', action='store_true', help='list this version in updates.json')
    # For test/update.cjs only: package with another version and update URL.
    parser.add_argument('--version', help=argparse.SUPPRESS)
    parser.add_argument('--update-url', help=argparse.SUPPRESS)
    parser.add_argument('--out', help=argparse.SUPPRESS)
    parser.add_argument('--updates-json', help=argparse.SUPPRESS)
    parser.add_argument('--update-link', help=argparse.SUPPRESS)
    args = parser.parse_args()

    manifest_bytes = (addon / 'manifest.json').read_bytes()
    manifest = json.loads(manifest_bytes.decode('utf-8'))
    verify(manifest)

    if args.version or args.update_url or args.out or args.updates_json:
        assert args.out and not args.update_manifest, '--out is required, and --update-manifest is not allowed'
        manifest['version'] = args.version or manifest['version']
        manifest['applications']['gecko']['update_url'] = args.update_url or UPDATE_URL
        manifest_bytes = json.dumps(manifest, indent='\t', ensure_ascii=False).encode('utf-8')
        output = Path(args.out).resolve()
    else:
        dist = root / 'dist'
        dist.mkdir(exist_ok=True)
        output = dist / PACKAGE.format(version=manifest['version'])

    package(output, manifest_bytes)
    digest = sha256(output.read_bytes())
    print('Package:', output.relative_to(root) if output.is_relative_to(root) else output)
    print('SHA256:', digest)

    if args.updates_json:
        assert args.update_link, '--update-link is required with --updates-json'
        write_update_manifest(Path(args.updates_json), update_entry(manifest['version'], manifest['applications']['gecko'], args.update_link, digest))

    if args.update_manifest:
        version = manifest['version']
        link = f'{REPOSITORY}/releases/download/{TAG.format(version=version)}/{PACKAGE.format(version=version)}'
        write_update_manifest(root / 'updates.json', update_entry(version, manifest['applications']['gecko'], link, digest))
        print('Listed', version, 'in updates.json')


if __name__ == '__main__':
    main()
