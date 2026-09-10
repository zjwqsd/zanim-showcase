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
    def setup(self) -> None:
        self.canvas = Canvas(1280, 720, 92)
        self.fps = 60

        self.title = Text("One definition, two kinds of state", font_size=36)
        self.rule = Text(
            "raw object = initial definition; bound handle = Scene authored head",
            font_size=23,
            color=MUTED,
        )
        self.immediate = Square(1.25, fill=BLUE)
        self.hidden = Circle(0.68, fill=GREEN, opacity=0)
        self.drawn = Square(1.25, stroke=PURPLE, stroke_width=0.055, trim=0)
        self.immediate_label = card_label("add() = visible now")
        self.hidden_label = card_label("opacity=0; fade_in()")
        self.drawn_label = card_label("trim=0; create()")

        self.header = self.frame.top_region(height=1.25)
        self.content = self.frame.inset(0.65).below(self.header, gap=0.2)
        self.title.place(anchor=TOP, at=self.header.top + 0.24 * DOWN)
        self.rule.place(anchor=TOP, at=self.title.anchor(BOTTOM) + 0.14 * DOWN)
        Row(gap=2.7, at=self.content.center + 0.75 * UP).place(
            self.immediate, self.hidden, self.drawn
        )
        for obj, label in zip(
            (self.immediate, self.hidden, self.drawn),
            (self.immediate_label, self.hidden_label, self.drawn_label),
        ):
            label.place(anchor=TOP, at=obj.anchor(BOTTOM) + 0.42 * DOWN)

    def construct(self) -> None:
        self.add(
            self.title,
            self.rule,
            self.immediate,
            self.hidden,
            self.drawn,
            self.immediate_label,
            self.hidden_label,
            self.drawn_label,
        )
        immediate, hidden, drawn = map(
            self.on, (self.immediate, self.hidden, self.drawn)
        )
        self.wait(1.2)

        with self.parallel():
            hidden.fade_in()
            drawn.create()

        self.wait(0.8)

        late = Circle(0.36, fill=ORANGE)
        late_note = Text(
            "wait(); add() → lifetime starts here", font_size=21, color=ORANGE
        )
        late.place(anchor=BOTTOM, at=self.content.bottom + 0.45 * UP)
        late_note.place(
            anchor=LEFT_CENTER, at=late.anchor(RIGHT_CENTER) + 0.35 * Vec2(1, 0)
        )
        self.add(late, late_note)
        self.wait(1.0)

        self.remove(immediate)
        removed_note = Text(
            "remove() → absent from later snapshots", font_size=21, color=RED
        )
        removed_note.place(
            anchor=LEFT_CENTER,
            at=self.immediate.anchor(RIGHT_CENTER) + 0.35 * Vec2(1, 0),
        )
        self.add(removed_note)
        self.wait(1.2)
