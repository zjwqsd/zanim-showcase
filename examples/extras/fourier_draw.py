from __future__ import annotations

import argparse
from functools import lru_cache
from pathlib import Path

from zanim import (
    Canvas,
    Color,
    Easing,
    FourierEpicycles,
    Math,
    Polyline,
    Scene,
    Transform2D,
    affine2d,
    load_svg,
)
from zanim.extras.fourier import (
    contour_samples,
    dft,
    dominant_terms,
    epicycle_chain,
    point2,
    select_closed_contour,
)

ROOT = Path(__file__).resolve().parents[2]
EXAMPLES = Path(__file__).resolve().parents[1]
SVG = EXAMPLES / "assets/fourier_heart.svg"
OUTPUT = ROOT / "media/extras/fourier_draw.mp4"
FOLLOW_OUTPUT = ROOT / "media/extras/fourier_draw_follow.mp4"

SAMPLE_COUNT = 768
TERM_COUNT = 36
CIRCLE_SAMPLES = 28
TRACE_SAMPLES = 1000
START = 0.55
DRAW_DURATION = 6.2
HOLD = 0.45


class FourierDraw(Scene):
    def __init__(
        self,
        svg_path: Path = SVG,
        *,
        sample_count: int = SAMPLE_COUNT,
        term_count: int = TERM_COUNT,
        draw_duration: float = DRAW_DURATION,
        follow: bool = False,
        follow_zoom: float = 2.4,
        follow_lead: float = 0.08,
    ) -> None:
        super().__init__()
        self._arg_svg_path = svg_path
        self._arg_sample_count = sample_count
        self._arg_term_count = term_count
        self._arg_draw_duration = draw_duration
        self._arg_follow = follow
        self._arg_follow_zoom = follow_zoom
        self._arg_follow_lead = follow_lead

    def setup(self) -> None:
        self.canvas = Canvas(width=1920, height=1080, unit_size=104)
        self.fps = 60

        sample_count = self._arg_sample_count
        term_count = self._arg_term_count
        draw_duration = self._arg_draw_duration
        follow_zoom = self._arg_follow_zoom
        follow_lead = self._arg_follow_lead
        if sample_count < 16:
            raise ValueError("sample_count must be >= 16")
        if term_count < 1:
            raise ValueError("term_count must be positive")
        if draw_duration <= 0:
            raise ValueError("draw_duration must be positive")
        if follow_zoom <= 0:
            raise ValueError("follow_zoom must be positive")
        if follow_lead < 0:
            raise ValueError("follow_lead must be >= 0")

        document = load_svg(self._arg_svg_path)
        contour = select_closed_contour(document, strategy="longest")
        samples = contour_samples(contour, sample_count, tolerance=7e-4)
        terms = dominant_terms(dft(samples), term_count, keep_dc_first=True)

        def scene_phase(time: float) -> float:
            return max(0.0, min(1.0, (float(time) - START) / draw_duration))

        @lru_cache(maxsize=2048)
        def chain_at(time: float) -> tuple[complex, ...]:
            return epicycle_chain(terms, scene_phase(time))

        def tip_at_phase(phase: float) -> complex:
            return epicycle_chain(terms, phase)[-1]

        def follow_focus(time: float) -> complex:
            t = float(time)
            phase = scene_phase(t)
            if t <= START or t >= START + draw_duration:
                return tip_at_phase(phase)
            lead_phase = follow_lead / draw_duration
            window = min(0.012, 0.5 / max(1, len(terms)))
            offsets = (-window, -window * 0.5, 0.0, window * 0.5, window)
            weights = (1.0, 2.0, 3.0, 2.0, 1.0)
            center = phase + lead_phase
            values = [tip_at_phase((center + offset) % 1.0) for offset in offsets]
            return sum(value * weight for value, weight in zip(values, weights)) / sum(
                weights
            )

        def follow_view(time: float) -> Transform2D:
            focus = follow_focus(time)
            return Transform2D.scaling(follow_zoom) @ Transform2D.translation(
                -focus.real, -focus.imag
            )

        reference_points = tuple(point2(value) for value in samples)
        self.reference = Polyline(
            (*reference_points, reference_points[0]),
            stroke=Color(118, 129, 151, 80),
            stroke_width=0.018,
            z_index=-5,
        )
        self.epicycles = FourierEpicycles(
            terms,
            start_time=START,
            draw_duration=draw_duration,
            circle_samples=CIRCLE_SAMPLES,
            trace_samples=TRACE_SAMPLES,
        )
        self.formula = Math(
            "f(t) = sum_k c_k e^(2 pi i k t)",
            font_size=29,
            color=Color(223, 228, 240),
            position=(0, 4.25),
            z_index=10,
        )
        self.term_label = Math(
            f"N = {len(self.epicycles.visual_indices)}",
            font_size=21,
            color=Color(150, 163, 188),
            position=(0, 3.72),
            z_index=10,
        )
        self.follow_view = follow_view
        self.total_duration = START + draw_duration + HOLD
        self.info = {
            "samples": sample_count,
            "terms": len(terms),
            "visible_terms": len(self.epicycles.visual_indices),
            "trace_samples": TRACE_SAMPLES,
            "follow": self._arg_follow,
        }

    def construct(self) -> None:
        if self._arg_follow:
            self.camera.transform_function(
                lambda a: self.follow_view(a * self.total_duration),
                duration=self.total_duration,
                easing=Easing.LINEAR,
            )
        self.add(self.reference, self.epicycles)
        if not self._arg_follow:
            self.add(self.formula, self.term_label)
        self.wait(self.total_duration)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Draw one closed SVG contour with Fourier epicycles"
    )
    parser.add_argument(
        "--svg",
        type=Path,
        default=SVG,
        help="input SVG; the longest closed contour is used",
    )
    parser.add_argument("--output", type=Path, default=None)
    parser.add_argument(
        "--terms", type=int, default=TERM_COUNT, help="number of retained Fourier terms"
    )
    parser.add_argument(
        "--samples",
        type=int,
        default=SAMPLE_COUNT,
        help="uniform arc-length samples for the DFT",
    )
    parser.add_argument(
        "--duration",
        type=float,
        default=DRAW_DURATION,
        help="seconds for one complete drawing cycle",
    )
    parser.add_argument(
        "--follow", action="store_true", help="camera follows the drawing tip"
    )
    parser.add_argument(
        "--follow-zoom", type=float, default=2.4, help="fixed zoom for follow mode"
    )
    parser.add_argument(
        "--follow-lead",
        type=float,
        default=0.08,
        help="look-ahead in seconds for follow mode",
    )
    args = parser.parse_args()

    scene = FourierDraw(
        args.svg.resolve(),
        sample_count=args.samples,
        term_count=args.terms,
        draw_duration=args.duration,
        follow=args.follow,
        follow_zoom=args.follow_zoom,
        follow_lead=args.follow_lead,
    )
    scene._run_authoring_hooks()
    info = scene.info
    output_path = args.output or (FOLLOW_OUTPUT if args.follow else OUTPUT)
    output = scene.render(
        output_path, fps=60, workers=8, verify_random_access=True
    )
    print(output)
    print(
        f"duration={scene.duration:.2f}s samples={info['samples']} "
        f"terms={info['terms']} visible={info['visible_terms']} "
        f"trace={info['trace_samples']} follow={info['follow']} random-access=ok"
    )


if __name__ == "__main__":
    main()
