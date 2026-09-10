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
    def setup(self) -> None:
        self.canvas = Canvas(1280, 720, 110)
        self.fps = 30
        self.image = Image(ASSETS / "image.png", width=3.4, z_index=1)
        self.gif = GIF(ASSETS / "anim.gif", width=3.0, z_index=1)
        self.video = Video(ASSETS / "clip.mp4", width=3.8, z_index=1)
        self.video_audio = self.video.audio_track(gain=0.55)
        self.tone = Audio(ASSETS / "tone.wav", gain=0.18)
        self.image_label = Text("IMAGE", font_size=24)
        self.gif_label = Text("GIF", font_size=24)
        self.video_label = Text("VIDEO + AUDIO", font_size=24)
        self.labels = Group(
            [self.image_label, self.gif_label, self.video_label], z_index=4
        )

    def construct(self) -> None:
        image, gif, video = self.image, self.gif, self.video
        video_audio, tone = self.video_audio, self.tone
        image_label, gif_label, video_label = (
            self.image_label,
            self.gif_label,
            self.video_label,
        )
        labels = self.labels
        Row(gap=0.55, at=self.frame.center + 0.35 * Vec2(0, 1)).place(image, gif, video)
        for media, label in zip(
            (image, gif, video), (image_label, gif_label, video_label)
        ):
            label.place(anchor=TOP, at=media.anchor(BOTTOM) + 0.22 * DOWN)
        image, gif, video, video_audio, tone, _labels = self.add(
            image, gif, video, video_audio, tone, labels
        )
        with self.parallel(duration=5):
            image.media(duration=5)
            gif.media(duration=5, loop=True)
            video.media(duration=4, source_start=0.25, speed=1.25, loop=True, at=0.5)
            video_audio.media(
                duration=4, source_start=0.25, speed=1.25, loop=True, at=0.5
            )
            tone.media(duration=5, loop=True)
            image.transform(to=image.transform_value.rotate(0.30).scale(1.08))
            gif.transform(to=gif.transform_value.translate(0, 0.25).rotate(-0.16))
            video.transform(to=video.transform_value.rotate(0.18))
