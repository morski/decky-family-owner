#!/usr/bin/env python3
"""Build/verify the explicitly allowlisted native Decky install archive."""
import argparse
import hashlib
import json
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parent.parent
manifest = json.loads((ROOT / 'package.json').read_text())
PREFIX = manifest['name'] + '/'
ARTIFACT = ROOT / 'out' / f"FamilyOwner-v{manifest['version']}.zip"
FILES = ['dist/index.js', 'plugin.json', 'package.json', 'README.md', 'LICENSE',
         'docs/architecture.md', 'docs/design.md', 'docs/development.md',
         'docs/installation.md', 'docs/release-notes.md']

def contents():
    payload = {name: (ROOT / name).read_bytes() for name in FILES}
    runtime = {key: manifest[key] for key in ['name', 'version', 'description', 'type', 'author', 'license']}
    payload['package.json'] = (json.dumps(runtime, indent=2) + '\n').encode()
    assert runtime['type'] == 'module'
    plugin = json.loads(payload['plugin.json'])
    assert plugin['name'] == 'Family Owner' and plugin['api_version'] == 1 and plugin['flags'] == []
    assert payload['dist/index.js'], 'Build frontend first'
    return payload

def verify(payload):
    with ZipFile(ARTIFACT) as archive:
        expected = {PREFIX + name for name in payload}
        assert len(archive.namelist()) == len(expected)
        assert set(archive.namelist()) == expected
        assert archive.testzip() is None
        for name, data in payload.items():
            assert archive.read(PREFIX + name) == data, f'Stale archive: {name}'
    digest = hashlib.sha256(ARTIFACT.read_bytes()).hexdigest()
    sidecar = ARTIFACT.with_suffix('.zip.sha256')
    if args.verify:
        assert sidecar.read_text() == f'{digest}  {ARTIFACT.name}\n'
    else:
        sidecar.write_text(f'{digest}  {ARTIFACT.name}\n')
    print(f'Verified {ARTIFACT.relative_to(ROOT)}: {len(payload)} files, {ARTIFACT.stat().st_size} bytes')
    print(f'SHA-256 {digest}')

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--verify', action='store_true', help='verify existing archive without writing')
args = parser.parse_args()
payload = contents()
if not args.verify:
    ARTIFACT.parent.mkdir(exist_ok=True)
    with ZipFile(ARTIFACT, 'w', compression=ZIP_DEFLATED) as archive:
        for name, data in sorted(payload.items()):
            info = ZipInfo(PREFIX + name, (1980, 1, 1, 0, 0, 0))
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            info.compress_type = ZIP_DEFLATED
            archive.writestr(info, data)
verify(payload)
