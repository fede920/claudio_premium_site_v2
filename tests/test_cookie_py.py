#!/usr/bin/env python3
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

async def run():
    root = Path(__file__).resolve().parents[1]
    index_file = root / 'index.html'
    if not index_file.exists():
        print('index.html not found at', index_file)
        raise SystemExit(2)

    url = index_file.as_uri()
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto(url)

        # wait for cookie banner
        try:
            await page.wait_for_selector('#cookie-banner', timeout=3000)
        except Exception as e:
            print('cookie-banner not found or not visible')
            await browser.close()
            raise SystemExit(2)

        banner_display = await page.evaluate("getComputedStyle(document.getElementById('cookie-banner')).display")
        if banner_display == 'none':
            print('Banner unexpectedly hidden on load')
            await browser.close()
            raise SystemExit(2)

        # Click accept-all
        await page.click('#accept-all')
        await page.wait_for_timeout(200)
        accepted = await page.evaluate("localStorage.getItem('cookieAccepted')")
        analytics = await page.evaluate("localStorage.getItem('cookie_analytics')")
        if accepted != 'true' or analytics != 'true':
            print('Accept-all did not set localStorage values')
            await browser.close()
            raise SystemExit(2)

        # Reset and test settings flow
        await page.evaluate("localStorage.removeItem('cookieAccepted'); localStorage.removeItem('cookie_analytics');")
        await page.reload()
        await page.wait_for_selector('#open-cookie-settings')
        await page.click('#open-cookie-settings')
        await page.wait_for_selector('#cookie-analytics')
        # check the analytics checkbox and save
        await page.check('#cookie-analytics')
        await page.click('#save-cookie-prefs')
        await page.wait_for_timeout(200)
        accepted2 = await page.evaluate("localStorage.getItem('cookieAccepted')")
        analytics2 = await page.evaluate("localStorage.getItem('cookie_analytics')")
        if accepted2 != 'true' or analytics2 != 'true':
            print('Settings flow did not persist preferences')
            await browser.close()
            raise SystemExit(2)

        # check map iframe exists
        iframe = await page.query_selector('.map-wrap iframe')
        if not iframe:
            print('Map iframe not found')
            await browser.close()
            raise SystemExit(2)

        print('TEST PASS: cookie banner, settings and map iframe behave as expected')
        await browser.close()

if __name__ == '__main__':
    try:
        asyncio.run(run())
    except Exception as e:
        print('TEST FAIL:', e)
        raise SystemExit(2)
