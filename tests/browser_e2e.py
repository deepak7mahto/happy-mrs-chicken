#!/usr/bin/env python3
"""
Automated Headless Browser End-to-End Test Suite for Adventures of Trishu
Uses Playwright to verify:
1. Free Play as default view mode
2. Mobile portrait layout & zero UI collision across iPhone & Android viewports
3. Mobile touch interactions, game launching, and modal dialogs
4. Mode switching between Free Play and Story Journey
5. Desktop landscape layout and deep linking
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
    print("   Adventures of Trishu - Mobile & Free Play E2E Tests     ")
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
            # TEST 1: Mobile iPhone 14 Viewport (390x844) - Free Play Default
            # -------------------------------------------------------------
            print("\n▶ Test 1: Mobile iPhone 14 (390x844) - Free Play Default & Layout")
            context_iphone = browser.new_context(
                viewport={"width": 390, "height": 844},
                device_scale_factor=2,
                has_touch=True,
                is_mobile=True
            )
            page_m = context_iphone.new_page()
            page_m.goto(base_url, wait_until="networkidle")
            page_m.wait_for_timeout(1000)

            # Verify Free Play is the default view mode
            default_mode = page_m.evaluate("() => window.__GAME_ENGINE__?.storyViewMode")
            assert_test("Default view mode is Free Play (grid)", default_mode == "grid", f"(Mode: {default_mode})")

            # Check HUD elements existence
            hud_brand = page_m.locator(".hud-brand")
            hud_controls = page_m.locator(".hud-controls-right")
            hud_mode_toggle = page_m.locator(".hud-mode-row-mobile .hud-mode-toggle")

            assert_test("Brand logo is visible", hud_brand.is_visible())
            assert_test("HUD controls right is visible", hud_controls.is_visible())
            assert_test("Mobile mode toggle is visible", hud_mode_toggle.is_visible())

            # Free play pill active
            free_pill = page_m.locator(".hud-mode-row-mobile .hud-mode-pill", has_text="Free Play")
            is_active_class = "active" in (free_pill.get_attribute("class") or "")
            assert_test("Free Play mode pill is active by default", is_active_class)

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

            screenshot_iphone = os.path.join(ARTIFACTS_DIR, "screenshot_mobile_freeplay_default.png")
            page_m.screenshot(path=screenshot_iphone)
            print(f"  [i] Saved screenshot: {screenshot_iphone}")

            # -------------------------------------------------------------
            # TEST 2: Mobile Touch Mini-Game Launch & Gameplay
            # -------------------------------------------------------------
            print("\n▶ Test 2: Mobile Touch Mini-Game Launch & Return Home")
            page_m.evaluate("() => window.__GAME_ENGINE__?.changeScene('EGG_LAYING')")
            page_m.wait_for_timeout(600)

            current_scene = page_m.evaluate("() => window.__GAME_ENGINE__?.currentSceneId")
            assert_test("Game started (Egg Laying mode)", current_scene == "EGG_LAYING", f"(Scene: {current_scene})")

            # Verify in-game Home button
            home_btn = page_m.locator(".hud-btn-home")
            assert_test("In-game Home button is visible", home_btn.is_visible())

            screenshot_game = os.path.join(ARTIFACTS_DIR, "screenshot_mobile_gameplay.png")
            page_m.screenshot(path=screenshot_game)
            print(f"  [i] Saved screenshot: {screenshot_game}")

            # Tap Return to Home
            home_btn.click()
            page_m.wait_for_timeout(500)
            menu_scene = page_m.evaluate("() => window.__GAME_ENGINE__?.currentSceneId")
            assert_test("Returned to MENU scene via mobile Home button", menu_scene == "MENU")

            # -------------------------------------------------------------
            # TEST 3: Mobile Mode Switching (Free Play <-> Story Journey)
            # -------------------------------------------------------------
            print("\n▶ Test 3: Mobile Mode Switching")

            # Switch to Story Journey
            journey_pill = page_m.locator(".hud-mode-row-mobile .hud-mode-pill", has_text="Story Journey")
            journey_pill.click()
            page_m.wait_for_timeout(500)
            journey_active = page_m.evaluate("() => window.__GAME_ENGINE__?.storyViewMode === 'journey'")
            assert_test("Switched to Story Journey mode on mobile", journey_active)

            screenshot_journey = os.path.join(ARTIFACTS_DIR, "screenshot_mobile_story_journey.png")
            page_m.screenshot(path=screenshot_journey)
            print(f"  [i] Saved screenshot: {screenshot_journey}")

            # Switch back to Free Play
            free_pill = page_m.locator(".hud-mode-row-mobile .hud-mode-pill", has_text="Free Play")
            free_pill.click()
            page_m.wait_for_timeout(500)
            free_active = page_m.evaluate("() => window.__GAME_ENGINE__?.storyViewMode === 'grid'")
            assert_test("Switched back to Free Play mode on mobile", free_active)

            # -------------------------------------------------------------
            # TEST 4: Mobile Action Buttons & Modals Interaction
            # -------------------------------------------------------------
            print("\n▶ Test 4: Mobile Action Buttons & Modals Interaction")

            # 4a. Avatar Selection Modal
            avatar_btn = page_m.locator(".hud-btn-avatar")
            assert_test("Avatar button exists", avatar_btn.is_visible())
            avatar_btn.click()
            page_m.wait_for_timeout(500)

            avatar_modal = page_m.locator(".avatar-modal-card")
            assert_test("Avatar modal opened on mobile click", avatar_modal.is_visible())

            # Select George Pig avatar
            george_card = page_m.locator(".avatar-card", has_text="George Pig")
            assert_test("George Pig avatar card exists", george_card.is_visible())
            george_card.click()
            page_m.wait_for_timeout(300)

            # Confirm selection with Let's Play button
            confirm_btn = page_m.locator(".avatar-confirm-btn")
            confirm_btn.click()
            page_m.wait_for_timeout(500)
            assert_test("Avatar modal closed after confirmation", not avatar_modal.is_visible())

            # 4b. Settings Modal
            settings_btn = page_m.locator(".hud-btn-settings")
            assert_test("Settings button exists", settings_btn.is_visible())
            settings_btn.click()
            page_m.wait_for_timeout(500)

            settings_modal = page_m.locator(".settings-modal")
            assert_test("Settings modal opened on mobile", settings_modal.is_visible())

            # Toggle Toddler Lock
            lock_toggle = page_m.locator(".settings-row", has_text="Toddler Lock").locator(".settings-toggle-btn")
            assert_test("Toddler lock toggle exists", lock_toggle.is_visible())
            lock_toggle.click()
            page_m.wait_for_timeout(200)

            # Close Settings
            close_settings = page_m.locator(".settings-modal .modal-close-btn")
            close_settings.click()
            page_m.wait_for_timeout(500)
            assert_test("Settings modal closed on mobile", not settings_modal.is_visible())

            # 4c. Passport Modal
            passport_btn = page_m.locator(".hud-btn-passport")
            assert_test("Passport button exists", passport_btn.is_visible())
            passport_btn.click()
            page_m.wait_for_timeout(500)

            passport_modal = page_m.locator(".passport-modal-card")
            assert_test("Passport modal opened on mobile", passport_modal.is_visible())

            close_passport = page_m.locator(".passport-modal-card .modal-close-btn")
            close_passport.click()
            page_m.wait_for_timeout(500)
            assert_test("Passport modal closed on mobile", not passport_modal.is_visible())

            # 4d. Audio Mute Toggle
            audio_btn = page_m.locator(".hud-btn-audio")
            initial_audio_text = audio_btn.inner_text().strip()
            audio_btn.click()
            page_m.wait_for_timeout(200)
            toggled_audio_text = audio_btn.inner_text().strip()
            assert_test(
                "Audio mute button toggled state on mobile",
                initial_audio_text != toggled_audio_text,
                f"({initial_audio_text} -> {toggled_audio_text})"
            )
            audio_btn.click()

            # -------------------------------------------------------------
            # TEST 5: Android Mobile Viewports (Samsung 360x800 & Pixel 412x915)
            # -------------------------------------------------------------
            print("\n▶ Test 5: Android Viewports Responsiveness")

            # 5a. Samsung Galaxy (360x800)
            context_android_360 = browser.new_context(
                viewport={"width": 360, "height": 800},
                device_scale_factor=2,
                has_touch=True,
                is_mobile=True
            )
            page_360 = context_android_360.new_page()
            page_360.goto(base_url, wait_until="networkidle")
            page_360.wait_for_timeout(800)

            b_box_360 = page_360.locator(".hud-brand").bounding_box()
            c_box_360 = page_360.locator(".hud-controls-right").bounding_box()
            assert_test(
                "Android (360px width): Brand & Controls have clearance",
                b_box_360["x"] + b_box_360["width"] <= c_box_360["x"] + 2,
                f"(Right: {b_box_360['x'] + b_box_360['width']:.1f}px, Left: {c_box_360['x']:.1f}px)"
            )
            screenshot_360 = os.path.join(ARTIFACTS_DIR, "screenshot_android_360.png")
            page_360.screenshot(path=screenshot_360)
            print(f"  [i] Saved screenshot: {screenshot_360}")

            # 5b. Google Pixel (412x915)
            context_android_412 = browser.new_context(
                viewport={"width": 412, "height": 915},
                device_scale_factor=2.5,
                has_touch=True,
                is_mobile=True
            )
            page_412 = context_android_412.new_page()
            page_412.goto(base_url, wait_until="networkidle")
            page_412.wait_for_timeout(800)

            b_box_412 = page_412.locator(".hud-brand").bounding_box()
            c_box_412 = page_412.locator(".hud-controls-right").bounding_box()
            assert_test(
                "Google Pixel (412px width): Brand & Controls have clearance",
                b_box_412["x"] + b_box_412["width"] <= c_box_412["x"] + 2,
                f"(Right: {b_box_412['x'] + b_box_412['width']:.1f}px, Left: {c_box_412['x']:.1f}px)"
            )
            screenshot_412 = os.path.join(ARTIFACTS_DIR, "screenshot_android_412.png")
            page_412.screenshot(path=screenshot_412)
            print(f"  [i] Saved screenshot: {screenshot_412}")

            # -------------------------------------------------------------
            # TEST 6: Desktop / Tablet Landscape Viewport (1024x768)
            # -------------------------------------------------------------
            print("\n▶ Test 6: Desktop / Tablet Landscape Layout")
            context_desktop = browser.new_context(
                viewport={"width": 1024, "height": 768},
                device_scale_factor=1
            )
            page_desktop = context_desktop.new_page()
            page_desktop.goto(base_url, wait_until="networkidle")
            page_desktop.wait_for_timeout(800)

            hud_desktop_brand = page_desktop.locator(".hud-brand")
            hud_desktop_mode = page_desktop.locator(".hud-mode-toggle-desktop")
            hud_desktop_controls = page_desktop.locator(".hud-controls-right")

            assert_test("Desktop brand visible", hud_desktop_brand.is_visible())
            assert_test("Desktop mode toggle visible in header", hud_desktop_mode.is_visible())
            assert_test("Desktop controls visible", hud_desktop_controls.is_visible())

            d_brand_box = hud_desktop_brand.bounding_box()
            d_mode_box = hud_desktop_mode.bounding_box()
            d_ctrl_box = hud_desktop_controls.bounding_box()

            brand_right = d_brand_box["x"] + d_brand_box["width"]
            mode_left = d_mode_box["x"]
            mode_right = d_mode_box["x"] + d_mode_box["width"]
            ctrl_left = d_ctrl_box["x"]

            has_breathing_room = (brand_right < mode_left) and (mode_right < ctrl_left)
            assert_test(
                "Desktop header layout has horizontal breathing room",
                has_breathing_room,
                f"Brand: {d_brand_box['x']:.0f}-{brand_right:.0f}, Mode: {mode_left:.0f}-{mode_right:.0f}, Controls: {ctrl_left:.0f}-{ctrl_left + d_ctrl_box['width']:.0f}"
            )

            screenshot_desktop = os.path.join(ARTIFACTS_DIR, "screenshot_landscape_menu.png")
            page_desktop.screenshot(path=screenshot_desktop)
            print(f"  [i] Saved screenshot: {screenshot_desktop}")

            # -------------------------------------------------------------
            # TEST 7: Deep Linking URL Hash Navigation
            # -------------------------------------------------------------
            print("\n▶ Test 7: Deep Linking URL Hash Navigation")
            page_hash = context_iphone.new_page()
            page_hash.goto(f"{base_url}/#duck-picnic", wait_until="networkidle")
            page_hash.wait_for_timeout(1000)

            deep_scene = page_hash.evaluate("() => window.__GAME_ENGINE__?.currentSceneId")
            assert_test("Deep linked to DUCK_PICNIC via #duck-picnic", deep_scene == "DUCK_PICNIC", f"(Scene: {deep_scene})")

            browser.close()

    finally:
        print("\n[*] Stopping preview server...")
        server_proc.terminate()
        try:
            server_proc.wait(timeout=2)
        except subprocess.TimeoutExpired:
            server_proc.kill()

    print("\n============================================================")
    print(f"   Headless Browser E2E Tests: {passed_tests}/{total_tests} PASSED   ")
    print("============================================================")

    if passed_tests == total_tests:
        print("\n🎉 ALL E2E BROWSER TESTS PASSED SUCCESSFULLY!")
        sys.exit(0)
    else:
        print(f"\n❌ {total_tests - passed_tests} TEST(S) FAILED.")
        sys.exit(1)

if __name__ == "__main__":
    run_e2e_tests()
