"""Lesson 02: raw declarations, Scene-owned authored heads, and explicit lifetime."""

from __future__ import annotations

from zanim import (
    BLUE,
    BOTTOM,
    DOWN,
    GREEN,
    LEFT_CENTER,
    MUTED,
    ORANGE,
    PURPLE,
    RED,
    RIGHT_CENTER,
    TOP,
    UP,
    Canvas,
    Circle,
    Row,
    Scene,
    Square,
    Text,
    Vec2,
)


def card_label(text: str) -> Text:
    return Text(text, font_size=22, color=MUTED)


class StateModel(Scene):
    def construct(self) -> None:
        self.canvas = Canvas(1280, 720, 92)
        self.fps = 60

        title = Text("One definition, two kinds of state", font_size=36)
        rule = Text(
            "raw object = initial definition; bound handle = Scene authored head",
            font_size=23,
            color=MUTED,
        )
        immediate = Square(1.25, fill=BLUE)
        hidden = Circle(0.68, fill=GREEN, opacity=0)
        drawn = Square(1.25, stroke=PURPLE, stroke_width=0.055, trim=0)
        labels = [
            card_label("add() = visible now"),
            card_label("opacity=0; fade_in()"),
            card_label("trim=0; create()"),
        ]

        header = self.frame.top_region(height=1.25)
        content = self.frame.inset(0.65).below(header, gap=0.2)
        title.place(anchor=TOP, at=header.top + 0.24 * DOWN)
        rule.place(anchor=TOP, at=title.anchor(BOTTOM) + 0.14 * DOWN)
        Row(gap=2.7, at=content.center + 0.75 * UP).place(immediate, hidden, drawn)
        for obj, label in zip((immediate, hidden, drawn), labels):
            label.place(anchor=TOP, at=obj.anchor(BOTTOM) + 0.42 * DOWN)

        self.add(title, rule, *labels)
        immediate, hidden, drawn = self.add(immediate, hidden, drawn)
        self.wait(1.2)

        with self.parallel():
            hidden.fade_in()
            drawn.create()
        self.wait(0.8)

        late = Circle(0.36, fill=ORANGE)
        late.place(anchor=BOTTOM, at=content.bottom + 0.45 * UP)
        late_note = Text(
            "wait(); add() → lifetime starts here", font_size=21, color=ORANGE
        )
        late_note.place(
            anchor=LEFT_CENTER, at=late.anchor(RIGHT_CENTER) + 0.35 * Vec2(1, 0)
        )
        self.add(late, late_note)
        self.wait(1.0)

        removed_note_at = immediate.anchor(RIGHT_CENTER) + 0.35 * Vec2(1, 0)
        immediate.remove()
        removed_note = Text(
            "remove() → absent from later snapshots", font_size=21, color=RED
        ).place(anchor=LEFT_CENTER, at=removed_note_at)
        self.add(removed_note)
        self.wait(1.2)
