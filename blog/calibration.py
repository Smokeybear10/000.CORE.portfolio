from collections import defaultdict
from fractions import Fraction as F

Row = tuple[str, F, F, int]


def make_data(scores: list[F], gap: F) -> list[Row]:
    rows = []
    for p in scores:
        for group, rate in (("A", p - gap), ("B", p + gap)):
            positives = 1000 * rate
            assert positives.denominator == 1
            rows.extend(
                (group, p, rate, int(i < positives))
                for i in range(1000)
            )
    return rows


def calibration_error(rows: list[Row], by_group: bool = False) -> F:
    buckets = defaultdict(list)
    for group, p, _, y in rows:
        key = (group, p) if by_group else p
        buckets[key].append(y - p)
    return sum(abs(sum(errors)) for errors in buckets.values()) / len(rows)


def brier(rows: list[Row], oracle: bool = False) -> F:
    return sum(
        ((rate if oracle else p) - y) ** 2
        for _, p, rate, y in rows
    ) / len(rows)


def report(name: str, rows: list[Row]) -> None:
    print(name)
    print(f"  pooled calibration error: {float(calibration_error(rows)):.4f}")
    print(f"  grouped calibration error: {float(calibration_error(rows, True)):.4f}")
    print(f"  Brier: {float(brier(rows)):.4f}")
    print(f"  oracle Brier: {float(brier(rows, True)):.4f}")


if __name__ == "__main__":
    constant = make_data([F(1, 2)], F(3, 10))
    varied = make_data([F(1, 5), F(1, 2), F(4, 5)], F(3, 20))

    assert calibration_error(constant) == 0
    assert calibration_error(constant, True) == F(3, 10)
    assert brier(constant) == F(1, 4)
    assert brier(constant, True) == F(4, 25)
    assert calibration_error(varied) == 0
    assert calibration_error(varied, True) == F(3, 20)
    assert brier(varied) == F(19, 100)
    assert brier(varied, True) == F(67, 400)

    report("Constant score", constant)
    report("Three scores", varied)

    shifted_rate = F(1, 5) * F(1, 5) + F(4, 5) * F(4, 5)
    assert shifted_rate == F(17, 25)
    print(f"80% group B: event rate {float(shifted_rate):.2f}")
