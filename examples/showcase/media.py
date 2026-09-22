"""Lesson 09: media playback and transforms on the same Scene-owned timeline."""

from __future__ import annotations

from pathlib import Path

from zanim import (
    BOTTOM,
    DOWN,
    GIF,
    TOP,
    Audio,
    Canvas,
    Group,
    Image,
    Row,
    Scene,
    Text,
    Vec2,
    Video,
)

EXAMPLES = Path(__file__).resolve().parents[1]
ASSETS = EXAMPLES / "assets/media_demo"


class MediaExample(Scene):
    def construct(self) -> None:
        self.canvas = Canvas(1280, 720, 110)
        self.fps = 30

        image = Image(ASSETS / "image.png", width=3.4, z_index=1)
        gif = GIF(ASSETS / "anim.gif", width=3.0, z_index=1)
        video = Video(ASSETS / "clip.mp4", width=3.8, z_index=1)
        video_audio = video.audio_track(gain=0.55)
        tone = Audio(ASSETS / "tone.wav", gain=0.18)
        labels = Group(
            [
                Text("IMAGE", font_size=24),
                Text("GIF", font_size=24),
                Text("VIDEO + AUDIO", font_size=24),
            ],
            z_index=4,
        )

        Row(gap=0.55, at=self.frame.center + 0.35 * Vec2(0, 1)).place(image, gif, video)
        for media, label in zip((image, gif, video), labels.children):
            label.place(anchor=TOP, at=media.anchor(BOTTOM) + 0.22 * DOWN)

        self.add(labels)
        image, gif, video, video_audio, tone = self.add(
            image, gif, video, video_audio, tone
        )
        with self.parallel(duration=5):
            image.media(duration=5)
            gif.media(duration=5, loop=True)
            video.media(duration=4, source_start=0.25, speed=1.25, loop=True, at=0.5)
            video_audio.media(
                duration=4, source_start=0.25, speed=1.25, loop=True, at=0.5
            )
            tone.media(duration=5, loop=True)
            image.affine(position=image.origin, rotation=0.30, scale=1.08)
            gif.affine(position=gif.origin + Vec2(0, 0.25), rotation=-0.16)
            video.affine(position=video.origin, rotation=0.18)
