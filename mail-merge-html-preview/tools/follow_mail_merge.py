"""Follow Mail Merge's Thunderbird range on addons.thunderbird.net.

Mail Merge's author raises the supported Thunderbird range of a release on
addons.thunderbird.net after checking it, without changing its code (11.6.1 went from
158.* to 162.*). This script compares that range for the Mail Merge release this add-on
is built on (build.MAIL_MERGE_VERSION) with manifest.json:

- If addons.thunderbird.net allows a newer Thunderbird, --apply raises strict_max_version
  in manifest.json, build.py and README.md, and bumps the add-on version (11.6.1.5 -> 11.6.1.6).
- If Mail Merge has a newer release, its code changed and the preview has to be moved onto
  it by hand; the result says so (newer_mail_merge).

    python3 tools/follow_mail_merge.py [--apply] [--atn-json versions.json]

Results are printed as key=value lines (also written to $GITHUB_OUTPUT when it is set).
"""
from pathlib import Path
import argparse
import json
import os
import re
import sys
import urllib.request

root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root))
import build  # noqa: E402

ATN_VERSIONS = 'https://addons.thunderbird.net/api/v4/addons/addon/mail-merge/versions/?page_size=50'


def major(version):
    """'162.*' -> 162, '128.0a1' -> 128"""
    return int(re.match(r'\d+', version).group())


def next_version(version):
    """'11.6.1.5' -> '11.6.1.6'"""
    parts = version.split('.')
    return '.'.join(parts[:-1] + [str(int(parts[-1]) + 1)])


def check(versions, manifest):
    """Returns what to do, from the addons.thunderbird.net version list and our manifest."""
    releases = versions['results']
    base = next((release for release in releases if release['version'] == build.MAIL_MERGE_VERSION), None)
    if base is None:
        raise SystemExit(f'Mail Merge {build.MAIL_MERGE_VERSION} is not listed on addons.thunderbird.net')
    atn_max = base['compatibility']['thunderbird']['max']
    ours = manifest['applications']['gecko']['strict_max_version']
    newest = releases[0]['version']
    return {
        'mail_merge': build.MAIL_MERGE_VERSION,
        'atn_max': atn_max,
        'our_max': ours,
        'bump': major(atn_max) > major(ours),
        'version': next_version(manifest['version']) if major(atn_max) > major(ours) else manifest['version'],
        'newer_mail_merge': newest if newest != build.MAIL_MERGE_VERSION else '',
        'newer_mail_merge_max': releases[0]['compatibility']['thunderbird']['max'] if newest != build.MAIL_MERGE_VERSION else '',
    }


def replace_once(text, old, new, label):
    assert text.count(old) == 1, f'{label}: expected one "{old}"'
    return text.replace(old, new)


def apply(result, manifest):
    """Raises the range to result['atn_max'] and the version to result['version']."""
    old_max, new_max = result['our_max'], result['atn_max']

    path = build.addon / 'manifest.json'
    text = path.read_text(encoding='utf-8')
    text = replace_once(text, f'"strict_max_version": "{old_max}"', f'"strict_max_version": "{new_max}"', 'manifest.json')
    text = replace_once(text, f'"version": "{manifest["version"]}"', f'"version": "{result["version"]}"', 'manifest.json')
    path.write_text(text, encoding='utf-8')

    path = root / 'build.py'
    text = path.read_text(encoding='utf-8')
    text = replace_once(text, f"MAIL_MERGE_MAX_VERSION = '{old_max}'", f"MAIL_MERGE_MAX_VERSION = '{new_max}'", 'build.py')
    path.write_text(text, encoding='utf-8')

    path = root / 'README.md'
    text, count = re.subn(r'(Thunderbird 128–)\d+', rf'\g<1>{major(new_max)}', path.read_text(encoding='utf-8'))
    assert count >= 1, 'README.md: no "Thunderbird 128–<max>"'
    path.write_text(text, encoding='utf-8')


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--apply', action='store_true', help='raise the range and the version when addons.thunderbird.net allows it')
    parser.add_argument('--atn-json', help='read the version list from this file instead of addons.thunderbird.net')
    args = parser.parse_args()

    if args.atn_json:
        versions = json.loads(Path(args.atn_json).read_text(encoding='utf-8'))
    else:
        request = urllib.request.Request(ATN_VERSIONS, headers={'User-Agent': 'mail-merge-html-preview-update-check'})
        with urllib.request.urlopen(request, timeout=60) as response:
            versions = json.load(response)

    manifest = json.loads((build.addon / 'manifest.json').read_text(encoding='utf-8'))
    result = check(versions, manifest)
    if args.apply and result['bump']:
        apply(result, manifest)

    lines = [f'{key}={str(value).lower() if isinstance(value, bool) else value}' for key, value in result.items()]
    print('\n'.join(lines))
    if os.environ.get('GITHUB_OUTPUT'):
        with open(os.environ['GITHUB_OUTPUT'], 'a', encoding='utf-8') as output:
            output.write('\n'.join(lines) + '\n')


if __name__ == '__main__':
    main()
