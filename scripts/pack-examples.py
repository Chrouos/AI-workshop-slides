#!/usr/bin/env python3
"""Rebuild the student download ZIPs under examples/ from their source folders.

    python3 scripts/pack-examples.py          # rebuild only the ZIPs whose contents changed
    python3 scripts/pack-examples.py --check  # report stale ZIPs, exit 1 if any

Entries are NFC-normalised, sorted, and stamped with a fixed date, so an
unchanged folder never produces a new ZIP in git.
"""
import fnmatch
import os
import sys
import unicodedata
import zipfile

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'examples')

# (zip path, source folder, top folder name inside the ZIP, excluded names or glob patterns)
PACKS = [
    # Students write their own AGENTS.md and outline in Codex_練習; instructor test runs and videos stay out.
    ('aw-01-lab.zip', 'aw-01-lab', 'aw-01-lab', {'AGENTS.md', '三國演義大綱.md', '*.mov', '*.mp4'}),
    ('aw-02-lab.zip', 'aw-02-lab', 'aw-02-lab', {'.obsidian'}),
    ('aw-03-lab.zip', 'aw-03-lab', 'aw-03-lab', set()),
    ('aw-04-lab.zip', 'aw-04-lab', 'aw-04-lab', set()),
]
SKIP = {'.DS_Store', 'Thumbs.db'}
STAMP = (2026, 1, 1, 0, 0, 0)

nfc = lambda s: unicodedata.normalize('NFC', s)


def excluded(name, patterns):
    return any(fnmatch.fnmatch(name, p) for p in patterns)


def folder_entries(src, top, exclude):
    out = {}
    for dirpath, dirnames, filenames in os.walk(src):
        dirnames[:] = [d for d in dirnames if not excluded(d, exclude)]
        for name in filenames:
            if name in SKIP or excluded(name, exclude):
                continue
            path = os.path.join(dirpath, name)
            rel = os.path.relpath(path, src).replace(os.sep, '/')
            with open(path, 'rb') as f:
                out[nfc(f'{top}/{rel}')] = f.read()
    return out


def zip_entries(path):
    if not os.path.exists(path):
        return None
    with zipfile.ZipFile(path) as z:
        return {nfc(i.filename): z.read(i) for i in z.infolist()
                if not i.is_dir() and '__MACOSX' not in i.filename
                and os.path.basename(i.filename) not in SKIP}


def write_zip(path, entries):
    with zipfile.ZipFile(path, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for name in sorted(entries):
            info = zipfile.ZipInfo(name, STAMP)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            z.writestr(info, entries[name])


def main():
    check = '--check' in sys.argv
    stale = 0
    for zip_rel, src_rel, top, exclude in PACKS:
        zip_path = os.path.join(ROOT, zip_rel)
        want = folder_entries(os.path.join(ROOT, src_rel), top, exclude)
        have = zip_entries(zip_path)
        if have == want:
            print(f'ok      {zip_rel} ({len(want)} files)')
            continue
        stale += 1
        if check:
            print(f'STALE   {zip_rel}')
        else:
            write_zip(zip_path, want)
            print(f'packed  {zip_rel} ({len(want)} files)')
    if check and stale:
        sys.exit(1)


if __name__ == '__main__':
    main()
