"""Fetch the reference images selected for the Rick and Morty theme."""
import concurrent.futures
import json
import re
import sys
from pathlib import Path
import urllib.request

ASSETS = {
    'rick': ('https://image.pngaaa.com/771/8867771-middle.png', 'https://www.pngaaa.com/detail/8867771'),
    'morty': ('https://www.pngkey.com/png/full/5-57158_rick-and-morty-png.png', 'https://www.pngkey.com/detail/u2q8a9a9e6i1t4u2_morty-smith-png/'),
    'pickle': ('https://image.pngaaa.com/294/2436294-middle.png', 'https://www.pngaaa.com/detail/2436294'),
    'meeseeks': ('https://image.pngaaa.com/127/1765127-middle.png', 'https://www.pngaaa.com/detail/1765127'),
    'meeseeks-box': ('https://image.pngaaa.com/153/1765153-middle.png', 'https://www.pngaaa.com/detail/1765153'),
    'spaceship': ('https://image.pngaaa.com/300/1232300-middle.png', 'https://www.pngaaa.com/detail/1232300'),
    'portal': ('https://image.pngaaa.com/709/209709-middle.png', 'https://www.pngaaa.com/detail/209709'),
    'citadel': ('https://ik.imagekit.io/1rbgez32no/hocmarketing-org/10/20/og--the-ultimate-guide-to-rick-and-mortys-citadel-of-ricks-unravel-its-mysterious-secrets', 'https://en.hocmarketing.org/the-ultimate-guide-to-rick-and-mortys-citadel-of-ricks-unravel-66754'),
    'citadel-plaza': ('https://images8.alphacoders.com/633/thumb-1920-633250.jpg', 'https://wall.alphacoders.com/big.php?i=633250'),
    'squanchy': ('https://mystickermania.com/cdn/stickers/rick-and-morty/rick-and-morty-squanchy-512x512.png', 'https://mystickermania.com/t/Rick%20and%20Morty/?page=3'),
    'poopybutthole': ('https://image.pngaaa.com/497/4732497-middle.png', 'https://www.pngaaa.com/detail/4732497'),
    'avatar-meeseeks': ('https://image.pngaaa.com/604/4870604-middle.png', 'https://www.pngaaa.com/detail/4870604'),
    'avatar-squanchy': ('https://mystickermania.com/cdn/stickers/rick-and-morty/rick-and-morty-squanchy-512x512.png', 'https://mystickermania.com/t/Rick%20and%20Morty/?page=3'),
    'avatar-poopybutthole': ('https://image.pngaaa.com/497/4732497-middle.png', 'https://www.pngaaa.com/detail/4732497'),
    'pickle-rat': ('https://www.pngmart.com/files/23/Pickle-Rick-PNG-Isolated-Pic.png', 'https://www.pngmart.com/image/754649'),
}
DEST = Path(__file__).resolve().parent.parent / 'public' / 'rick-assets'
DEST.mkdir(exist_ok=True)

def download(item):
    name, (url, source) = item
    if source.startswith('https://www.pngaaa.com/detail/'):
        download_page = source.replace('/detail/', '/download/')
        request = urllib.request.Request(download_page, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(request, timeout=30) as response:
            html = response.read().decode('utf-8', errors='replace')
        match = re.search(r'https://www\.pngaaa\.com/api-download/\d+', html)
        if not match:
            raise RuntimeError(f'{name}: original download link missing')
        url = match.group(0)
    request = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(request, timeout=30) as response:
        data = response.read()
        mime = response.headers.get('Content-Type', '')
    if not mime.startswith('image/') and not data.startswith(b'\x89PNG\r\n\x1a\n'):
        raise RuntimeError(f'{name}: expected image, got {mime}')
    (DEST / f'{name}.png').write_bytes(data)
    return name, len(data), mime

if __name__ == '__main__':
    selected = {name: asset for name, asset in ASSETS.items() if len(sys.argv) == 1 or name in sys.argv[1:]}
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
        for future in [executor.submit(download, item) for item in selected.items()]:
            try:
                print(json.dumps(future.result()))
            except Exception as error:
                print(f'FAILED: {error}')
    (DEST / 'sources.json').write_text(json.dumps({name: {'image': url, 'source': source} for name, (url, source) in ASSETS.items()}, indent=2), encoding='utf-8')
