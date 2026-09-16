#!/usr/bin/env python3
"""
Automated Headless Browser End-to-End Test Suite for Adventures of Trishu
Uses Playwright to verify responsive layout, zero UI overlap, action buttons, modals, and gameplay.
"""

import os
import sys
import time
import subprocess
from playwright.sync_api import sync_playwright

ARTIFACTS_DIR = os.path.join(os.path.dirname(__file__), 'artifacts')
os.makedirs(ARTIFACTS_DIR, exist_ok=True)

def run_e2e_tests():
    print("============================================================")
    print("   Adventures of Trishu - Playwright Headless Browser E2E   ")
    print("============================================================")

    # 1. Start preview server
    port = 4173
    server_cmd = ["npx", "vite", "preview", "--port", str(port), "--strictPort"]
    print(f"[*] Starting preview server on port {port}...")
    server_proc = subprocess.Popen(
        server_cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    time.sleep(2.5)

    base_url = f"http://localhost:{port}"

    passed_tests = 0
    total_tests = 0

    def assert_test(name, condition, details=""):
        nonlocal passed_tests, total_tests
        total_tests += 1
        if condition:
            passed_tests += 1
            print(f"  ✓ PASS: {name} {details}")
        else:
            print(f"  ✗ FAIL: {name} {details}")
            raise AssertionError(f"Test failed: {name} - {details}")

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)

            # -------------------------------------------------------------
            # TEST 1: Mobile Portrait Viewport (390x844 - iPhone 14 / Android)
            # -------------------------------------------------------------
            print("\n▶ Test 1: Mobile Portrait Layout & Zero UI Overlap")
            context_mobile = browser.new_context(
                viewport={"width": 390, "height": 844},
                device_scale_factor=2,
                has_touch=True,
                is_mobile=True
            )
            page = context_mobile.new_page()
            page.goto(base_url, wait_until="networkidle")
            page.wait_for_timeout(1000)

            # Check HUD elements existence
            hud_brand = page.locator(".hud-brand")
            hud_controls = page.locator(".hud-controls-right")
            hud_mode_toggle = page.locator(".hud-mode-row-mobile .hud-mode-toggle")

            assert_test("Brand logo is visible", hud_brand.is_visible())
            assert_test("HUD controls right is visible", hud_controls.is_visible())
            assert_test("Mobile mode toggle is visible", hud_mode_toggle.is_visible())

            # Bounding Box Overlap Verification
            brand_box = hud_brand.bounding_box()
            controls_box = hud_controls.bounding_box()
            mode_box = hud_mode_toggle.bounding_box()

            # Verify brand and controls do not collide horizontally
            brand_right = brand_box["x"] + brand_box["width"]
            controls_left = controls_box["x"]
            assert_test(
                "Brand and right controls have horizontal clearance",
                brand_right <= controls_left + 2,
                f"(Brand right: {brand_right:.1f}px, Controls left: {controls_left:.1f}px)"
            )

            # Verify mode toggle row is below top bar
            top_bar_bottom = max(brand_box["y"] + brand_box["height"], controls_box["y"] + controls_box["height"])
            assert_test(
                "Mode toggle is positioned cleanly below top bar",
                mode_box["y"] >= top_bar_bottom - 2,
                f"(Top bar bottom: {top_bar_bottom:.1f}px, Mode row y: {mode_box['y']:.1f}px)"
            )

            portrait_screenshot = os.path.join(ARTIFACTS_DIR, "screenshot_portrait_menu.png")
            page.screenshot(path=portrait_screenshot)
            print(f"  [i] Saved screenshot: {portrait_screenshot}")

            # -------------------------------------------------------------
            # TEST 2: Action Buttons & Modals Interaction
            # -------------------------------------------------------------
            print("\n▶ Test 2: Action Buttons & Modals Interaction")

            # 2a. Open Avatar Selection Modal
            avatar_btn = page.locator(".hud-btn-avatar")
            assert_test("Avatar button exists", avatar_btn.is_visible())
            avatar_btn.click()
            page.wait_for_timeout(500)

            avatar_modal = page.locator(".avatar-modal-card")
            assert_test("Avatar modal opened on click", avatar_modal.is_visible())

            # Select George Pig avatar
            george_card = page.locator(".avatar-card", has_text="George Pig")
            assert_test("George Pig avatar card exists", george_card.is_visible())
            george_card.click()
            page.wait_for_timeout(300)

            # Confirm selection with Let's Play button
            confirm_btn = page.locator(".avatar-confirm-btn")
            confirm_btn.click()
            page.wait_for_timeout(500)
            assert_test("Avatar modal closed after confirmation", not avatar_modal.is_visible())

            # 2b. Open Settings Modal
            settings_btn = page.locator(".hud-btn-settings")
            assert_test("Settings button exists", settings_btn.is_visible())
            settings_btn.click()
            page.wait_for_timeout(500)

            settings_modal = page.locator(".settings-modal")
            assert_test("Settings modal opened", settings_modal.is_visible())

            # Toggle Toddler Lock
            lock_toggle = page.locator(".settings-row", has_text="Toddler Lock").locator(".settings-toggle-btn")
            assert_test("Toddler lock toggle exists", lock_toggle.is_visible())
            lock_toggle.click()
            page.wait_for_timeout(200)

            # Close Settings
            close_settings = page.locator(".settings-modal .modal-close-btn")
            close_settings.click()
            page.wait_for_timeout(500)
            assert_test("Settings modal closed", not settings_modal.is_visible())

            # 2c. Open Passport Modal
            passport_btn = page.locator(".hud-btn-passport")
            assert_test("Passport button exists", passport_btn.is_visible())
            passport_btn.click()
            page.wait_for_timeout(500)

            passport_modal = page.locator(".passport-modal-card")
            assert_test("Passport modal opened", passport_modal.is_visible())

            close_passport = page.locator(".passport-modal-card .modal-close-btn")
            close_passport.click()
            page.wait_for_timeout(500)
            assert_test("Passport modal closed", not passport_modal.is_visible())

            # 2d. Audio Mute Toggle
            audio_btn = page.locator(".hud-btn-audio")
            initial_audio_text = audio_btn.inner_text().strip()
            audio_btn.click()
            page.wait_for_timeout(200)
            toggled_audio_text = audio_btn.inner_text().strip()
            assert_test(
                "Audio mute button toggled state",
                initial_audio_text != toggled_audio_text,
                f"({initial_audio_text} -> {toggled_audio_text})"
            )
            # Toggle back
            audio_btn.click()

            # -------------------------------------------------------------
            # TEST 3: Mode Switcher (Story Journey <-> Free Play)
            # -------------------------------------------------------------
            print("\n▶ Test 3: Dual Mode Switcher")

            free_play_pill = page.locator(".hud-mode-pill:visible", has_text="Free Play")
            free_play_pill.click()
            page.wait_for_timeout(500)

            free_play_active = page.evaluate("() => window.__GAME_ENGINE__?.storyViewMode === 'grid'")
            assert_test("Switched to Free Play grid mode", free_play_active)

            free_play_screenshot = os.path.join(ARTIFACTS_DIR, "screenshot_free_play.png")
            page.screenshot(path=free_play_screenshot)
            print(f"  [i] Saved screenshot: {free_play_screenshot}")

            # Switch back to Story Journey
            journey_pill = page.locator(".hud-mode-pill:visible", has_text="Story Journey")
            journey_pill.click()
            page.wait_for_timeout(500)
            journey_active = page.evaluate("() => window.__GAME_ENGINE__?.storyViewMode === 'journey'")
            assert_test("Switched back to Story Journey mode", journey_active)

            # -------------------------------------------------------------
            # TEST 4: Story Launch & Gameplay Interaction
            # -------------------------------------------------------------
            print("\n▶ Test 4: Story Launch & In-Game Home Button")

            # Click bottom continue banner or launch stop 0 directly
            page.evaluate("() => window.__GAME_ENGINE__?.launchStoryStop(0, true)")
            page.wait_for_timeout(600)

            story_intro = page.locator(".story-intro-card")
            assert_test("Story intro modal appeared", story_intro.is_visible())

            start_story_btn = page.locator(".story-intro-start-btn")
            start_story_btn.click()
            page.wait_for_timeout(600)

            current_scene = page.evaluate("() => window.__GAME_ENGINE__?.currentSceneId")
            assert_test("Game started (Egg Laying mode)", current_scene == "EGG_LAYING", f"(Scene: {current_scene})")

            gameplay_screenshot = os.path.join(ARTIFACTS_DIR, "screenshot_gameplay.png")
            page.screenshot(path=gameplay_screenshot)
            print(f"  [i] Saved screenshot: {gameplay_screenshot}")

            # Verify in-game Home button
            home_btn = page.locator(".hud-btn-home")
            assert_test("In-game Home button is visible", home_btn.is_visible())

            # Return to Menu
            page.evaluate("() => window.__GAME_ENGINE__?.changeScene('MENU')")
            page.wait_for_timeout(500)
            menu_scene = page.evaluate("() => window.__GAME_ENGINE__?.currentSceneId")
            assert_test("Returned to MENU scene", menu_scene == "MENU")

            # -------------------------------------------------------------
            # TEST 5: Desktop Landscape Viewport (1024x768)
            # -------------------------------------------------------------
            print("\n▶ Test 5: Desktop / Tablet Landscape Layout")
            context_desktop = browser.new_context(
                viewport={"width": 1024, "height": 768},
                device_scale_factor=1
            )
            page_desktop = context_desktop.new_page()
            page_desktop.goto(base_url, wait_until="networkidle")
            page_desktop.wait_for_timeout(1000)

            desktop_brand = page_desktop.locator(".hud-brand")
            desktop_mode_toggle = page_desktop.locator(".hud-mode-toggle-desktop")
            desktop_controls = page_desktop.locator(".hud-controls-right")

            assert_test("Desktop brand visible", desktop_brand.is_visible())
            assert_test("Desktop mode toggle visible in header", desktop_mode_toggle.is_visible())
            assert_test("Desktop controls visible", desktop_controls.is_visible())

            d_brand_box = desktop_brand.bounding_box()
            d_mode_box = desktop_mode_toggle.bounding_box()
            d_controls_box = desktop_controls.bounding_box()

            assert_test(
                "Desktop header layout has horizontal breathing room",
                d_brand_box["x"] + d_brand_box["width"] < d_mode_box["x"] and
                d_mode_box["x"] + d_mode_box["width"] < d_controls_box["x"],
                f"Brand: {d_brand_box['x']:.0f}-{d_brand_box['x']+d_brand_box['width']:.0f}, "
                f"Mode: {d_mode_box['x']:.0f}-{d_mode_box['x']+d_mode_box['width']:.0f}, "
                f"Controls: {d_controls_box['x']:.0f}-{d_controls_box['x']+d_controls_box['width']:.0f}"
            )

            landscape_screenshot = os.path.join(ARTIFACTS_DIR, "screenshot_landscape_menu.png")
            page_desktop.screenshot(path=landscape_screenshot)
            print(f"  [i] Saved screenshot: {landscape_screenshot}")

            # -------------------------------------------------------------
            # TEST 6: Deep Linking URL Hash Navigation
            # -------------------------------------------------------------
            print("\n▶ Test 6: Deep Linking URL Hash Navigation")
            page_desktop.goto(f"{base_url}/#duck-picnic", wait_until="networkidle")
            page_desktop.wait_for_timeout(1000)

            deep_scene = page_desktop.evaluate("() => window.__GAME_ENGINE__?.currentSceneId")
            assert_test("Deep linked to DUCK_PICNIC via #duck-picnic", deep_scene == "DUCK_PICNIC", f"(Scene: {deep_scene})")

            browser.close()

    finally:
        print("\n[*] Stopping preview server...")
        server_proc.terminate()
        try:
            server_proc.wait(timeout=3)
        except subprocess.TimeoutExpired:
            server_proc.kill()

    print("\n============================================================")
    print(f"   Headless Browser E2E Tests: {passed_tests}/{total_tests} PASSED   ")
    print("============================================================")

if __name__ == "__main__":
    run_e2e_tests()
