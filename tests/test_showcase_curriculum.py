from __future__ import annotations

import unittest
from pathlib import Path

from zanim.cli import _load_scene
from zanim.source import get_preview_source

ROOT = Path(__file__).resolve().parents[1]
MODULES = (
    "basics",
    "state_model",
    "layout",
    "timeline",
    "transforms",
    "vectors",
    "math",
    "batches",
    "media",
    "compositing",
    "three_d",
    "kinematics",
    "infinite_space",
)


class ShowcaseCurriculumTests(unittest.TestCase):
    def test_every_lesson_is_source_aware(self):
        for name in MODULES:
            with self.subTest(name=name):
                path = ROOT / "examples" / "showcase" / f"{name}.py"
                text = path.read_text(encoding="utf-8")
                self.assertNotIn("@preview_source", text)
                self.assertNotIn("build_scene", text)
                self.assertRegex(text, r"class \w+\(Scene\):")
                self.assertIn("def setup(self)", text)
                self.assertIn("def construct(self)", text)

                scene = _load_scene(path)
                try:
                    source = get_preview_source(scene)
                    self.assertIsNotNone(source)
                    assert source is not None
                    self.assertTrue(source.object_names)
                    self.assertGreaterEqual(len(scene._registry), 1)
                    if scene._timeline.clips:
                        self.assertTrue(
                            any(
                                id(clip) in scene._timeline._event_actions
                                for clip in scene._timeline.clips
                            )
                        )
                finally:
                    scene._close_media_sources()


if __name__ == "__main__":
    unittest.main()
