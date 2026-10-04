import json
import os
import re
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

REPO = "DP-Hridayan/aShellYou"
API = f"https://api.github.com/repos/{REPO}"
ROOT = Path(__file__).resolve().parents[2]
STATS = ROOT / "stats.json"
INDEX = ROOT / "index.html"
SITEMAP = ROOT / "sitemap.xml"


def request(url):
    headers = {"Accept": "application/vnd.github+json", "User-Agent": "ashellyou-site-stats"}
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=30)


def get_json(url):
    with request(url) as res:
        return json.load(res)


def contributor_count():
    with request(f"{API}/contributors?per_page=1&anon=1") as res:
        match = re.search(r'[?&]page=(\d+)>; rel="last"', res.headers.get("Link", ""))
        return int(match.group(1)) if match else len(json.load(res))


def total_downloads():
    total = 0
    page = 1
    while True:
        releases = get_json(f"{API}/releases?per_page=100&page={page}")
        total += sum(asset["download_count"] for release in releases for asset in release["assets"])
        if len(releases) < 100:
            return total
        page += 1


def main():
    stats = {
        "stars": get_json(API)["stargazers_count"],
        "downloads": total_downloads(),
        "contributors": contributor_count(),
        "version": get_json(f"{API}/releases/latest")["tag_name"],
    }

    previous = json.loads(STATS.read_text(encoding="utf-8")) if STATS.exists() else {}
    if all(previous.get(key) == value for key, value in stats.items()):
        print("Stats unchanged")
        return

    stats["updated"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    STATS.write_text(json.dumps(stats, indent=2) + "\n", encoding="utf-8")
    print("Stats:", stats)

    if previous.get("version") == stats["version"]:
        return

    plain = stats["version"].lstrip("vV")
    html = INDEX.read_text(encoding="utf-8")
    html = re.sub(r'(data-stat="version">)[^<]*(<)', rf"\g<1>{stats['version']}\g<2>", html)
    html = re.sub(r'("softwareVersion":\s*")[^"]*(")', rf"\g<1>{plain}\g<2>", html)
    INDEX.write_text(html, encoding="utf-8")

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    sitemap = SITEMAP.read_text(encoding="utf-8")
    SITEMAP.write_text(re.sub(r"<lastmod>[^<]*</lastmod>", f"<lastmod>{today}</lastmod>", sitemap), encoding="utf-8")
    print("Version updated to", stats["version"])


if __name__ == "__main__":
    main()
