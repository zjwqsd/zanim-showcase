#!/usr/bin/env python3
"""Generate deterministic browser data from the authoritative Python examples."""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ZANIM_ROOT = ROOT.parent / "zanim"
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ZANIM_ROOT / "python"))

from examples.extras.red_black_tree import build_trace, random_values
from examples.extras.simulation_collisions import (
    DURATION,
    SIM_HZ,
    initial_world,
    step_world,
)
from examples.extras.sorting_algorithms import ALGORITHMS, random_permutation
from examples.janim.balls_collision_example import (
    FPS as JANIM_BALLS_FPS,
    initial_world as janim_balls_initial_world,
    step_world as janim_balls_step_world,
)


def red_black_data() -> dict:
    values = random_values(19, 12)
    trace = build_trace(values)
    return {
        "values": values,
        "steps": [
            {
                "kind": step.kind,
                "message": step.message,
                "active": step.active,
                "nodes": [
                    {
                        "value": node.value,
                        "red": node.red,
                        "parent": node.parent,
                        "depth": node.depth,
                    }
                    for node in step.nodes
                ],
            }
            for step in trace
        ],
    }


def sorting_data() -> dict:
    initial = random_permutation(24, 23)
    traces = []
    for key, factory in ALGORITHMS:
        trace = factory(initial)
        traces.append(
            {
                "key": key,
                "name": trace.name,
                "subtitle": trace.subtitle,
                "steps": [
                    {
                        "kind": step.kind,
                        "values": step.values,
                        "active": step.active,
                        "pivot": step.pivot,
                        "settled": step.settled,
                    }
                    for step in trace.steps
                ],
            }
        )
    return {"initial": initial, "traces": traces}


def collision_data() -> dict:
    sample_hz = 30
    dt = 1.0 / SIM_HZ
    steps_per_sample = round(SIM_HZ / sample_hz)
    world = initial_world()
    frames = []
    samples = round(DURATION * sample_hz) + 1
    for sample in range(samples):
        frames.append(
            [
                [round(body.position.x, 6), round(body.position.y, 6)]
                for body in world.bodies
            ]
        )
        if sample == samples - 1:
            break
        for _ in range(steps_per_sample):
            step_world(world, dt)
    return {"fps": sample_hz, "duration": DURATION, "frames": frames}


def janim_balls_data() -> dict:
    sample_hz = int(JANIM_BALLS_FPS)
    dt = 1.0 / JANIM_BALLS_FPS
    simulation_duration = 10.0
    world = janim_balls_initial_world()
    frames = []
    samples = round(simulation_duration * sample_hz) + 1
    for sample in range(samples):
        frames.append(
            [
                [round(float(pos[0]), 6), round(float(pos[1]), 6)]
                for pos in world.positions
            ]
        )
        if sample == samples - 1:
            break
        janim_balls_step_world(world, dt)
    return {
        "fps": sample_hz,
        "sceneDuration": 12.0,
        "simulationDuration": simulation_duration,
        "frames": frames,
    }


def main() -> None:
    output = ROOT / "public" / "generated" / "gallery-data.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "redBlack": red_black_data(),
        "sorting": sorting_data(),
        "collisions": collision_data(),
        "janimBalls": janim_balls_data(),
    }
    output.write_text(json.dumps(payload, separators=(",", ":")), encoding="utf-8")
    print(output, output.stat().st_size)


if __name__ == "__main__":
    main()
