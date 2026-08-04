from app.engine.conditioning import build_conditioning_plan
from app.models.schemas import (
    AgilityMode,
    AthleteLevel,
    BlockType,
    ConditioningPlanInput,
    EnergySystemTarget,
    Sport,
)


def make_input(**overrides) -> ConditioningPlanInput:
    defaults = dict(
        athlete_id="athlete-1",
        level=AthleteLevel.intermediate,
        primary_sport=Sport.padel,
        block_type=None,
        weeks_until_event=None,
    )
    defaults.update(overrides)
    return ConditioningPlanInput(**defaults)


def test_beginner_gets_closed_agility_drills():
    result = build_conditioning_plan(make_input(level=AthleteLevel.beginner))
    assert result.agility_mode == AgilityMode.chiuso


def test_advanced_gets_reactive_agility_drills():
    result = build_conditioning_plan(make_input(level=AthleteLevel.advanced))
    assert result.agility_mode == AgilityMode.reattivo


def test_sprint_recovery_is_always_full_regardless_of_block():
    for block in (BlockType.accumulo, BlockType.trasmutazione, BlockType.realizzazione, None):
        result = build_conditioning_plan(make_input(block_type=block))
        assert "pieno" in result.sprint.recovery


def test_trasmutazione_targets_glycolytic_tolerance_when_no_event_looms():
    result = build_conditioning_plan(make_input(block_type=BlockType.trasmutazione, weeks_until_event=None))
    assert result.rsa.energy_system == EnergySystemTarget.glicolitico
    assert EnergySystemTarget.glicolitico in result.energy_system_targets
    # capacità band ~1:3-1:5
    ratio = result.rsa.rest_seconds / result.rsa.work_seconds
    assert 3 <= ratio <= 5


def test_non_trasmutazione_blocks_target_alactic_quality():
    for block in (BlockType.accumulo, BlockType.realizzazione, None):
        result = build_conditioning_plan(make_input(block_type=block))
        assert result.rsa.energy_system == EnergySystemTarget.fosfageni
        assert EnergySystemTarget.glicolitico not in result.energy_system_targets
        # qualità band ~1:12-1:20
        ratio = result.rsa.rest_seconds / result.rsa.work_seconds
        assert 12 <= ratio <= 20


def test_imminent_event_suspends_glycolytic_stimulus_even_in_trasmutazione():
    result = build_conditioning_plan(
        make_input(block_type=BlockType.trasmutazione, weeks_until_event=1)
    )
    assert result.rsa.energy_system == EnergySystemTarget.fosfageni
    assert EnergySystemTarget.glicolitico not in result.energy_system_targets
    assert "evento" in result.explanation.lower() or "evento" in result.rsa.note.lower()


def test_energy_system_targets_always_include_alactic_and_aerobic_base():
    result = build_conditioning_plan(make_input())
    assert EnergySystemTarget.fosfageni in result.energy_system_targets
    assert EnergySystemTarget.ossidativo in result.energy_system_targets


def test_interference_note_is_always_present():
    result = build_conditioning_plan(make_input())
    assert result.interference_note
